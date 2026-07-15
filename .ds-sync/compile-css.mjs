import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import { readFileSync, writeFileSync } from 'node:fs';

const IN = 'apps/client/src/styles/globals.css';
const OUT = 'apps/client/src/styles/_ds_compiled.css';
const css = readFileSync(IN, 'utf8');
// base = the client app dir so Tailwind v4 auto-scans its source for classes
const result = await postcss([tailwind()]).process(css, { from: IN, to: OUT });
writeFileSync(OUT, `@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0");\n` + result.css);
console.log('compiled', (result.css.length/1024).toFixed(0)+'KB ->', OUT);
