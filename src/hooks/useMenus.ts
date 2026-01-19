import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Menu {
  id: string;
  menu_id: string;
  school_id: string;
  date: string;
  name: string;
  description: string | null;
  meal_type: string;
  is_published: boolean;
  qr_code_url: string | null;
  created_by: string | null;
  schools?: { name: string };
  menu_items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  menu_id: string;
  name: string;
  description: string | null;
  category: string | null;
  allergens: string[] | null;
  order_index: number;
}

export function useMenus(schoolId?: string) {
  return useQuery({
    queryKey: ['menus', schoolId],
    queryFn: async () => {
      let query = supabase
        .from('menus')
        .select(`
          *,
          schools(name),
          menu_items(*)
        `)
        .order('date', { ascending: false });

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Menu[];
    },
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      schoolId,
      date,
      name,
      mealType,
      items,
    }: {
      schoolId: string;
      date: string;
      name: string;
      mealType: string;
      items: Array<{
        name: string;
        category?: string;
        allergens?: string[];
        ingredients: Array<{
          ingredientId: string;
          quantity?: number;
          unit?: string;
        }>;
      }>;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Generate menu ID
      const menuId = `MENU-${date.replace(/-/g, '')}-${Date.now().toString(36).toUpperCase()}`;

      // Create menu
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .insert({
          menu_id: menuId,
          school_id: schoolId,
          date,
          name,
          meal_type: mealType,
          is_published: false,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (menuError) throw menuError;

      // Create menu items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const { data: menuItem, error: itemError } = await supabase
          .from('menu_items')
          .insert({
            menu_id: menu.id,
            name: item.name,
            category: item.category,
            allergens: item.allergens,
            order_index: i,
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // Link ingredients
        for (const ing of item.ingredients) {
          await supabase
            .from('menu_item_ingredients')
            .insert({
              menu_item_id: menuItem.id,
              ingredient_id: ing.ingredientId,
              quantity: ing.quantity,
              unit: ing.unit,
            });
        }
      }

      return menu;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu created successfully!');
    },
    onError: (error) => {
      console.error('Menu creation error:', error);
      toast.error('Failed to create menu');
    },
  });
}

export function usePublishMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuId: string) => {
      // First, generate hash for the menu
      const { data: menu } = await supabase
        .from('menus')
        .select(`
          *,
          menu_items(
            *,
            menu_item_ingredients(*, ingredients(*))
          )
        `)
        .eq('id', menuId)
        .single();

      if (!menu) throw new Error('Menu not found');

      // Anchor to blockchain
      await supabase.functions.invoke('anchor-blockchain', {
        body: {
          referenceId: menuId,
          referenceTable: 'menus',
          data: menu,
        },
      });

      // Generate QR code URL using the menu_id (human-readable ID)
      const baseUrl = window.location.origin;
      const qrCodeUrl = `${baseUrl}/menu/${menu.menu_id}`;

      // Update menu as published with QR code URL
      const { data, error } = await supabase
        .from('menus')
        .update({ 
          is_published: true,
          qr_code_url: qrCodeUrl
        })
        .eq('id', menuId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu published and anchored to blockchain!');
    },
    onError: (error) => {
      console.error('Publish error:', error);
      toast.error('Failed to publish menu');
    },
  });
}

export function useVerifyMenu() {
  return useMutation({
    mutationFn: async (menuId: string) => {
      const { data, error } = await supabase.functions.invoke('verify-menu', {
        body: { menuId },
      });
      if (error) throw error;
      return data;
    },
  });
}
