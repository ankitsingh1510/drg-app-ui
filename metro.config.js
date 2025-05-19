const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
    wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');


let config = getDefaultConfig(__dirname);

config = wrapWithReanimatedMetroConfig(config);

module.exports = withNativeWind(config, { input: "./src/global.css" });
