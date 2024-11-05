/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // 설정한 테스트 환경
  testEnvironment: 'jest-environment-jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Babel 설정을 통해 TypeScript, JSX 변환
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
          ['@babel/preset-react', { runtime: 'automatic' }]
        ]
      }
    ]
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
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1', // 추가된 매핑
  },

  // 모듈 디렉토리 설정
  moduleDirectories: ['node_modules', 'src'],

  // Node_modules 제외 패턴 설정
  transformIgnorePatterns: ['<rootDir>/node_modules/'],

  // 환경 옵션 설정
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },

  // 지원 파일 확장자 설정
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // 테스트 파일 매칭 패턴
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)'
  ]
};
