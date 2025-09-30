module.exports = {
  presets: ['module:@react-native/babel-preset', '@babel/preset-typescript'],
  plugins: [
    ['@babel/plugin-proposal-export-namespace-from'],
    ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
    ['react-native-worklets-core/plugin'],
    [
      'tsconfig-paths-module-resolver',
      { root: ['.'], extensions: ['.ts', '.tsx', '.js', '.json'] },
    ],
    ['react-native-unistyles/plugin', { root: 'src' }],
    ['react-native-worklets/plugin'],
  ],
  env: { production: { plugins: ['transform-remove-console'] } },
};
