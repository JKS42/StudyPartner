/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo/node',
  testMatch: ['**/src/lib/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
};
