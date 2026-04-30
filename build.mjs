import * as esbuild from 'esbuild';
import { mkdir, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist', 'youtube-disliked');
const watch = process.argv.includes('--watch');

async function copyStatic() {
    await cp(path.join(__dirname, 'manifest.json'), path.join(distDir, 'manifest.json'));
    await cp(path.join(__dirname, 'src', 'popup.html'), path.join(distDir, 'popup.html'));
    await cp(path.join(__dirname, 'src', 'popup.css'), path.join(distDir, 'popup.css'));
    await cp(path.join(__dirname, 'src', 'content.css'), path.join(distDir, 'content.css'));
    await cp(path.join(__dirname, 'icons'), path.join(distDir, 'icons'), { recursive: true });
    await cp(path.join(__dirname, '_locales'), path.join(distDir, '_locales'), { recursive: true });
}

const sharedOptions = {
    bundle: true,
    target: ['chrome120'],
    format: 'iife',
    sourcemap: !process.env.NODE_ENV || process.env.NODE_ENV !== 'production' ? 'inline' : false,
    minify: process.env.NODE_ENV === 'production',
    logLevel: 'info',
};

const entries = [
    { in: 'src/background.ts', out: 'background', format: 'esm' },
    { in: 'src/content.ts', out: 'content' },
    { in: 'src/popup.ts', out: 'popup' },
];

async function build() {
    await rm(distDir, { recursive: true, force: true });
    await mkdir(distDir, { recursive: true });

    const ctxs = await Promise.all(
        entries.map((e) =>
            esbuild.context({
                ...sharedOptions,
                format: e.format ?? sharedOptions.format,
                entryPoints: [path.join(__dirname, e.in)],
                outfile: path.join(distDir, `${e.out}.js`),
            }),
        ),
    );

    if (watch) {
        for (const ctx of ctxs) await ctx.watch();
        await copyStatic();
        console.log(`[watch] dist -> ${distDir}`);
    } else {
        for (const ctx of ctxs) {
            await ctx.rebuild();
            await ctx.dispose();
        }
        await copyStatic();
        console.log(`[build] done -> ${distDir}`);
    }
}

build().catch((err) => {
    console.error(err);
    process.exit(1);
});
