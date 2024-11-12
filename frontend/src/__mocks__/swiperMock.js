const MockSwiper = jest.fn(() => ({
  params: {},
  on: jest.fn(),
  destroy: jest.fn(),
  update: jest.fn(),
}));

MockSwiper.use = jest.fn();

module.exports = {
  Navigation: jest.fn(),
  Autoplay: jest.fn(),
  Virtual: jest.fn(),
  default: MockSwiper,
  __esModule: true,
};