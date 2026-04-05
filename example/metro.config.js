// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const exampleNodeModules = path.resolve(__dirname, 'node_modules');
const parentNodeModules = path.resolve(__dirname, '..', 'node_modules');
const pinnedModules = ['expo', 'expo-modules-core', 'react', 'react-native'];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// npm v7+ will install ../node_modules/react and ../node_modules/react-native because of peerDependencies.
// To prevent the incompatible react-native between ./node_modules/react-native and ../node_modules/react-native,
// excludes the one from the parent folder when bundling.
config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  ...pinnedModules.map((moduleName) => {
    const modulePath = path.join(parentNodeModules, moduleName);
    return new RegExp(`^${escapeRegExp(modulePath)}([\\\\/].*)?$`);
  }),
];

config.resolver.nodeModulesPaths = [
  exampleNodeModules,
  parentNodeModules,
];

config.resolver.extraNodeModules = {
  'expo-draw-over-apps': path.resolve(__dirname, '..'),
  expo: path.join(exampleNodeModules, 'expo'),
  'expo-modules-core': path.join(exampleNodeModules, 'expo-modules-core'),
  react: path.join(exampleNodeModules, 'react'),
  'react-native': path.join(exampleNodeModules, 'react-native'),
};

config.watchFolders = [path.resolve(__dirname, '..')];

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
