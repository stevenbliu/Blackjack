module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // change to 'jsdom' if you're testing React
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
};
