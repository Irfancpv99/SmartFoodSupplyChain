import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicMenuIngredient {
  id: string;
  name: string;
  origin: string | null;
  quantity: number | null;
  unit: string | null;
  document: {
    id: string;
    ddtNumber: string;
    status: string;
    deliveryDate: string | null;
    blockchainTxId: string | null;
    vendor: {
      name: string;
      business_name: string | null;
    } | null;
  } | null;
}

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  allergens: string[] | null;
  ingredients: PublicMenuIngredient[];
}

export interface PublicMenuData {
  verified: boolean;
  menu: {
    id: string;
    menuId: string;
    name: string;
    date: string;
    mealType: string;
    school: {
      name: string;
      city: string | null;
      address: string | null;
    } | null;
    items: PublicMenuItem[];
  };
  documents: Array<{
    id: string;
    ddtNumber: string;
    deliveryDate: string | null;
    status: string;
    hash: string | null;
    blockchainTxId: string | null;
    vendor: {
      name: string;
      business_name: string | null;
    } | null;
  }>;
  verification: {
    privateChain: boolean;
    publicChain: boolean;
    menuHash: string | null;
    lastVerified: string;
    blockchainRecord: {
      txId: string | null;
      blockNumber: number | null;
      timestamp: string;
    } | null;
  };
}

export const usePublicMenu = (menuId: string | undefined) => {
  return useQuery({
    queryKey: ['public-menu', menuId],
    queryFn: async (): Promise<PublicMenuData> => {
      if (!menuId) {
        throw new Error('Menu ID is required');
      }

      const { data, error } = await supabase.functions.invoke('verify-menu', {
        body: { menuId }
      });

      if (error) {
        console.error('Error fetching menu:', error);
        throw new Error('Failed to load menu');
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Menu not found');
      }

      return data as PublicMenuData;
    },
    enabled: !!menuId,
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
