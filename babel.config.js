module.exports = api => {
    api.cache(true);
    return {
        env: {
            legacy: {
                passPerPreset: true,
                presets: [
                    "@babel/preset-typescript",
                    ["@babel/preset-env", {
                        modules: false,
                        targets: "> 0.25%, last 2 versions, Firefox ESR",
                    }],
                    ["@babel/preset-react", {
                        development: false,
                        useBuiltIns: true,
                    }]
                ],
                plugins: [
                    "@babel/plugin-proposal-class-properties"
                ]
            },
            modern: {
                passPerPreset: true,
                presets: [
                    "@babel/preset-typescript",
                    ["@babel/preset-env", {
                        modules: false,
                        targets: {
                            esmodules: true,
                        },
                        bugfixes: true,
                    }],
                    ["@babel/preset-react", {
                        development: false,
                        useBuiltIns: true,
                    }]
                ],
                plugins: [
                    "@babel/plugin-proposal-class-properties"
                ]
            }
        }
    }
}
