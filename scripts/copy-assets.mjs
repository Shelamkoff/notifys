import {copyFile, writeFile} from 'node:fs/promises';

await copyFile(new URL('../src/notify.css', import.meta.url), new URL('../dist/notify.css', import.meta.url));

await Promise.all([
    writeFile(new URL('../notify.js', import.meta.url), "export * from './dist/index.js';\n"),
    writeFile(new URL('../notify.css', import.meta.url), "@import './dist/notify.css';\n"),
    writeFile(new URL('../dist/notify.js', import.meta.url), "export * from './index.js';\n"),
    writeFile(new URL('../dist/notify.min.js', import.meta.url), "export * from './index.js';\n"),
    writeFile(new URL('../dist/notify.min.css', import.meta.url), "@import './notify.css';\n"),
]);
