/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  testEnvironment: 'jsdom',
  
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { 
            targets: { node: 'current' },
            modules: 'commonjs'  // 명시적으로 commonjs 설정
          }],
          '@babel/preset-typescript',
          ['@babel/preset-react', { runtime: 'automatic' }]
        ],
        plugins: [
          '@babel/plugin-transform-modules-commonjs'  // ESM -> CommonJS 변환
        ]
      }
    ]
  },

  // 변환 무시 패턴 수정 - swiper를 변환 대상에 포함
  transformIgnorePatterns: [
    '/node_modules/(?!swiper|swiper/.*|ssr-window|dom7)/'
  ],

  moduleNameMapper: {
    '^.+\\.svg$': 'jest-svg-transformer',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    // Swiper 모듈 모킹
    '^swiper$': '<rootDir>/src/__mocks__/swiperMock.js',
    '^swiper/modules$': '<rootDir>/src/__mocks__/swiperMock.js',
    '^swiper/css.*$': '<rootDir>/src/__mocks__/swiperMock.js'
  },

  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleDirectories: ['node_modules', 'src'],

  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'json', 'node'],

  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)'
  ]
};

module.exports = config;