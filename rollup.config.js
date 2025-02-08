import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').OutputOptions[]} */
const output = [
    {
        format: 'umd',
        name: 'maestro',
        file: 'dist/maestro.umd.cjs',
    },
    {
        format: 'es',
        dir: 'dist',
        preserveModules: true,
        preserveModulesRoot: 'src',
    },
];

/** @type {import('rollup').InputPluginOption} */
const plugins = [
    nodeResolve(),
    typescript(),
];

/** @type {import('rollup').RollupOptions} */
export default {
    input: 'src/maestro.ts',
    output,
    plugins,
}
