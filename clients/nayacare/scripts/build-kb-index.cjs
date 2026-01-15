#!/usr/bin/env node
/*
  Build a lightweight KB index from Markdown files into public/kb_index.json
  - Parses front-matter
  - Produces searchable records with path, metadata, and text content
*/

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(process.cwd(), 'content', 'kb');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'kb_index.json');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((ent) => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) return walk(full);
    if (ent.isFile() && ent.name.endsWith('.md')) return [full];
    return [];
  });
}

function parseFrontMatter(md) {
  if (!md.startsWith('---')) return { data: {}, content: md };
  const end = md.indexOf('\n---', 3);
  if (end === -1) return { data: {}, content: md };
  const fm = md.slice(3, end).trim();
  const body = md.slice(end + 4).trim();
  const data = {};
  fm.split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    data[key] = value.replace(/^"|"$/g, '');
  });
  return { data, content: body };
}

function toPlainText(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*\s/g, '- ')
    .replace(/[\[\]\(\)#>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function build() {
  const files = walk(CONTENT_DIR);
  const records = files.map((file) => {
    const md = fs.readFileSync(file, 'utf8');
    const { data, content } = parseFrontMatter(md);
    const text = toPlainText(content);
    return {
      path: path.relative(CONTENT_DIR, file).replace(/\\/g, '/'),
      ...data,
      text
    };
  });

  if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ records }, null, 2));
  console.log(`KB index written: ${OUTPUT_FILE} (${records.length} records)`);
}

build();


