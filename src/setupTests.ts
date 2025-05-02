import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { LocalStorageMock } from './test-utils/mocks';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
});