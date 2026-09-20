import fs from 'fs';

const content = fs.readFileSync('docs/corpus-canon.md', 'utf-8');

const citations = [];

// Regex to match markdown table rows: | ID | Source/Citation | Detail | Context |
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

const tsContent = `export interface Citation {
  id: string;
  source: string;
  detail: string;
  context: string;
}

export const citations: Citation[] = ${JSON.stringify(citations, null, 2)};
`;

fs.writeFileSync('src/data/citations.ts', tsContent);
console.log(`Extracted ${citations.length} citations to src/data/citations.ts`);
