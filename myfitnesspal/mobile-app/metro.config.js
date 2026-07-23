const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const backendRoot = path.resolve(projectRoot, "../backend");

const config = getDefaultConfig(projectRoot);

// Watch the backend folder for type imports
config.watchFolders = [backendRoot];

// Resolve backend imports
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(backendRoot, "node_modules"),
];

// Ensure the backend folder can be resolved
config.resolver.extraNodeModules = {
  "@backend": path.resolve(backendRoot, "src"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
