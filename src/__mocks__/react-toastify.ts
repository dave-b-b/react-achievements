import React from 'react';
import { ToastContent, ToastOptions } from 'react-toastify';

const mockToast = jest.fn();

const success = jest.fn((content: ToastContent, options?: ToastOptions) => {
  mockToast(content, options);
  return 'toast-id';
});

const toast = Object.assign(mockToast, {
  success,
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  dark: jest.fn(),
  dismiss: jest.fn(),
  __esModule: true,
  default: mockToast,
});

export { toast };
export const ToastContainer = jest.fn(() => null); 