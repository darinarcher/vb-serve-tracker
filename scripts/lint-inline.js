const fs = require('fs');
const path = require('path');
const { ESLint } = require('eslint');

async function main() {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/);

  if (!match) {
    throw new Error('No inline <script> found in index.html');
  }

  const scriptStart = html.indexOf(match[1]);
  const linePadding = html
    .slice(0, scriptStart)
    .replace(/[^\n]/g, ' ');
  const source = linePadding + match[1];
  const eslint = new ESLint();
  const results = await eslint.lintText(source, { filePath: 'index.inline.js' });
  const formatter = await eslint.loadFormatter('stylish');
  const output = formatter.format(results);

  if (output) {
    console.log(output);
  }

  const issueCount = results.reduce(
    (count, result) => count + result.errorCount + result.warningCount,
    0
  );

  if (issueCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
