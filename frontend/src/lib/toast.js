import { toast } from 'sonner';

export const showSuccess = (message, options = {}) =>
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    ...options,
  });

export const showError = (message, options = {}) =>
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    ...options,
  });

export const showLoading = (message, options = {}) =>
  toast.loading(message, {
    position: 'top-right',
    ...options,
  });

export const showInfo = (message, options = {}) =>
  toast.info(message, {
    duration: 4000,
    position: 'top-right',
    ...options,
  });

export const showWarning = (message, options = {}) =>
  toast.warning(message, {
    duration: 4000,
    position: 'top-right',
    ...options,
  });

export const dismissToast = (id) => toast.dismiss(id);
