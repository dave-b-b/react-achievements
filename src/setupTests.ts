// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

/**
 * Suppress known React act() warnings from component-internal async operations.
 * 
 * These warnings occur from legitimate async operations in component internals:
 * 1. AchievementProvider's detectLegacyLibraries() promise resolution (useEffect)
 * 2. BuiltInConfetti's useEffect timer-based state updates
 * 3. BuiltInNotification's setTimeout-based state updates for animations
 * 
 * These are expected warnings from component-internal async effects and don't
 * indicate test issues. All tests pass correctly despite these warnings.
 * 
 * React Testing Library's render() handles most act() wrapping automatically,
 * but component-internal async operations (promises, timers in useEffect) can
 * still trigger warnings. These are benign and don't affect test correctness.
 */
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Combine all arguments into a single string for pattern matching
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');
    
    // Suppress known act() warnings from component-internal async operations
    if (
      message.includes('Warning: An update to') &&
      message.includes('inside a test was not wrapped in act')
    ) {
      // Check if it's one of our known warnings
      const isKnownWarning =
        message.includes('AchievementProvider') ||
        message.includes('BuiltInConfetti') ||
        message.includes('BuiltInNotification');
      
      if (isKnownWarning) {
        // Suppress this known warning
        return;
      }
    }
    
    // Allow all other errors through
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Polyfill structuredClone for fake-indexeddb (required for Node < 17)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock }); 