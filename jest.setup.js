// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the process.env
process.env.NEXT_PUBLIC_TRADING_MODE = 'paper';

// Configure Jest timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});
