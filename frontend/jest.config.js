/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}], // ".tsx?"로 수정하여 정확하게 패턴 매칭
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleNameMapper: {
    // SVG 파일을 위한 매핑
    '^.+\\.svg$': 'jest-svg-transformer',
    // CSS 모듈 파일을 위한 매핑
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    // 이미지 파일 경로 매핑 (모든 이미지 파일 확장자를 포함)
    '\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    // assets 폴더의 파일을 매핑
    '^@/assets/(.*)$': '<rootDir>/src/assets/$1',
  },
  moduleDirectories: ['node_modules', 'src'],
};
