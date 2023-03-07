import { resolve } from 'path';
import { loadEnv, splitVendorChunkPlugin, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default ({ mode }: { mode: string }) => {
    process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
    return defineConfig({
        esbuild: {
            loader: 'tsx',
            include: [/\.(m?ts|[jt]sx?)$/],
            exclude: [],
        },
        optimizeDeps: {
            esbuildOptions: {
                loader: {
                    '.js': 'jsx',
                },
            },
        },
        build: {
            lib: {
                entry: resolve(__dirname, 'src/client/main.tsx'),
                name: 'turnilo',
                fileName: 'turnilo'
            },
            outDir: resolve(__dirname, 'build/public'),
            sourcemap: true,
            modulePreload: {
                polyfill: false,
            },
        },
        // resolve: {
        //     alias: {
        //         '@': path.resolve(__dirname, './src'),
        //         'react-is': path.join(__dirname, 'node_modules', 'react-is'),
        //     },
        // },
        plugins: [
            react(),
            splitVendorChunkPlugin(),
            visualizer({
                emitFile: true,
                filename: 'stats.html',
                template: 'treemap',
            }),
        ],
    });
};
