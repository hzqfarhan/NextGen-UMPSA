"use client"

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function StoreSyncHandler() {
  useEffect(() => {
    const syncFromDB = async () => {
      try {
        const username = useStore.getState().user.name || 'Aiman';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`/api/sync?username=${username}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await res.json();
        if (data.success && data.data) {
          const dbState = data.data;
          const localState = useStore.getState();

          // Helper to merge arrays by unique 'id'
          const mergeById = (localArr: any[] = [], dbArr: any[] = []) => {
            const map = new Map();
            // Fill with database items first
            dbArr.forEach(item => {
              if (item && item.id) map.set(item.id, item);
            });
            // Merge local items if they don't exist in DB
            localArr.forEach(item => {
              if (item && item.id) {
                if (!map.has(item.id)) {
                  map.set(item.id, item);
                }
              }
            });
            return Array.from(map.values());
          };

          const mergedPockets = mergeById(localState.savingsPockets, dbState.savingsPockets);
          const mergedTransactions = mergeById(localState.transactions, dbState.transactions);
          const mergedBills = mergeById(localState.bills, dbState.bills);

          // Determine current balance, defaulting to localState if it's more active/different
          const currentBalance = localState.user?.currentBalance !== undefined
            ? localState.user.currentBalance
            : (dbState.user?.currentBalance || 420);

          // Update Zustand store with merged state
          useStore.setState({
            ...dbState,
            savingsPockets: mergedPockets,
            transactions: mergedTransactions,
            bills: mergedBills,
            user: {
              ...(dbState.user || localState.user),
              currentBalance
            }
          });
        }
      } catch (err) {
        console.error('[StoreSyncHandler] failed to sync state from database:', err);
      }
    };
    
    syncFromDB();
  }, []);

  return null;
}
