import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter').max(50, 'Nama maksimal 50 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').max(50, 'Password maksimal 50 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak sesuai',
  path: ['confirmPassword'],
});

export const transactionSchema = z.object({
  amount: z.number().positive('Jumlah harus positif'),
  category: z.string().min(1, 'Pilih kategori'),
  description: z.string().optional(),
  date: z.date(),
  type: z.enum(['income', 'expense']),
});

export const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional(),
});

// Validation helper
export const validateData = (schema, data) => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { data: result.data, error: null };
  }

  return {
    data: null,
    error: result.error.issues[0]?.message || 'Validation failed',
  };
};
