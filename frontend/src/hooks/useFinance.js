import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { config } from '../lib/config';
import { showError, showSuccess } from '../lib/toast';

const unwrapData = (response) => response?.data?.data ?? response?.data ?? response;

const normalizeWallet = (wallet) => ({
  ...wallet,
  id: wallet?.id,
  name: wallet?.name ?? wallet?.label ?? wallet?.type ?? 'Wallet',
  type: wallet?.type ?? 'cash',
  balance: Number(wallet?.balance ?? wallet?.amount ?? 0),
});

const normalizeBudget = (budget) => ({
  ...budget,
  id: budget?.id,
  category: budget?.category ?? 'OTHER',
  limit_amount: Number(budget?.limit_amount ?? budget?.limit ?? budget?.amount ?? 0),
  limit: Number(budget?.limit_amount ?? budget?.limit ?? budget?.amount ?? 0),
  month_period: budget?.month_period ?? budget?.monthPeriod ?? null,
  monthPeriod: budget?.month_period ?? budget?.monthPeriod ?? null,
  spent: Number(budget?.spent ?? budget?.used ?? 0),
});

const normalizeTransaction = (tx) => {
  const totalAmount = Number(tx?.total_amount ?? tx?.amount ?? 0);
  const transactionDate = tx?.transaction_date ?? tx?.date ?? tx?.created_at ?? tx?.createdAt ?? null;

  return {
    ...tx,
    id: tx?.id,
    amount: totalAmount,
    total_amount: totalAmount,
    date: transactionDate,
    transaction_date: transactionDate,
    wallet_id: tx?.wallet_id ?? tx?.walletId ?? null,
    walletId: tx?.wallet_id ?? tx?.walletId ?? null,
    category: tx?.category ?? tx?.subcategory ?? tx?.type ?? 'Kategori',
    subcategory: tx?.subcategory ?? tx?.category ?? '',
    description: tx?.description ?? tx?.label ?? '',
    label: tx?.label ?? tx?.description ?? tx?.subcategory ?? 'Transaksi',
    type: String(tx?.type ?? (totalAmount >= 0 ? 'income' : 'expense')).toLowerCase(),
  };
};

const normalizeTransactionPayload = (data) => ({
  wallet_id: data?.wallet_id ?? data?.walletId ?? null,
  type: String(data?.type ?? 'expense').toLowerCase(),
  total_amount: Number(data?.total_amount ?? data?.amount ?? 0),
  category: data?.category ?? data?.subcategory ?? 'OTHER',
  subcategory: data?.subcategory ?? data?.category ?? data?.description ?? 'OTHER',
  description: data?.description ?? '',
  transaction_date: data?.transaction_date ?? data?.date ?? new Date().toISOString().slice(0, 10),
  items: data?.items,
  receipt_data: data?.receipt_data,
});

const normalizeInsight = (insight) => {
  const raw = insight?.data?.data ?? insight?.data ?? insight;

  if (typeof raw === 'string') {
    return raw;
  }

  if (!raw || typeof raw !== 'object') {
    return null;
  }

  return raw.data ?? raw.ai_insight ?? raw.insight ?? raw.message ?? raw.recommendation ?? raw.text ?? raw;
};

// Wallets
export const useWallets = (options = {}) => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => unwrapData(await api.get('/wallets')).map(normalizeWallet),
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
    queryFn: async () => unwrapData(await api.get('/budgets')).map(normalizeBudget),
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
    queryFn: async () => unwrapData(await api.get('/transactions')).map(normalizeTransaction),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/transactions', normalizeTransactionPayload(data)),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['wallets'] });

      const previous = queryClient.getQueryData(['wallets']);

      try {
        const walletId = String(data?.wallet_id ?? data?.walletId ?? data?.walletId ?? '');
        const amount = Number(data?.total_amount ?? data?.amount ?? 0);
        const type = String(data?.type ?? 'expense').toLowerCase();

        if (walletId && Array.isArray(previous)) {
          const updated = previous.map((w) => {
            const id = String(w?.id ?? w?.walletId ?? w?._id ?? '');
            if (id === walletId) {
              const cur = Number(w?.balance ?? w?.amount ?? 0);
              const delta = Math.abs(amount) * (type === 'income' ? 1 : -1);
              return { ...w, balance: cur + delta };
            }
            return w;
          });

          queryClient.setQueryData(['wallets'], updated);
        }
      } catch {
        // ignore optimistic update errors
      }

      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });

      showSuccess('Transaction created successfully');
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['wallets'], context.previous);
      }
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
    mutationFn: async (formData) => {
      if (!config.scanEndpoint) {
        throw new Error('Endpoint scan belum dikonfigurasi di frontend ini.');
      }

      return api.post(config.scanEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onError: (error) => {
      showError(error.response?.data?.message || error.message || 'Failed to scan receipt');
    },
  });
};

export const useFinancialInsights = (walletId, period = 'monthly', options = {}) => {
  const { enabled: optionEnabled = true, ...restOptions } = options;

  return useQuery({
    queryKey: ['insights', walletId, period],
    queryFn: async () => normalizeInsight(await api.get('/insights', { params: { wallet_id: walletId, period } })),
    enabled: Boolean(walletId) && optionEnabled,
    ...restOptions,
  });
};

export const useCheckOverbudget = () => {
  return useMutation({
    mutationFn: async (payload) => {
      if (!config.overbudgetEndpoint) {
        throw new Error('Endpoint overbudget belum dikonfigurasi di frontend ini.');
      }

      return api.post(config.overbudgetEndpoint, payload);
    },
    onSuccess: () => {
      showSuccess('Overbudget check completed');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to check overbudget');
    },
  });
};
