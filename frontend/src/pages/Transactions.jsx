import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowUp,
  ArrowUpRight,
  Car,
  Search,
  ShoppingBag,
  Scan,
  Trash2,
  Utensils,
  Wallet,
} from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { useLanguage } from "../context/LanguageContext";
import { LoadingScreen } from "../components/LoadingScreen";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useWallets,
} from "../hooks/useFinance";
import { TransactionFormModal } from "../components/TransactionFormModal";
import { Layout } from "../components/layout/Layout";

const Transactions = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeDate, setActiveDate] = React.useState("month");
  const [activeType, setActiveType] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [formType, setFormType] = React.useState("INCOME");
  const [openTransactionModal, setOpenTransactionModal] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState(null);
  const { data, isLoading, error } = useTransactions();
  const { data: walletsData } = useWallets();
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const isSameDay = (left, right) => {
    if (!left || !right) {
      return false;
    }

    return left.toDateString() === right.toDateString();
  };

  const daysBetween = (left, right) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const startOfLeft = new Date(
      left.getFullYear(),
      left.getMonth(),
      left.getDate(),
    );
    const startOfRight = new Date(
      right.getFullYear(),
      right.getMonth(),
      right.getDate(),
    );
    return Math.round((startOfRight - startOfLeft) / msPerDay);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <Layout>
        <div className="finance-card p-8 text-center md:p-10">
          <h2 className="text-2xl font-extrabold text-red-600">
            {t("transactions_load_failed")}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {t("transactions_load_hint")}
          </p>
        </div>
      </Layout>
    );
  }

  const transactions = Array.isArray(data) ? data : (data?.data ?? []);
  const wallets = Array.isArray(walletsData)
    ? walletsData
    : (walletsData?.data ?? []);

  if (wallets.length === 0) {
    return (
      <Layout>
        <div className="finance-card mx-auto max-w-2xl p-8 text-center md:p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DDF4E2] text-finance-700">
            <Wallet className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
            Buat Dompet Dulu
          </h1>
          <p className="mt-3 text-sm leading-7 text-zinc-500 dark:text-[#B0B8CC]">
            Sebelum mencatat transaksi, kamu perlu membuat dompet terlebih
            dahulu.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() =>
                navigate("/dashboard", { state: { openWalletModal: true } })
              }
              className="rounded-[18px] bg-finance-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-finance-800"
            >
              Buat Dompet Sekarang
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-[18px] border border-[#D9E5CF] bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-[#F6FAF1]"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const getIcon = (tx) => {
    const txType = String(tx.type).toUpperCase();
    if (txType === "TRANSFER" && tx.description === "Transfer Keluar")
      return ArrowUp;
    if (txType === "TRANSFER" && tx.description === "Transfer Masuk")
      return ArrowDown;
    const combined =
      `${tx.category} ${tx.subcategory} ${tx.description}`.toLowerCase();
    if (combined.includes("makan") || combined.includes("minum"))
      return Utensils;
    if (combined.includes("transport")) return Car;
    if (txType === "INCOME") return Wallet;
    return ShoppingBag;
  };

  const normalized = transactions
    .map((tx, index) => {
      const txType = String(tx.type).toUpperCase();
      const isTransferOut =
        txType === "TRANSFER" && tx.description === "Transfer Keluar";
      const isTransferIn =
        txType === "TRANSFER" && tx.description === "Transfer Masuk";

      return {
        id: tx.id ?? index,
        icon: getIcon(tx),
        label: tx.description || tx.label || t("transaction"),
        category: tx.subcategory || tx.category || txType,
        wallet_name: tx.wallet_name || "",
        amount: Number(tx.amount ?? 0),
        type: txType,
        date: tx.date || tx.createdAt || "",
        isTransferOut,
        isTransferIn,
      };
    })
    .filter((tx) => {
      const matchesSearch = [
        tx.label,
        tx.category,
        tx.wallet_name,
        String(tx.amount),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType =
        activeType === "all"
          ? true
          : activeType === "income"
            ? tx.type === "INCOME"
            : activeType === "expense"
              ? tx.type === "EXPENSE"
              : activeType === "transfer"
                ? tx.type === "TRANSFER"
                : true;

      const transactionDate = tx.date ? new Date(tx.date) : null;
      const today = new Date();
      const matchesDate =
        activeDate === "today"
          ? transactionDate
            ? isSameDay(transactionDate, today)
            : false
          : activeDate === "yesterday"
            ? transactionDate
              ? daysBetween(transactionDate, today) === 1
              : false
            : activeDate === "month"
              ? transactionDate
                ? daysBetween(transactionDate, today) >= 0 &&
                  daysBetween(transactionDate, today) < 30
                : false
              : true;
      return matchesSearch && matchesType && matchesDate;
    });

  const grouped = normalized.reduce((acc, tx) => {
    const key = tx.date
      ? new Date(tx.date).toLocaleDateString(
          language === "id" ? "id-ID" : "en-US",
          { day: "2-digit", month: "long", year: "numeric" },
        )
      : t("no_date");
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(tx);
    return acc;
  }, {});

  const filters = [
    { id: "all", label: t("filter_all") },
    { id: "income", label: t("filter_income") },
    { id: "expense", label: t("filter_expense") },
    { id: "transfer", label: "Transfer" },
  ];

  const dateTabs = [
    { id: "today", label: "Hari Ini" },
    { id: "yesterday", label: "Kemarin" },
    { id: "month", label: "1 Bulan" },
  ];

  const getColor = (tx) => {
    if (tx.type === "EXPENSE" || tx.isTransferOut)
      return "text-[#D1496F] dark:text-[#F47A97]";
    return "text-finance-700 dark:text-[#7CF38E]";
  };

  const getBg = (tx) => {
    if (tx.type === "EXPENSE" || tx.isTransferOut)
      return "bg-[#FBE5EA] text-[#D1496F] dark:bg-[#402233] dark:text-[#F47A97]";
    return "bg-[#7CF38E] text-zinc-900 dark:bg-[#1F5B3A] dark:text-[#9AF2AF]";
  };

  const getPrefix = (tx) => {
    if (tx.type === "EXPENSE" || tx.isTransferOut) return "-";
    return "+";
  };

  const handleCreateTransaction = async (payload) => {
    try {
      await createTransaction.mutateAsync(payload);
      setOpenTransactionModal(false);
    } catch {
      // Error already handled by the mutation callback.
    }
  };

  const handleDeleteTransaction = async (txId) => {
    if (
      !window.confirm(
        "Yakin ingin menghapus transaksi ini? Saldo dompet akan dikembalikan.",
      )
    ) {
      return;
    }

    setDeletingId(txId);
    try {
      await deleteTransaction.mutateAsync(txId);
    } catch {
      // Error already handled by the mutation callback.
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight text-finance-700 md:text-4xl dark:text-[#7CF38E]">
            {t("all_transactions")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-[#B0B8CC]">
            {t("manage_cashflow")}
          </p>
        </div>
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={t("search_transactions_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="finance-input pl-12 dark:bg-[#2D3748] dark:border-[#3F4959] dark:text-[#F0F1F3] dark:placeholder-[#8B92A9]"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {dateTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDate(tab.id)}
              className={cn(
                "finance-pill whitespace-nowrap border transition",
                activeDate === tab.id
                  ? "bg-white text-finance-700 shadow-card border-white dark:bg-[#2D3748] dark:text-[#7CF38E] dark:border-[#2D3748]"
                  : "bg-transparent text-zinc-500 border-transparent hover:text-finance-700 dark:text-[#8B92A9] dark:hover:text-[#7CF38E]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (wallets.length === 0) {
                navigate("/dashboard", { state: { openWalletModal: true } });
                return;
              }

              setFormType("INCOME");
              setOpenTransactionModal(true);
            }}
            className="flex-1 rounded-[18px] bg-[#7CF38E] px-4 py-3 text-sm font-semibold text-finance-800 transition hover:-translate-y-0.5 md:flex-none"
          >
            <ArrowDownLeft className="mr-2 inline-block h-4 w-4" />
            {t("filter_income")}
          </button>
          <button
            onClick={() => {
              if (wallets.length === 0) {
                navigate("/dashboard", { state: { openWalletModal: true } });
                return;
              }

              setFormType("EXPENSE");
              setOpenTransactionModal(true);
            }}
            className="flex-1 rounded-[18px] bg-[#F8D6DF] px-4 py-3 text-sm font-semibold text-[#D1496F] transition hover:-translate-y-0.5 md:flex-none"
          >
            <ArrowUpRight className="mr-2 inline-block h-4 w-4" />
            {t("filter_expense")}
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveType(filter.id)}
            className={cn(
              "finance-pill whitespace-nowrap transition",
              activeType === filter.id
                ? "bg-white text-finance-700 shadow-card dark:bg-[#2D3748] dark:text-[#7CF38E]"
                : "bg-white/55 text-zinc-500 dark:bg-white/10 dark:text-[#8B92A9]",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).length > 0 ? (
          Object.entries(grouped).map(([day, txs]) => (
            <section key={day} className="finance-card p-6 md:p-8">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
                {day}
              </h3>
              <div className="mt-6 space-y-4">
                {txs.map((tx) => (
                  <div
                    key={tx.id}
                    className="group flex items-center justify-between gap-4 rounded-[22px] bg-[#FAFCF7] px-4 py-4 transition hover:bg-[#F3F8EE] dark:bg-[#253044] dark:hover:bg-[#2D3A52]"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl",
                          getBg(tx),
                        )}
                      >
                        <tx.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 md:text-base dark:text-[#F0F1F3]">
                          {tx.label}
                        </h4>
                        <p className="text-[11px] text-zinc-500 md:text-sm dark:text-[#8B92A9]">
                          {tx.category}
                          {tx.wallet_name && <span> • {tx.wallet_name}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={cn(
                          "text-sm font-bold md:text-base",
                          getColor(tx),
                        )}
                      >
                        {getPrefix(tx)} {formatCurrency(Math.abs(tx.amount))}
                      </p>
                      {tx.type !== "TRANSFER" && (
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          disabled={deletingId === tx.id}
                          className="rounded-full p-2 text-zinc-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-[#482233] dark:hover:text-[#F47A97] group-hover:opacity-100 disabled:opacity-50"
                          title="Hapus transaksi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="finance-card p-10 text-center text-zinc-500">
            {t("no_transactions_match_filter")}
          </div>
        )}
      </div>

      <div className="fixed bottom-24 right-6 z-50 md:hidden">
        <button
          onClick={() => navigate("/scan")}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7CF38E] text-finance-800 shadow-soft"
        >
          <Scan className="h-6 w-6" />
        </button>
      </div>

      <TransactionFormModal
        open={openTransactionModal}
        type={formType}
        wallets={wallets}
        onClose={() => setOpenTransactionModal(false)}
        onSubmit={handleCreateTransaction}
        isSubmitting={createTransaction.isPending}
      />
    </Layout>
  );
};

export default Transactions;
