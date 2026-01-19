import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface UserWithRoles {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: string[];
}

export function useAllUsers() {
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['all-users'] });
        }
      )
      .subscribe();

    const rolesChannel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['all-users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(rolesChannel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = profiles.map(profile => {
        const roles = userRoles
          .filter(role => role.user_id === profile.user_id)
          .map(role => role.role);

        return {
          id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          roles,
        };
      });

      return usersWithRoles;
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  const { user, refreshRoles } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'school_admin' | 'vendor' }) => {
      // First, insert the role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (roleError) throw roleError;

      // If vendor role is assigned, ensure a vendor profile exists for this user
      if (role === 'vendor') {
        // Check if vendor profile already exists
        const { data: existingVendor } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!existingVendor) {
          // Get user profile info for vendor name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', userId)
            .single();

          // Create a new vendor profile linked to this user
          const { error: vendorError } = await supabase
            .from('vendors')
            .insert({
              user_id: userId,
              name: profile?.full_name || profile?.email || 'New Vendor',
              contact_email: profile?.email,
            });

          if (vendorError) throw vendorError;
        }
      }

      // If school_admin role is assigned, ensure a school profile exists for this user
      if (role === 'school_admin') {
        // Check if school profile already exists
        const { data: existingSchool } = await supabase
          .from('schools')
          .select('id')
          .eq('admin_user_id', userId)
          .maybeSingle();

        if (!existingSchool) {
          // Get user profile info for school contact
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', userId)
            .single();

          // Create a new school profile linked to this user
          const { error: schoolError } = await supabase
            .from('schools')
            .insert({
              admin_user_id: userId,
              name: `${profile?.full_name || 'New'}'s School`,
              contact_email: profile?.email,
            });

          if (schoolError) throw schoolError;
        }
      }

      // If the role was assigned to the currently logged-in user, refresh their roles
      if (user && userId === user.id) {
        try {
          await refreshRoles();
          console.log('Roles refreshed successfully after assignment');
        } catch (error) {
          console.error('Failed to refresh roles after assignment:', error);
          // Show a warning but don't fail the mutation
          toast.warning('Role assigned but failed to refresh. Please refresh the page.', {
            description: 'Your new role is active but you may need to reload.',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      queryClient.invalidateQueries({ queryKey: ['school'] });
      toast.success('Role assigned successfully');
    },
    onError: (error) => {
      console.error('Failed to assign role:', error);
      toast.error('Failed to assign role', {
        description: error.message || 'Please try again or contact support.',
      });
    },
    retry: 2, // Retry up to 2 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'school_admin' | 'vendor' }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast.success('Role removed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to remove role: ${error.message}`);
    },
  });
}
