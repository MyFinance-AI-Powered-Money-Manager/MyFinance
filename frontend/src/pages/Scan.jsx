import React from 'react';
import { Upload, FileImage, Save, Edit3, Plus, ShoppingCart, X } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { useScanReceipt, useCreateTransaction, useWallets } from '../hooks/useFinance';
import { EXPENSE_CATEGORIES } from '../lib/categories';
import { config } from '../lib/config';
import { formatCurrency } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { showError, showSuccess } from '../lib/toast';

const coalesce = (...values) => values.find((value) => value !== undefined && value !== null);

const toNumber = (...values) => Number(coalesce(...values) ?? 0);

const toDateInputValue = (...values) => {
  const rawValue = coalesce(...values);

  if (!rawValue) {
    return new Date().toISOString().slice(0, 10);
  }

  const parsedDate = new Date(rawValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsedDate.toISOString().slice(0, 10);
};

const findExpenseCategoryBySubcategory = (subcategory) => {
  if (!subcategory) {
    return '';
  }

  const normalizedSubcategory = String(subcategory).trim();

  return Object.entries(EXPENSE_CATEGORIES).find(([, subcategories]) =>
    subcategories.some((value) => value === normalizedSubcategory)
  )?.[0] || '';
};

const normalizeScanItem = (item, index) => ({
  id: index,
  item_name: coalesce(item?.item_name, item?.name, item?.product, `Item ${index + 1}`),
  price: toNumber(item?.price, item?.amount, item?.total),
  quantity: toNumber(item?.quantity, item?.qty, 1),
  category: (() => {
    const predictedSubcategory = coalesce(item?.predicted_category, item?.subcategory, '');
    return String(
      findExpenseCategoryBySubcategory(predictedSubcategory)
      || item?.category
      || item?.predicted_main_category
      || 'NEEDS'
    ).toUpperCase();
  })(),
  subcategory: coalesce(item?.predicted_category, item?.subcategory, ''),
});

const normalizeScanResult = (data) => {
  const raw = data?.data ?? data;

  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const items = Array.isArray(raw.items) ? raw.items.map(normalizeScanItem) : [];
  const totalFromAI = toNumber(raw.total_amount, raw.totalAmount, raw.total, raw.amount, raw.nominal, raw.grandTotal);
  const totalFromItems = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const total = totalFromItems > 0 ? totalFromItems : totalFromAI;

  return {
    items,
    total: Number.isFinite(total) ? Math.abs(total) : 0,
    merchant: coalesce(raw.merchant, raw.store_name, raw.storeName, raw.description, ''),
    date: toDateInputValue(raw.date, raw.transaction_date, raw.transactionDate),
    predictedCategory: coalesce(raw.predicted_category, raw.predictedCategory, ''),
    image_url: coalesce(raw.image_url, raw.receipt_url, ''),
    raw,
  };
};

const Scan = () => {
  const { t } = useLanguage();
  const [file, setFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [selectedWalletId, setSelectedWalletId] = React.useState('');
  const [editItems, setEditItems] = React.useState([]);
  const [editDescription, setEditDescription] = React.useState('');
  const [editDate, setEditDate] = React.useState('');
  const [editSubcategory, setEditSubcategory] = React.useState('');
  const fileInputRef = React.useRef(null);

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

  const editTotal = React.useMemo(() => {
    return editItems.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0);
  }, [editItems]);

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

    if (pickedFile.size > 10 * 1024 * 1024) {
      showError(t('max_size'));
      return;
    }

    setFile(pickedFile);
    setResult(null);
    setEditItems([]);
    event.target.value = '';

    const localUrl = URL.createObjectURL(pickedFile);
    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return localUrl;
    });
  };

  const handleScan = async () => {
    if (!config.aiApiUrl || !config.scanEndpoint) {
      showError('Konfigurasi AI server belum diatur. Cek VITE_AI_API_URL dan VITE_SCAN_ENDPOINT.');
      return;
    }

    if (!file) {
      showError('Pilih file struk terlebih dahulu');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await scanReceipt.mutateAsync(formData);
      const normalized = normalizeScanResult(response);

      if (!normalized) {
        showError('Respons AI scan tidak valid');
        return;
      }

      setResult(normalized);
      setEditItems(
        normalized.items.length > 0
          ? normalized.items
          : [{ id: 0, item_name: normalized.merchant || 'Pembelian', price: normalized.total, quantity: 1, category: 'NEEDS', subcategory: normalized.predictedCategory || '' }]
      );
      setEditDescription(normalized.merchant || 'Hasil scan struk');
      setEditDate(normalized.date);
      setEditSubcategory(normalized.predictedCategory || normalized.items[0]?.subcategory || '');

      showSuccess(t('scan_success_hint'));
    } catch {
      return;
    }
  };

  const handleUpdateItem = (id, field, value) => {
    setEditItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const nextItem = {
          ...item,
          [field]: field === 'price' || field === 'quantity' ? Number(value) || 0 : value,
        };

        if (field === 'category') {
          nextItem.subcategory = EXPENSE_CATEGORIES[value]?.[0] || '';
        }

        return nextItem;
      })
    );
  };

  const handleRemoveItem = (id) => {
    setEditItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = () => {
    const nextId = editItems.length > 0 ? Math.max(...editItems.map((it) => it.id)) + 1 : 0;
    const fallbackCategory = editItems[0]?.category || 'NEEDS';

    setEditItems((prev) => [
      ...prev,
      {
        id: nextId,
        item_name: '',
        price: 0,
        quantity: 1,
        category: fallbackCategory,
        subcategory: editSubcategory || EXPENSE_CATEGORIES[fallbackCategory]?.[0] || '',
      },
    ]);
  };

  const handleSaveTransaction = async () => {
    if (editItems.length === 0 || editTotal <= 0) {
      showError('Minimal ada 1 item dengan harga > 0');
      return;
    }

    if (!selectedWalletId) {
      showError('Pilih dompet terlebih dahulu');
      return;
    }

    try {
      const payload = {
        wallet_id: selectedWalletId,
        type: 'EXPENSE',
        total_amount: editTotal,
        category: editItems[0]?.category || 'NEEDS',
        subcategory: editSubcategory || editItems[0]?.subcategory || '',
        description: editDescription || 'Hasil scan struk',
        transaction_date: editDate || new Date().toISOString().slice(0, 10),
        image_url: result?.image_url || '',
        items: editItems.map((item) => ({
          item_name: item.item_name,
          price: item.price,
          category: item.category || editItems[0]?.category || 'NEEDS',
          subcategory: item.subcategory || editSubcategory || '',
        })),
      };

      await createTransaction.mutateAsync(payload);
      showSuccess(t('save_scan_success'));

      setFile(null);
      setPreviewUrl('');
      setResult(null);
      setEditItems([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      // Error already handled by the mutation callback.
    }
  };

  const aiConfigured = Boolean(config.aiApiUrl && config.scanEndpoint);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-finance-700 to-[#00A86B] bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
          {t('scan_title')}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('scan_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="finance-card p-6 md:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
            <FileImage className="h-5 w-5 text-finance-700" />
            {t('upload_receipt')}
          </h2>

          <div className="mb-4 rounded-[22px] border-2 border-dashed border-[#D9E5CF] bg-[#FAFCF7] p-4 transition hover:border-finance-500 hover:bg-[#F3F8EE] dark:border-[#3F4959] dark:bg-[#2D3748] dark:hover:border-[#7CF38E]">
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <FileImage className="mb-3 h-10 w-10 text-zinc-400 dark:text-[#8B92A9]" />
              <span className="text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">{file ? file.name : '1 foto struk saja'}</span>
              <span className="mt-1 text-xs text-zinc-500 dark:text-[#8B92A9]">JPG, PNG, WEBP · Maks 10 MB</span>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-finance-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-finance-800"
                >
                  <Upload className="h-4 w-4" />
                  {file ? 'Ganti foto' : 'Pilih foto'}
                </button>
                {file ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl('');
                      setResult(null);
                      setEditItems([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-[#D9E5CF] bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-[#3F4959] dark:bg-[#253044] dark:text-[#E8EAED] dark:hover:bg-[#2D3748]"
                  >
                    Hapus
                  </button>
                ) : null}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handlePickFile} />
            </div>
          </div>

          {previewUrl ? <img src={previewUrl} alt="Preview struk" className="mb-4 max-h-72 w-full rounded-[22px] bg-zinc-50 object-contain dark:bg-[#2D3748]" /> : null}

          <button
            type="button"
            onClick={handleScan}
            disabled={scanReceipt.isPending || !aiConfigured || !file}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-finance-700 font-semibold text-white transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {scanReceipt.isPending ? t('processing_scan') : !aiConfigured ? t('ai_server_not_configured') : !file ? 'Pilih foto terlebih dahulu' : t('scan_with_ai')}
          </button>

          {!aiConfigured ? (
            <p className="mt-3 rounded-[14px] bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              ⚠️ AI Server belum dikonfigurasi. Pastikan <code className="font-mono font-bold">VITE_AI_API_URL</code> dan <code className="font-mono font-bold">VITE_SCAN_ENDPOINT</code> sudah diatur di .env
            </p>
          ) : null}
        </section>

        <section className="finance-card p-6 md:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
            <Edit3 className="h-5 w-5 text-finance-700" />
            {t('check_edit_results')}
          </h2>

          {editItems.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-[22px] bg-gradient-to-br from-finance-700 to-finance-600 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{t('total_detected')}</p>
                <p className="mt-1 text-3xl font-extrabold">{formatCurrency(editTotal)}</p>
                <p className="mt-1 text-xs text-white/60">
                  {editItems.length} {t('items_detected')}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-700 dark:text-[#D9DCE3]">{t('item_list')}</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 rounded-full bg-[#DDF4E2] px-3 py-1.5 text-xs font-semibold text-finance-700 transition hover:bg-[#c8eacf]"
                  >
                    <Plus className="h-3 w-3" /> {t('add_item')}
                  </button>
                </div>

                {editItems.map((item) => (
                  <div key={item.id} className="rounded-[18px] bg-[#FAFCF7] p-4 dark:bg-[#2A3341]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={item.item_name}
                          onChange={(e) => handleUpdateItem(item.id, 'item_name', e.target.value)}
                          placeholder={t('item_name')}
                          className="finance-input text-sm font-semibold"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{t('price')}</label>
                            <input
                              type="number"
                              value={item.price || ''}
                              onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                              placeholder="0"
                              className="finance-input text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{t('qty')}</label>
                            <input
                              type="number"
                              value={item.quantity || ''}
                              onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                              placeholder="1"
                              min="1"
                              className="finance-input text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Kategori</label>
                            <select
                              value={item.category || 'NEEDS'}
                              onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                              className="finance-input text-sm"
                            >
                              {Object.keys(EXPENSE_CATEGORIES).map((key) => (
                                <option key={key} value={key}>
                                  {key}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Subkategori</label>
                            <select
                              value={item.subcategory || ''}
                              onChange={(e) => handleUpdateItem(item.id, 'subcategory', e.target.value)}
                              className="finance-input text-sm"
                            >
                              <option value="">Pilih...</option>
                              {(EXPENSE_CATEGORIES[item.category] || []).map((sub) => (
                                <option key={sub} value={sub}>
                                  {sub}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="mt-1 rounded-full p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-right text-xs font-semibold text-finance-700">
                      {t('subtotal')}: {formatCurrency(item.price * (item.quantity || 1))}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-[22px] border border-[#D9E5CF] bg-white p-4 dark:border-[#3F4959] dark:bg-[#1F2733]">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-[#D9DCE3]">{t('description_store')}</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="finance-input text-sm"
                    placeholder="Nama toko atau keterangan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-[#D9DCE3]">Tanggal</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="finance-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-[#D9DCE3]">{t('save_to_wallet')}</label>
                    <select
                      value={selectedWalletId}
                      onChange={(e) => setSelectedWalletId(e.target.value)}
                      className="finance-input text-sm"
                    >
                      {wallets.length === 0 && <option value="">{t('no_wallet')}</option>}
                      {wallets.map((wallet) => {
                        const id = wallet.id ?? wallet.walletId ?? wallet._id;

                        if (!id) {
                          return null;
                        }

                        return (
                          <option key={id} value={String(id)}>
                            {wallet.name || wallet.type} — {formatCurrency(wallet.balance || 0)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveTransaction}
                disabled={createTransaction.isPending || editTotal <= 0 || !selectedWalletId}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-[#7CF38E] font-semibold text-finance-800 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {createTransaction.isPending ? t('saving') : t('save_with_amount', { amount: formatCurrency(editTotal) })}
              </button>

              {result?.raw && (
                <details className="rounded-[18px] border border-zinc-200 p-3 text-xs text-zinc-600 dark:border-[#3F4959] dark:text-zinc-300">
                  <summary className="cursor-pointer font-semibold">{t('raw_ai_response')}</summary>
                  <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap">{JSON.stringify(result.raw, null, 2)}</pre>
                </details>
              )}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-[22px] border border-dashed border-[#D9E5CF] text-center dark:border-[#3F4959]">
              <ShoppingCart className="mb-3 h-10 w-10 text-zinc-300 dark:text-[#8B92A9]" />
              <p className="font-semibold text-zinc-600 dark:text-zinc-300">{t('no_budget_this_month')}</p>
              <p className="mt-1 max-w-xs text-sm text-zinc-500 dark:text-[#B0B8CC]">{t('scan_subtitle')}</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Scan;
