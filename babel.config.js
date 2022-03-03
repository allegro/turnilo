

module.exports = (api) => {
    api.cache(true);
    return {
        passPerPreset: true,
        plugins: [
            "@babel/plugin-proposal-class-properties",
            ["@babel/plugin-transform-runtime", {
                useESModules: true,
                version: '^7.16.0',
            }],
        ],
        presets: [
            "@babel/preset-typescript",
            ["@babel/preset-react", {
                development: false,
                useBuiltIns: true,
            }]
        ],
        env: {
            legacy: {
                presets: [
                    ["@babel/preset-env", {
                        modules: false,
                        targets: "> 0.25%, last 2 versions, Firefox ESR",
                    }],
                ],
            },
            modern: {
                presets: [
                    ["@babel/preset-env", {
                        modules: false,
                        targets: {
                            esmodules: true,
                        },
                        bugfixes: true,
                    }],
                ],
            }
        }
    }
}
