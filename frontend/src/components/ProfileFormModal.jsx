import React from 'react';
import { X, Upload } from 'lucide-react';
import { useUpdateProfile, useUpdatePassword } from '../hooks/useProfile';
import { showError } from '../lib/toast';

export const ProfileFormModal = ({ open, user, onClose, onSuccess }) => {
    const updateProfile = useUpdateProfile();
    const updatePassword = useUpdatePassword();
    
    const [tab, setTab] = React.useState('profile'); // 'profile' or 'password'
    const [fullName, setFullName] = React.useState(user?.full_name || '');
    const [profilePicture, setProfilePicture] = React.useState(user?.profile_picture || '');
    const [previewUrl, setPreviewUrl] = React.useState(user?.profile_picture || '');
    const [previewLoadFailed, setPreviewLoadFailed] = React.useState(false);
    
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    React.useEffect(() => {
        if (!open) {
            return;
        }

        setTab('profile');
        setFullName(user?.full_name || '');
        setProfilePicture(user?.profile_picture || '');
        setPreviewUrl(user?.profile_picture || '');
        setPreviewLoadFailed(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }, [open, user]);

    React.useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (!open) {
        return null;
    }

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('File harus berupa gambar');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showError('Ukuran gambar maksimal 5MB');
            return;
        }

        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setProfilePicture(file);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (!fullName.trim()) {
            showError('Nama lengkap tidak boleh kosong');
            return;
        }

        try {
            await updateProfile.mutateAsync({
                full_name: fullName.trim(),
                profile_picture: profilePicture || null,
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch {
            // Error already handled by the mutation callback.
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (!oldPassword || !newPassword || !confirmPassword) {
            showError('Semua kolom password wajib diisi');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('Password baru dan konfirmasi tidak cocok');
            return;
        }

        if (newPassword.length < 6) {
            showError('Password minimal 6 karakter');
            return;
        }

        try {
            await updatePassword.mutateAsync({
                old_password: oldPassword,
                new_password: newPassword,
                confirm_new_password: confirmPassword,
            });

            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            // Error already handled by the mutation callback.
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl md:p-7">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-zinc-900 dark:text-[#F0F1F3]">
                        Kelola Profil
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 dark:text-[#8B92A9] dark:hover:bg-[#2D3748]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tab navigation */}
                <div className="mb-6 flex gap-2 border-b border-[#E3EAD8] dark:border-[#3F4959]">
                    <button
                        onClick={() => setTab('profile')}
                        className={`px-4 py-2 text-sm font-semibold transition ${
                            tab === 'profile'
                                ? 'border-b-2 border-finance-700 text-finance-700'
                                : 'text-zinc-500 hover:text-finance-700 dark:text-[#8B92A9]'
                        }`}
                    >
                        Profil
                    </button>
                    <button
                        onClick={() => setTab('password')}
                        className={`px-4 py-2 text-sm font-semibold transition ${
                            tab === 'password'
                                ? 'border-b-2 border-finance-700 text-finance-700'
                                : 'text-zinc-500 hover:text-finance-700 dark:text-[#8B92A9]'
                        }`}
                    >
                        Ubah Password
                    </button>
                </div>

                {/* Profile Tab */}
                {tab === 'profile' && (
                    <form className="space-y-4" onSubmit={handleUpdateProfile}>
                        {/* Profile Picture */}
                        <div>
                            <label className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
                                Foto Profil
                            </label>
                            <div className="flex items-end gap-4">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#DDF4E2] text-finance-700">
                                    {previewUrl && !previewLoadFailed ? (
                                        <img
                                            src={previewUrl}
                                            alt="preview"
                                            className="h-full w-full object-cover"
                                            onError={() => setPreviewLoadFailed(true)}
                                        />
                                    ) : (
                                        <span className="text-xs font-semibold">{user?.full_name?.[0]?.toUpperCase() || 'U'}</span>
                                    )}
                                </div>
                                <label className="cursor-pointer">
                                    <div className="flex items-center gap-2 rounded-[18px] border border-[#D9E5CF] bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-[#F6FAF1] dark:border-[#3F4959] dark:bg-[#2D3748] dark:text-[#E8EAED]">
                                        <Upload className="h-4 w-4" />
                                        Pilih Gambar
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="mt-2 text-xs text-zinc-500 dark:text-[#8B92A9]">
                                Format: JPG, PNG. Maksimal 5MB.
                            </p>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="finance-input"
                                placeholder="Contoh: Robby Hermawan"
                                required
                            />
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={updateProfile.isPending}
                                className="flex h-12 w-full items-center justify-center rounded-[20px] bg-finance-700 font-semibold text-white transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {updateProfile.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Password Tab */}
                {tab === 'password' && (
                    <form className="space-y-4" onSubmit={handleUpdatePassword}>
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
                                Password Lama
                            </label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="finance-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
                                Password Baru
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="finance-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">
                                Konfirmasi Password Baru
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="finance-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={updatePassword.isPending}
                                className="flex h-12 w-full items-center justify-center rounded-[20px] bg-finance-700 font-semibold text-white transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {updatePassword.isPending ? 'Menyimpan...' : 'Ubah Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
