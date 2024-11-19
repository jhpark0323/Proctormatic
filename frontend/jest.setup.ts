import '@testing-library/jest-dom';

// Jest 전역 설정
global.jest = jest;

// 브라우저 API mocks
global.matchMedia = global.matchMedia || function(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Swiper mocks
jest.mock('swiper/modules', () => ({
  Navigation: jest.fn(),
  Autoplay: jest.fn(),
  Virtual: jest.fn(),
}));

jest.mock('swiper/css', () => ({}));