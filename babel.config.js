

module.exports = (api) => {
    api.cache(true);
    return {
        passPerPreset: true,
        plugins: [
            "@babel/plugin-proposal-class-properties"
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
