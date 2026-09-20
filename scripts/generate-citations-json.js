import fs from 'fs';

const content = fs.readFileSync('docs/corpus-canon.md', 'utf-8');
const citations = [];
const rowRegex =
  /^\|\s*(S-\d+|B-\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/gm;

let match;
while ((match = rowRegex.exec(content)) !== null) {
  citations.push({
    id: match[1].trim(),
    source: match[2].trim().replace(/\*\*/g, ''),
    detail: match[3].trim(),
    context: match[4].trim(),
  });
}

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/citations.json', JSON.stringify(citations));
console.log(
  `[prebuild] Generated public/citations.json (${citations.length} citations)`,
);
