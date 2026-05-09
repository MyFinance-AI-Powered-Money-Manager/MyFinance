import React from 'react';
import { UserCircle2, LockKeyhole, Mail, CalendarDays, Camera } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { useProfile, useUpdatePassword, useUpdateProfile } from '../hooks/useProfile';
import { resolveMediaUrl } from '../lib/utils';
import { showError } from '../lib/toast';

const Profile = () => {
    const { user: authUser } = useAuth();
    const { data: profile, isLoading, error } = useProfile();
    const updateProfile = useUpdateProfile();
    const updatePassword = useUpdatePassword();

    const [fullName, setFullName] = React.useState('');
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [previewUrl, setPreviewUrl] = React.useState('');
    const [previewLoadFailed, setPreviewLoadFailed] = React.useState(false);
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    React.useEffect(() => {
        const activeUser = profile || authUser || {};
        setFullName(activeUser.full_name || '');
        setPreviewUrl(resolveMediaUrl(activeUser.profile_picture));
        setPreviewLoadFailed(false);
    }, [profile, authUser]);

    React.useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
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
                    <h2 className="text-2xl font-extrabold text-red-600">Gagal memuat profil</h2>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-[#B0B8CC]">Pastikan endpoint profil backend tersedia.</p>
                </div>
            </Layout>
        );
    }

    const activeUser = profile || authUser || {};
    const avatarUrl = previewUrl || resolveMediaUrl(activeUser.profile_picture);
    const initial = activeUser.full_name?.trim()?.charAt(0)?.toUpperCase() || 'U';

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            showError('File harus berupa gambar.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showError('Ukuran gambar maksimal 5MB.');
            return;
        }

        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        const objectUrl = URL.createObjectURL(file);
        setSelectedFile(file);
        setPreviewUrl(objectUrl);
        setPreviewLoadFailed(false);
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        if (!fullName.trim()) {
            showError('Nama lengkap tidak boleh kosong.');
            return;
        }

        try {
            await updateProfile.mutateAsync({
                full_name: fullName.trim(),
                profile_picture: selectedFile,
            });
            setSelectedFile(null);
        } catch {
            // Error already handled by the mutation callback.
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        if (!oldPassword || !newPassword || !confirmPassword) {
            showError('Semua kolom password wajib diisi.');
            return;
        }

        if (newPassword.length < 6) {
            showError('Password minimal 6 karakter.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('Password baru dan konfirmasi tidak cocok.');
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
        <Layout>
            <div className="space-y-6">
                <div className="overflow-hidden rounded-[32px] border border-[#DDE6CF] bg-white shadow-card dark:border-[#2D3748] dark:bg-[#1F2733]">
                    <div className="bg-gradient-to-r from-finance-700 via-[#0E7A35] to-[#0A5F29] px-6 py-7 text-white md:px-8">
                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">Profil Akun</p>
                        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">Kelola Profil</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                                    Atur nama, foto profil, dan keamanan akun dari satu tempat.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 rounded-[24px] bg-white/10 px-4 py-3 backdrop-blur-sm">
                                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white/15 text-lg font-bold text-white">
                                    {avatarUrl && !previewLoadFailed ? (
                                        <img
                                            src={avatarUrl}
                                            alt={activeUser.full_name || 'Profil'}
                                            className="h-full w-full object-cover"
                                            onError={() => setPreviewLoadFailed(true)}
                                        />
                                    ) : (
                                        initial
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{activeUser.full_name || 'Pengguna'}</p>
                                    <p className="text-xs text-white/70">{activeUser.email || 'Email belum tersedia'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                    <section className="finance-card p-6 md:p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDF4E2] text-finance-700">
                                <UserCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-[#F0F1F3]">Data Profil</h2>
                                <p className="text-sm text-zinc-500 dark:text-[#B0B8CC]">Ubah nama dan foto profil menggunakan unggahan multipart.</p>
                            </div>
                        </div>

                        <form className="space-y-5" onSubmit={handleProfileSubmit}>
                            <div>
                                <label className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Foto Profil</label>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#DDF4E2] text-2xl font-bold text-finance-700 dark:bg-[#243225] dark:text-[#7CF38E]">
                                        {avatarUrl && !previewLoadFailed ? (
                                            <img
                                                src={avatarUrl}
                                                alt={activeUser.full_name || 'Profil'}
                                                className="h-full w-full object-cover"
                                                onError={() => setPreviewLoadFailed(true)}
                                            />
                                        ) : (
                                            initial
                                        )}
                                    </div>
                                    <label className="cursor-pointer">
                                        <div className="flex items-center gap-2 rounded-[18px] border border-[#D9E5CF] bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-[#F6FAF1] dark:border-[#3F4959] dark:bg-[#2D3748] dark:text-[#E8EAED]">
                                            <Camera className="h-4 w-4" />
                                            Pilih Gambar Baru
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="mt-2 text-xs text-zinc-500 dark:text-[#8B92A9]">
                                    JPG atau PNG, maksimal 5MB. Jika unggahan gagal, sistem akan mempertahankan foto lama.
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Nama Lengkap</label>
                                <input
                                    type="text"
                                    className="finance-input"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                    placeholder="Contoh: Robby Hermawan"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-[22px] bg-[#FAFCF7] p-4 dark:bg-[#2A3341]">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-[#8B92A9]">
                                        <Mail className="h-4 w-4" /> Email
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-[#F0F1F3]">{activeUser.email || '-'}</p>
                                </div>
                                <div className="rounded-[22px] bg-[#FAFCF7] p-4 dark:bg-[#2A3341]">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-[#8B92A9]">
                                        <CalendarDays className="h-4 w-4" /> Bergabung
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-[#F0F1F3]">
                                        {activeUser.created_at ? new Date(activeUser.created_at).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                        }) : '-'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={updateProfile.isPending}
                                className="flex h-12 w-full items-center justify-center rounded-[20px] bg-finance-700 font-semibold text-white transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {updateProfile.isPending ? 'Menyimpan...' : 'Simpan Profil'}
                            </button>
                        </form>
                    </section>

                    <div className="space-y-6">
                        <section className="finance-card p-6 md:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FBE5EA] text-[#D1496F]">
                                    <LockKeyhole className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-zinc-900 dark:text-[#F0F1F3]">Ubah Password</h2>
                                    <p className="text-sm text-zinc-500 dark:text-[#B0B8CC]">Gunakan password yang kuat untuk keamanan akun.</p>
                                </div>
                            </div>

                            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Password Lama</label>
                                    <input
                                        type="password"
                                        className="finance-input"
                                        value={oldPassword}
                                        onChange={(event) => setOldPassword(event.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Password Baru</label>
                                    <input
                                        type="password"
                                        className="finance-input"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-[#D9DCE3]">Konfirmasi Password Baru</label>
                                    <input
                                        type="password"
                                        className="finance-input"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={updatePassword.isPending}
                                    className="flex h-12 w-full items-center justify-center rounded-[20px] bg-finance-700 font-semibold text-white transition hover:bg-finance-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {updatePassword.isPending ? 'Menyimpan...' : 'Ubah Password'}
                                </button>
                            </form>
                        </section>

                        <section className="finance-card p-6 md:p-8">
                            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-[#F0F1F3]">Ringkasan Akun</h3>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                                <div className="rounded-[22px] bg-[#FAFCF7] p-4 dark:bg-[#2A3341]">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-[#8B92A9]">Nama</p>
                                    <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-[#F0F1F3]">{activeUser.full_name || '-'}</p>
                                </div>
                                <div className="rounded-[22px] bg-[#FAFCF7] p-4 dark:bg-[#2A3341]">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-[#8B92A9]">Email</p>
                                    <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-[#F0F1F3]">{activeUser.email || '-'}</p>
                                </div>
                                <div className="rounded-[22px] bg-[#FAFCF7] p-4 dark:bg-[#2A3341] sm:col-span-2 xl:col-span-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-[#8B92A9]">Status</p>
                                    <p className="mt-2 text-sm font-semibold text-finance-700 dark:text-[#7CF38E]">Akun aktif dan tersambung ke backend</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;