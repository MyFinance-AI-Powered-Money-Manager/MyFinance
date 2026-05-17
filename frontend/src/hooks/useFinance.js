import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '../lib/api';
import { config } from '../lib/config';
import { showError, showSuccess, showWarning } from '../lib/toast';

const unwrapData = (response) => response?.data?.data ?? response?.data ?? response;

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const toNumber = (...values) => Number(firstDefined(...values) ?? 0);

const normalizeWallet = (wallet) => ({
  ...wallet,
  id: wallet?.id,
  name: firstDefined(wallet?.name, wallet?.label, wallet?.type, 'Wallet'),
  type: wallet?.type ?? 'CASH',
  balance: toNumber(wallet?.balance, wallet?.amount),
});

const normalizeBudget = (budget) => ({
  ...budget,
  id: budget?.id,
  category: budget?.category ?? 'OTHER',
  limit_amount: toNumber(budget?.limit_amount, budget?.limit, budget?.amount),
  limit: toNumber(budget?.limit_amount, budget?.limit, budget?.amount),
  month_period: firstDefined(budget?.month_period, budget?.monthPeriod, null),
  monthPeriod: firstDefined(budget?.month_period, budget?.monthPeriod, null),
  spent: toNumber(budget?.spent, budget?.used),
});

const normalizeTransaction = (tx) => {
  const totalAmount = toNumber(tx?.total_amount, tx?.amount);
  const transactionDate = firstDefined(tx?.transaction_date, tx?.date, tx?.created_at, tx?.createdAt, null);
  const rawType = String(tx?.type ?? 'EXPENSE').toUpperCase();

  return {
    ...tx,
    id: tx?.id,
    amount: totalAmount,
    total_amount: totalAmount,
    date: transactionDate,
    transaction_date: transactionDate,
    wallet_id: tx?.wallet_id ?? tx?.walletId ?? null,
    walletId: tx?.wallet_id ?? tx?.walletId ?? null,
    wallet_name: tx?.wallet_name ?? '',
    category: tx?.category ?? 'OTHER',
    subcategory: tx?.subcategory ?? '',
    description: tx?.description ?? tx?.label ?? '',
    label: tx?.description ?? tx?.label ?? tx?.subcategory ?? 'Transaksi',
    type: rawType,
  };
};

const normalizeTransactionPayload = (data) => ({
  wallet_id: data?.wallet_id ?? data?.walletId ?? null,
  type: String(data?.type ?? 'EXPENSE').toUpperCase(),
  total_amount: toNumber(data?.total_amount, data?.amount),
  category: String(data?.category ?? 'OTHER').toUpperCase(),
  subcategory: data?.subcategory ?? '',
  description: data?.description ?? '',
  transaction_date: data?.transaction_date ?? data?.date ?? new Date().toISOString().slice(0, 10),
  items: data?.items,
  receipt_data: data?.receipt_data,
  image_url: data?.image_url ?? '',
});

const normalizeInsight = (insight) => {
  const raw = insight?.data?.data ?? insight?.data ?? insight;

  if (typeof raw === 'string') {
    return raw;
  }

  if (!raw || typeof raw !== 'object') {
    return null;
  }

  return firstDefined(raw.data, raw.ai_insight, raw.insight, raw.message, raw.recommendation, raw.text, raw);
};

const normalizeMonthlyInsight = (insight) => {
  const raw = insight?.data?.data ?? insight?.data ?? insight;

  if (!raw || typeof raw !== 'object') {
    return null;
  }

  return {
    ...raw,
    period: firstDefined(raw.period, null),
    health_score: toNumber(raw.health_score),
    predicted_cashflow: toNumber(raw.predicted_cashflow),
    total_spent: toNumber(raw.total_spent),
    total_budget: toNumber(raw.total_budget),
    overbudget_risk: firstDefined(raw.overbudget_risk, 'unknown'),
    money_leak: firstDefined(raw.money_leak, ''),
    ai_insight: firstDefined(raw.ai_insight, raw.insight, raw.message, raw.recommendation, raw.text, ''),
    categories: firstDefined(raw.categories, raw.raw_analysis_data, []),
  };
};

// ────────────── Wallets ──────────────

export const useWallets = (options = {}) => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const raw = unwrapData(await api.get('/wallets'));
      return Array.isArray(raw) ? raw.map(normalizeWallet) : [];
    },
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Dompet berhasil dibuat');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Gagal membuat dompet');
    },
  });
};

export const useUpdateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/wallets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Dompet berhasil diperbarui');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Gagal memperbarui dompet');
    },
  });
};

export const useDeleteWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/wallets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Dompet berhasil dihapus');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Gagal menghapus dompet');
    },
  });
};

export const useTransferWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/wallets/transfer', {
      source_wallet_id: data.source_wallet_id,
      destination_wallet_id: data.destination_wallet_id,
      amount: Number(data.amount),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Transfer berhasil dicatat');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Gagal melakukan transfer');
    },
  });
};

// ────────────── Budgets ──────────────

export const useBudgets = (options = {}) => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const raw = unwrapData(await api.get('/budgets'));
      return Array.isArray(raw) ? raw.map(normalizeBudget) : [];
    },
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
      showSuccess('Anggaran berhasil dibuat');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Gagal membuat anggaran');
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/budgets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess('Anggaran berhasil diperbarui');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Gagal memperbarui anggaran');
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess('Anggaran berhasil dihapus');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Gagal menghapus anggaran');
    },
  });
};

// ────────────── Transactions ──────────────

export const useTransactions = (options = {}) => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const raw = unwrapData(await api.get('/transactions'));
      return Array.isArray(raw) ? raw.map(normalizeTransaction) : [];
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const payload = normalizeTransactionPayload(data);
      const response = await api.post('/transactions', payload);
      return response.data;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['wallets'] });

      const previous = queryClient.getQueryData(['wallets']);

      try {
        const walletId = String(data?.wallet_id ?? data?.walletId ?? '');
        const amount = Number(data?.total_amount ?? data?.amount ?? 0);
        const type = String(data?.type ?? 'EXPENSE').toUpperCase();

        if (walletId && Array.isArray(previous)) {
          const updated = previous.map((w) => {
            const id = String(w?.id ?? w?.walletId ?? w?._id ?? '');
            if (id === walletId) {
              const cur = Number(w?.balance ?? w?.amount ?? 0);
              const delta = Math.abs(amount) * (type === 'INCOME' ? 1 : -1);
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
    onSuccess: (responseData) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });

      showSuccess('Transaksi berhasil dicatat');

      if (responseData?.is_overbudget) {
        setTimeout(() => {
          showWarning(
            '⚠️ Peringatan: Pengeluaran kamu sudah melebihi batas anggaran untuk kategori ini!',
            { duration: 8000 }
          );
        }, 500);
      }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['wallets'], context.previous);
      }
      showError(error.response?.data?.message || 'Gagal mencatat transaksi');
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess('Transaksi berhasil dihapus dan saldo dikembalikan');
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Gagal menghapus transaksi');
    },
  });
};

// ────────────── Dashboard Summary ──────────────

export const useDashboardSummary = (options = {}) => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const raw = unwrapData(await api.get('/dashboard/summary'));
      return {
        current_balance: Number(raw?.current_balance ?? 0),
        total_income: Number(raw?.total_income ?? 0),
        total_expense: Number(raw?.total_expense ?? 0),
        ds_metrics: raw?.ds_metrics ?? null,
      };
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// Scan and insights

export const useScanReceipt = () => {
  return useMutation({
    mutationFn: async (formData) => {
      if (!config.aiApiUrl || !config.scanEndpoint) {
        throw new Error('Endpoint scan AI belum dikonfigurasi. Cek VITE_AI_API_URL dan VITE_SCAN_ENDPOINT.');
      }

      const url = `${config.aiApiUrl.replace(/\/+$/, '')}/${config.scanEndpoint}`;

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-internal-service-key': config.aiServiceKey,
        },
        timeout: 30000,
      });

      return response.data;
    },
    onError: (error) => {
      showError(error.response?.data?.message || error.response?.data?.detail || error.message || 'Gagal scan struk');
    },
  });
};

export const useUploadReceipt = () => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/transactions/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
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

export const useMonthlyFinancialInsight = (period, options = {}) => {
  const { enabled: optionEnabled = true, ...restOptions } = options;

  return useQuery({
    queryKey: ['monthly-insight', period],
    queryFn: async () => normalizeMonthlyInsight(await api.get('/insights', { params: { month_period: period } })),
    enabled: Boolean(period) && optionEnabled,
    staleTime: 5 * 60 * 1000,
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
