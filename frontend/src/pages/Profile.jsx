import React from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle2,
  LockKeyhole,
  Mail,
  CalendarDays,
  Camera,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { LoadingScreen } from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  useProfile,
  useUpdatePassword,
  useUpdateProfile,
  useDeleteAccount,
} from "../hooks/useProfile";
import { resolveMediaUrl } from "../lib/utils";
import { showError } from "../lib/toast";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);
  const { user: authUser } = useAuth();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const deleteAccount = useDeleteAccount();
  const { t } = useLanguage();

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");

  const [fullName, setFullName] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState("");
  const [previewLoadFailed, setPreviewLoadFailed] = React.useState(false);
  const [removePhoto, setRemovePhoto] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const activeUser = profile || authUser || {};
  const initial = (activeUser.full_name || activeUser.name || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  React.useEffect(() => {
    setFullName(activeUser.full_name || activeUser.name || "");
    setPreviewUrl(resolveMediaUrl(activeUser.profile_picture));
    setPreviewLoadFailed(false);
    setRemovePhoto(false);
  }, [activeUser.full_name, activeUser.name, activeUser.profile_picture]);

  React.useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <Layout>
        <div className="finance-card p-8 text-center md:p-10">
          <h2 className="text-2xl font-extrabold text-red-600">
            Gagal memuat profil
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-[#B0B8CC]">
            Pastikan endpoint profil backend tersedia.
          </p>
        </div>
      </Layout>
    );
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showError("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Ukuran gambar maksimal 5MB.");
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setPreviewLoadFailed(false);
    setRemovePhoto(false);
  };

  const handleRemovePhoto = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setRemovePhoto(true);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!fullName.trim()) {
      showError("Nama lengkap tidak boleh kosong.");
      return;
    }

    try {
      const payload = { full_name: fullName.trim() };

      if (selectedFile) {
        payload.profile_picture = selectedFile;
      } else if (removePhoto) {
        payload.profile_picture = null;
      }

      await updateProfile.mutateAsync(payload);
      setSelectedFile(null);
      setRemovePhoto(false);
    } catch {
      // Error already handled by the mutation callback.
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      showError("Semua kolom password wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      showError("Password minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Password baru dan konfirmasi tidak cocok.");
      return;
    }

    try {
      await updatePassword.mutateAsync({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // Error already handled by the mutation callback.
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== t("delete_confirm_keyword")) {
      showError(t("type_to_confirm", { confirm: t("delete_confirm_keyword") }));
      return;
    }

    try {
      await deleteAccount.mutateAsync();
      navigate("/");
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-finance-700 to-[#00A86B] bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
            {t("account_settings")}
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-8">
            <section className="finance-card p-6 md:p-8">
              <h3 className="mb-6 text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
                {t("personal_info")}
              </h3>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-[#252a33] flex items-center justify-center text-2xl font-bold text-zinc-700 dark:text-[#B0B8CC]">
                    {previewUrl && !previewLoadFailed ? (
                      <img
                        src={previewUrl}
                        alt="avatar"
                        className="h-full w-full object-cover"
                        onError={() => setPreviewLoadFailed(true)}
                      />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-[14px] border px-3 py-2 text-sm font-semibold"
                      >
                        <Camera className="h-4 w-4" /> Unggah Foto
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="flex items-center gap-2 rounded-[14px] border px-3 py-2 text-sm font-semibold text-red-600"
                      >
                        <Trash2 className="h-4 w-4" /> Hapus Foto
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {previewLoadFailed && (
                      <p className="mt-2 text-sm text-red-600">
                        Gagal memuat preview gambar.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
                    {t("full_name_label")}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="finance-input"
                    placeholder={t("full_name_label")}
                  />
                </div>
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="flex h-12 w-full items-center justify-center rounded-[20px] bg-finance-700 font-semibold text-white transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
                >
                  {updateProfile.isPending ? t("saving") : t("update_profile")}
                </button>
              </form>
            </section>

            <section className="finance-card p-6 md:p-8">
              <h3 className="mb-6 text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
                {t("change_password")}
              </h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
                      {t("old_password")}
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="finance-input"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
                      {t("new_password")}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="finance-input"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
                      {t("confirm_new_password")}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="finance-input"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updatePassword.isPending}
                  className="flex h-12 w-full items-center justify-center rounded-[20px] bg-finance-700 font-semibold text-white transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatePassword.isPending
                    ? t("saving")
                    : t("update_password")}
                </button>
              </form>
            </section>
          </div>

          <div className="space-y-8">
            <section className="finance-card p-6 md:p-8">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
                {t("account_summary")}
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[22px] bg-[#FAFCF7] p-4 dark:bg-[#2A3341]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-[#8B92A9]">
                    {t("full_name_label")}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-[#F0F1F3]">
                    {activeUser.full_name || "-"}
                  </p>
                </div>
                <div className="rounded-[22px] bg-[#FAFCF7] p-4 dark:bg-[#2A3341]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-[#8B92A9]">
                    {t("email")}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-[#F0F1F3]">
                    {activeUser.email || "-"}
                  </p>
                </div>
                <div className="rounded-[22px] bg-[#FAFCF7] p-4 dark:bg-[#2A3341] sm:col-span-2 xl:col-span-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-[#8B92A9]">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-semibold text-finance-700 dark:text-[#7CF38E]">
                    {t("status_active")}
                  </p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border-2 border-red-200 bg-white p-6 md:p-8 dark:border-red-900/50 dark:bg-[#1F2733]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-red-600">
                    {t("danger_zone")}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-[#B0B8CC]">
                    {t("danger_zone_desc")}
                  </p>
                </div>
              </div>
              <p className="mb-4 text-sm leading-6 text-zinc-600 dark:text-[#B0B8CC]">
                {t("delete_account_desc")}
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[20px] border-2 border-red-300 bg-red-50 font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              >
                <Trash2 className="h-4 w-4" />
                {t("delete_account_permanently")}
              </button>
            </section>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl dark:bg-[#1F2733] md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
                  {t("confirm_delete_account")}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-[#B0B8CC]">
                  {t("permanent_action_warning")}
                </p>
              </div>
            </div>
            <div className="mb-4 rounded-[16px] bg-red-50 p-4 dark:bg-red-900/10">
              <p className="text-sm font-bold leading-6 text-red-700 dark:text-red-400">
                {t("delete_warning_list")}
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-red-600 dark:text-red-400/80">
                <li>{t("data_list_item_1")}</li>
                <li>{t("data_list_item_2")}</li>
                <li>{t("data_list_item_3")}</li>
                <li>{t("data_list_item_4")}</li>
              </ul>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
                {t("type_to_confirm").split("{confirm}")[0]}
                <span className="font-mono font-bold text-red-600">
                  {t("delete_confirm_keyword")}
                </span>
                {t("type_to_confirm").split("{confirm}")[1]}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="finance-input border-red-200 focus:border-red-400 focus:ring-red-400 dark:border-red-900/30"
                placeholder={t("delete_confirm_keyword")}
                autoComplete="off"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="flex h-12 flex-1 items-center justify-center rounded-[20px] border border-zinc-200 bg-white font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-[#3F4959] dark:bg-[#2D3748] dark:text-[#B0B8CC] dark:hover:bg-[#3F4959]"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={
                  deleteConfirmText !== t("delete_confirm_keyword") ||
                  deleteAccount.isPending
                }
                className="flex h-12 flex-1 items-center justify-center rounded-[20px] bg-red-600 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteAccount.isPending ? t("deleting") : t("delete_now")}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Profile;
