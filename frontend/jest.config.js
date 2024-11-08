/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // 테스트 환경 설정
  testEnvironment: 'jest-environment-jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // TypeScript와 JSX를 처리하기 위해 ts-jest 사용
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },

  // 테스트 준비 파일 설정
  setupFilesAfterEnv: ['./jest.setup.ts'],

  // 모듈 이름 매핑
  moduleNameMapper: {
    '^.+\\.svg$': 'jest-svg-transformer',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^@/assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
  },

  // 모듈 디렉토리 설정
  moduleDirectories: ['node_modules', 'src'],

  // transform에서 제외할 패턴
  transformIgnorePatterns: ['<rootDir>/node_modules/'],

  // Jest 환경 옵션 설정
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },

  // 지원 파일 확장자 설정
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // 테스트 파일 매칭 패턴
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)'
  ],

  // 커버리지 수집 설정
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  
  // 전체 파일에 대해 커버리지를 수집하도록 설정
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}', // src 폴더의 모든 ts, tsx 파일
    '!src/**/*.d.ts', // 타입 선언 파일 제외
    '!src/**/__mocks__/**', // __mocks__ 폴더 제외
  ],
};
