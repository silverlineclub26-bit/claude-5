// 將 index.src.html 內的 JSX 先編譯成純 JS，產出最佳化的 index.html（部署用）。
// 用法：node build.mjs
import fs from 'node:fs';
import esbuild from 'esbuild';

const src = fs.readFileSync('index.src.html', 'utf8');

const m = src.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
if (!m) { console.error('找不到 <script type="text/babel"> 區塊'); process.exit(1); }

const out = esbuild.transformSync(m[1], {
  loader: 'jsx',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  minify: true,
  target: 'es2018',
  charset: 'utf8',
});

const html = src
  // 移除瀏覽器端 Babel（改用預先編譯，載入更快）
  .replace(/\n\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone[^>]*><\/script>/, '')
  // 換成已編譯的純 JS
  .replace(/<script type="text\/babel"[^>]*>[\s\S]*?<\/script>/, `<script>${out.code}</script>`);

fs.writeFileSync('index.html', html);
console.log(`index.html 產出完成（${(html.length / 1024).toFixed(0)} KB）`);
