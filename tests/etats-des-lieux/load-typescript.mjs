// Test-only loader for pure modules. Never used by application routes or Auth.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const cache = new Map();
export function loadTs(path) {
  const file = resolve(path);
  if (cache.has(file)) return cache.get(file).exports;
  const loaded = { exports: {} }; cache.set(file, loaded);
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const localRequire = name => name.startsWith('.') ? loadTs(resolve(dirname(file), name + '.ts')) : require(name);
  new Function('require', 'module', 'exports', outputText)(localRequire, loaded, loaded.exports);
  return loaded.exports;
}
