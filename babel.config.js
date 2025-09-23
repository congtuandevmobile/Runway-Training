module.exports = {
  presets: ['module:@react-native/babel-preset', '@babel/preset-typescript'],
  plugins: [
    ['react-native-worklets-core/plugin'],
    [
      'tsconfig-paths-module-resolver',
      {
        root: ['.'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      }
    ],
    ['react-native-unistyles/plugin', {root: 'src'}],
    ['react-native-worklets/plugin'],
  ]
};
