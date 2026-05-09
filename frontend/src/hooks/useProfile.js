import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { showError, showSuccess } from '../lib/toast';
import { useAuth } from '../context/AuthContext';

const unwrapData = (response) => response?.data?.data ?? response?.data ?? response;

const normalizeUser = (user) => ({
    ...user,
    id: user?.id,
    full_name: user?.full_name ?? user?.name ?? 'User',
    email: user?.email ?? '',
    profile_picture: user?.profile_picture ?? null,
});

const fileToCompressedDataUrl = (file, options = {}) =>
    new Promise((resolve, reject) => {
        if (!(file instanceof File)) {
            resolve(null);
            return;
        }

        const { maxDimension = 512, quality = 0.72 } = options;
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            try {
                const largestSide = Math.max(image.width, image.height) || 1;
                const scale = Math.min(1, maxDimension / largestSide);
                const width = Math.max(1, Math.round(image.width * scale));
                const height = Math.max(1, Math.round(image.height * scale));

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext('2d');
                if (!context) {
                    throw new Error('Gagal menyiapkan kompresi gambar.');
                }

                context.drawImage(image, 0, 0, width, height);
                const compressed = canvas.toDataURL('image/jpeg', quality);
                resolve(compressed);
            } catch (error) {
                reject(error);
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Gagal membaca file gambar.'));
        };

        image.src = objectUrl;
    });

// Get user profile
export const useProfile = (options = {}) => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => normalizeUser(unwrapData(await api.get('/users/profile'))),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

// Update profile (name + photo)
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { updateUser } = useAuth();

    return useMutation({
        mutationFn: async ({ full_name, profile_picture }) => {
            let profilePictureValue = profile_picture;

            if (profile_picture instanceof File) {
                profilePictureValue = await fileToCompressedDataUrl(profile_picture);
            }

            const response = await api.put('/users/profile', {
                full_name,
                profile_picture: profilePictureValue || null,
            });

            return response;
        },
        onSuccess: (response) => {
            const previousUser = queryClient.getQueryData(['profile']) || {};
            const user = normalizeUser({
                ...previousUser,
                ...unwrapData(response),
            });
            queryClient.setQueryData(['profile'], user);
            updateUser?.((currentUser) => ({
                ...(currentUser || {}),
                ...user,
            }));

            if (user) {
                localStorage.setItem('user', JSON.stringify({
                    ...(JSON.parse(localStorage.getItem('user') || '{}')),
                    ...user,
                }));
            }

            showSuccess('Profil berhasil diperbarui');
        },
        onError: (error) => {
            showError(error.response?.data?.message || 'Gagal memperbarui profil');
        },
    });
};

// Update password
export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: (data) => api.put('/users/password', data),
        onSuccess: () => {
            showSuccess('Password berhasil diubah');
        },
        onError: (error) => {
            showError(error.response?.data?.message || 'Gagal mengubah password');
        },
    });
};
