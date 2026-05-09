import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { config } from './config';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

export function resolveMediaUrl(value) {
  if (!value) {
    return '';
  }

  if (value.startsWith('data:') || value.startsWith('blob:') || value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  const apiRoot = config.apiUrl.replace(/\/api\/v1\/?$/, '');
  return `${apiRoot}${value.startsWith('/') ? '' : '/'}${value}`;
}
