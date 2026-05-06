import React from 'react';
import { Upload, FileImage, Sparkles, Save } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { useScanReceipt, useCreateTransaction, useWallets } from '../hooks/useFinance';
import { showError, showSuccess } from '../lib/toast';

const normalizeScanResult = (data) => {
  const raw = data?.data ?? data;
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const amount = Number(
    raw.totalAmount ?? raw.total ?? raw.amount ?? raw.nominal ?? raw.grandTotal ?? 0
  );

  return {
    amount: Number.isFinite(amount) ? Math.abs(amount) : 0,
    category: raw.category || raw.predictedCategory || raw.classification || 'lainnya',
    description: raw.description || raw.merchant || raw.storeName || 'Hasil scan struk',
    date: (raw.date || raw.transactionDate || new Date().toISOString()).slice(0, 10),
    type: raw.type === 'income' ? 'income' : 'expense',
    raw,
  };
};

const Scan = () => {
  const [file, setFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [selectedWalletId, setSelectedWalletId] = React.useState('');

  const scanReceipt = useScanReceipt();
  const createTransaction = useCreateTransaction();
  const { data: walletsData } = useWallets();

  const wallets = React.useMemo(() => {
    return Array.isArray(walletsData) ? walletsData : walletsData?.data ?? [];
  }, [walletsData]);

  React.useEffect(() => {
    if (!selectedWalletId && wallets[0]?.id) {
      setSelectedWalletId(String(wallets[0].id));
    }
  }, [wallets, selectedWalletId]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handlePickFile = (event) => {
    const pickedFile = event.target.files?.[0];
    if (!pickedFile) {
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(pickedFile.type)) {
      showError('Format file harus JPG, PNG, atau WEBP');
      return;
    }

    setFile(pickedFile);
    setResult(null);

    const localUrl = URL.createObjectURL(pickedFile);
    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return localUrl;
    });
  };

  const handleScan = async () => {
    if (!file) {
      showError('Pilih file struk terlebih dahulu');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('receipt', file);
      formData.append('file', file);

      const response = await scanReceipt.mutateAsync(formData);
      const normalized = normalizeScanResult(response);
      if (!normalized) {
        showError('Respons AI scan tidak valid');
        return;
      }

      setResult(normalized);
      showSuccess('Scan struk berhasil');
    } catch {
      return;
    }
  };

  const handleSaveTransaction = async () => {
    if (!result) {
      showError('Belum ada hasil scan untuk disimpan');
      return;
    }

    if (!selectedWalletId) {
      showError('Pilih wallet terlebih dahulu');
      return;
    }

    await createTransaction.mutateAsync({
      amount: result.amount,
      type: result.type,
      category: result.category,
      description: result.description,
      date: result.date,
      walletId: selectedWalletId,
      wallet_id: selectedWalletId,
    });

    showSuccess('Hasil scan disimpan sebagai transaksi');
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-[#008744] to-[#00A86B] bg-clip-text text-4xl font-bold text-transparent">
          Scan Struk AI
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-[#B0B8CC]">
          Upload foto struk, proses dengan API AI, lalu simpan otomatis menjadi transaksi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-bold dark:text-zinc-100">1. Upload Struk</h2>

          <label className="mb-4 flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 p-4 text-center transition hover:border-[#008744] dark:border-zinc-700 dark:hover:border-[#00A86B]">
            <FileImage className="mb-3 h-10 w-10 text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
              Klik untuk pilih gambar struk
            </span>
            <span className="mt-1 text-xs text-zinc-500 dark:text-[#8B92A9]">JPG, PNG, WEBP</span>
            <input type="file" className="hidden" accept="image/*" onChange={handlePickFile} />
          </label>

          {previewUrl ? (
            <img src={previewUrl} alt="Preview struk" className="mb-4 max-h-72 w-full rounded-2xl object-contain bg-zinc-50 dark:bg-zinc-800" />
          ) : null}

          <button
            type="button"
            onClick={handleScan}
            disabled={scanReceipt.isPending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#008744] font-semibold text-white transition hover:bg-[#007038] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {scanReceipt.isPending ? 'Memproses scan...' : 'Scan dengan AI'}
          </button>
        </section>

        <section className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-bold dark:text-zinc-100">2. Hasil Scan</h2>

          {result ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-[#8B92A9]">Amount</p>
                <p className="text-xl font-bold text-[#008744]">Rp {Number(result.amount || 0).toLocaleString('id-ID')}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-[#8B92A9]">Type</p>
                  <p className="font-semibold uppercase dark:text-zinc-100">{result.type}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-[#8B92A9]">Kategori</p>
                  <p className="font-semibold dark:text-zinc-100">{result.category}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-[#8B92A9]">Tanggal</p>
                  <p className="font-semibold dark:text-zinc-100">{result.date}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-[#8B92A9]">Deskripsi</p>
                  <p className="font-semibold dark:text-zinc-100">{result.description}</p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
                  Simpan ke Wallet
                </label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-[#008744]/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  required
                >
                  {wallets.map((wallet) => {
                    const id = wallet.id ?? wallet.walletId ?? wallet._id;
                    const label = wallet.name || wallet.label || wallet.type || 'Wallet';
                    if (!id) {
                      return null;
                    }

                    return (
                      <option key={id} value={String(id)}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSaveTransaction}
                disabled={createTransaction.isPending}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00A86B] font-semibold text-white transition hover:bg-[#008744] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {createTransaction.isPending ? 'Menyimpan transaksi...' : 'Simpan ke Transactions'}
              </button>

              <details className="rounded-xl border border-zinc-200 p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                <summary className="cursor-pointer font-semibold">Lihat respons mentah AI</summary>
                <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap">{JSON.stringify(result.raw, null, 2)}</pre>
              </details>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-center dark:border-zinc-700">
              <Sparkles className="mb-3 h-8 w-8 text-zinc-400" />
              <p className="font-semibold text-zinc-600 dark:text-zinc-300">Belum ada hasil scan</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-[#B0B8CC]">Upload struk lalu klik tombol scan.</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Scan;
