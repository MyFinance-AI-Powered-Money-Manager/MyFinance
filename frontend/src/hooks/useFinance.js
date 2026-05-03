import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { showError, showSuccess } from '../lib/toast';
import { config } from '../lib/config';

const unwrapData = (response) => response?.data ?? response;

// Wallets
export const useWallets = (options = {}) => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => unwrapData(await api.get('/wallets')),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/wallets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      showSuccess('Wallet created successfully');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to create wallet');
    },
  });
};

export const useUpdateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/wallets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      showSuccess('Wallet updated successfully');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to update wallet');
    },
  });
};

export const useDeleteWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/wallets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      showSuccess('Wallet deleted successfully');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to delete wallet');
    },
  });
};

// Budgets
export const useBudgets = (options = {}) => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => unwrapData(await api.get('/budgets')),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess('Budget created successfully');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to create budget');
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/budgets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess('Budget updated successfully');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to update budget');
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess('Budget deleted successfully');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to delete budget');
    },
  });
};

// Transactions
export const useTransactions = (options = {}) => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => unwrapData(await api.get('/transactions')),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/transactions', data),
    onSuccess: (res) => {
      const newItem = res?.data ?? res;

      if (config.useTransactionCachePatch) {
        // mark as newly created for UI highlight
        const patched = { ...(newItem || {}), __new: true };

        try {
          queryClient.setQueryData(['transactions'], (old) => {
            if (!old) return Array.isArray(patched) ? patched : [patched];
            if (Array.isArray(old)) {
              return [patched, ...old];
            }
            if (old && Array.isArray(old.data)) {
              return { ...old, data: [patched, ...old.data] };
            }
            return old;
          });

          // auto-clear the __new flag after 6 seconds so highlight disappears
          setTimeout(() => {
            try {
              queryClient.setQueryData(['transactions'], (old) => {
                if (!old) return old;
                if (Array.isArray(old)) {
                  return old.map((it) => ({ ...it, __new: false }));
                }
                if (old && Array.isArray(old.data)) {
                  return { ...old, data: old.data.map((it) => ({ ...it, __new: false })) };
                }
                return old;
              });
            } catch {
              /* ignore */
            }
          }, 6000);
        } catch {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }
      } else {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      }

      showSuccess('Transaction created successfully');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to create transaction');
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      showSuccess('Transaction deleted successfully');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to delete transaction');
    },
  });
};

// AI Services
export const useScanReceipt = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
      return unwrapData(await api.post('/ai/scan', payload, isFormData ? {
        headers: { 'Content-Type': 'multipart/form-data' },
      } : {}));
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to scan receipt');
    },
  });
};

export const useCheckOverbudget = () => {
  return useMutation({
    mutationFn: (payload) => api.post('/data/overbudget/check', payload),
    onSuccess: () => {
      showSuccess('Overbudget check completed');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to check overbudget');
    },
  });
};
