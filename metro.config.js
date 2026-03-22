const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "react-native/src/private/inspector/getInspectorDataForViewAtPoint": path.resolve(__dirname, "shims/inspector-shim.js"),
  "react-native/src/private/inspector/InspectorOverlay": path.resolve(__dirname, "shims/inspector-overlay-shim.js"),
};

module.exports = withRorkMetro(config);
