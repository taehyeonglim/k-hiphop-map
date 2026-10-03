import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const files = ['README.md', 'README.en.md', 'CONTRIBUTING.md', 'docs/architecture.md', 'docs/data-pipeline.md', 'docs/operations.md', 'docs/trailer.md', 'docs/qa.md', 'docs/images/README.md'];
const errors = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const links = [...text.matchAll(/\]\(([^)]+)\)|src="([^"]+)"/g)].map(match => match[1] || match[2]);
  for (const raw of links) {
    const link = raw.split('#')[0];
    if (!link || /^(https?:|mailto:|\/)/.test(link)) continue;
    if (!existsSync(resolve(dirname(file), link))) errors.push(`${file}: missing ${link}`);
  }
}
const commands = file => [...readFileSync(file, 'utf8').matchAll(/```sh\n([\s\S]*?)```/g)].map(match => match[1].split('\n').filter(line => line && !line.startsWith('#')).join('\n'));
if (JSON.stringify(commands('README.md')) !== JSON.stringify(commands('README.en.md'))) errors.push('README command examples differ between languages');
const countSections = file => (readFileSync(file, 'utf8').match(/^## /gm) || []).length;
if (countSections('README.md') !== countSections('README.en.md')) errors.push('README section counts differ');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Checked local documentation links and bilingual command parity (${files.length} documents).`);
