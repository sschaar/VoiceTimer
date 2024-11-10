const webpack = require('webpack');

module.exports = function override(config) {
    // Mock 'fs' for the browser
    config.resolve.fallback = {
        fs: false,
    };

    return config;
};
