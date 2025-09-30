// const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
// const {
//     wrapWithReanimatedMetroConfig,
//   } = require('react-native-reanimated/metro-config');

// const path = require('path');

// // Find the workspace root, this can be replaced with `find-yarn-workspace-root`
// const workspaceRoot = path.resolve(__dirname, '../..');
// const projectRoot = __dirname;

// /**
//  * Metro configuration
//  * https://reactnative.dev/docs/metro
//  *
//  * @type {import('@react-native/metro-config').MetroConfig}
//  */
// const config = {
//     // monorepo config
//     // 1. Watch all files within the monorepo
//     watchFolders: [workspaceRoot],
//     resolver: {
//         // 2. Let Metro know where to resolve packages, and in what order
//         nodeModulesPaths: [
//             path.resolve(projectRoot, 'node_modules'),
//             path.resolve(workspaceRoot, 'node_modules'),
//         ],

//         // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
//         //NOTE: Resolve mismatch two version of react-native
//         disableHierarchicalLookup: true,
//     },
// };

// module.exports = wrapWithReanimatedMetroConfig(mergeConfig(getDefaultConfig(__dirname), config));

const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

// reanimated
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

// storybook

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== "svg").concat("tflite"),
    sourceExts: sourceExts.concat("svg", "mjs"),
  },
};

// module.exports = mergeConfig(defaultConfig, config);
const configWithReanimated = wrapWithReanimatedMetroConfig(
  mergeConfig(defaultConfig, config),
);


const mainConfig = configWithReanimated;

module.exports = mainConfig;
