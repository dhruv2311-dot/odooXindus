import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '../config/supabaseClient';

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabaseClient
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('Realtime push received:', payload.table);
          if (payload.table === 'products') queryClient.invalidateQueries({ queryKey: ['products'] });
          if (payload.table === 'stock') queryClient.invalidateQueries({ queryKey: ['stock'] });
          if (payload.table === 'receipts' || payload.table === 'receipt_items') queryClient.invalidateQueries({ queryKey: ['receipts'] });
          if (payload.table === 'deliveries' || payload.table === 'delivery_items') queryClient.invalidateQueries({ queryKey: ['deliveries'] });
          if (payload.table === 'stock_moves') queryClient.invalidateQueries({ queryKey: ['stock-moves'] });
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [queryClient]);
}
