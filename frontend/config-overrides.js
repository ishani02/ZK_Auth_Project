const webpack = require("webpack");

module.exports = function override(config) {
    config.resolve.fallback = {
        buffer: require.resolve("buffer"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert"),
        process: require.resolve("process/browser")
    };

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
            process: "process/browser.js"
        })
    ]);

    return config;
};
