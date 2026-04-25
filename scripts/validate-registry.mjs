#!/usr/bin/env node
/**
 * Validates every entry in registry.json:
 *   1. registry.json is well-formed with required fields
 *   2. Each book's URL is reachable (HTTP 200)
 *   3. book.json (or books.json for collections) is valid JSON with the
 *      correct schema field and a non-empty title
 *
 * Full cross-reference validation (broken gotos, etc.) still happens
 * client-side in the app. This script is the CI gate for PR submissions.
 */

import { readFileSync } from 'fs';

const RAW_BASE = 'https://raw.githubusercontent.com';
const SCHEMA_VERSION = 'book-of-infinite-tales/v1';
const INDEX_SCHEMA_VERSION = 'book-of-infinite-tales/index/v1';

function rawUrl(owner, repo, ref, path, file) {
  const dir = path ? `${path.replace(/\/$/, '')}/` : '';
  return `${RAW_BASE}/${owner}/${repo}/${ref ?? 'main'}/${dir}${file}`;
}

async function validateEntry(entry, index) {
  const prefix = `registry.books[${index}]`;

  if (!entry.repo || typeof entry.repo !== 'string') {
    throw new Error(`${prefix}: missing or invalid "repo" field`);
  }
  if (!entry.title || typeof entry.title !== 'string') {
    throw new Error(`${prefix}: missing or invalid "title" field`);
  }
  if (!entry.author || typeof entry.author !== 'string') {
    throw new Error(`${prefix}: missing or invalid "author" field`);
  }

  const parts = entry.repo.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`${prefix}: "repo" must be "owner/repo", got "${entry.repo}"`);
  }
  const [owner, repo] = parts;

  if (entry.path !== undefined && typeof entry.path !== 'string') {
    throw new Error(`${prefix}: "path" must be a string`);
  }

  const bookUrl = rawUrl(owner, repo, 'HEAD', entry.path, 'book.json');
  const bookResp = await fetch(bookUrl);

  if (bookResp.ok) {
    let manifest;
    try {
      manifest = await bookResp.json();
    } catch {
      throw new Error(`${prefix}: book.json at ${bookUrl} is not valid JSON`);
    }
    if (manifest.schema !== SCHEMA_VERSION) {
      throw new Error(
        `${prefix}: book.json schema is "${manifest.schema ?? '(missing)'}", expected "${SCHEMA_VERSION}"`,
      );
    }
    if (!manifest.title) {
      throw new Error(`${prefix}: book.json is missing a title`);
    }
    console.log(`  ✓ ${entry.title} — book.json OK`);
    return;
  }

  if (bookResp.status !== 404) {
    throw new Error(
      `${prefix}: fetching book.json returned HTTP ${bookResp.status} (expected 200 or 404)`,
    );
  }

  // No book.json — try books.json (collection)
  if (entry.path) {
    throw new Error(
      `${prefix}: no book.json found at ${bookUrl} (HTTP 404). ` +
        `If this is a collection, omit "path" and provide a books.json at the repo root.`,
    );
  }

  const indexUrl = rawUrl(owner, repo, 'HEAD', undefined, 'books.json');
  const indexResp = await fetch(indexUrl);
  if (!indexResp.ok) {
    throw new Error(
      `${prefix}: neither book.json nor books.json found in ${entry.repo} ` +
        `(book.json: 404, books.json: HTTP ${indexResp.status})`,
    );
  }

  let indexData;
  try {
    indexData = await indexResp.json();
  } catch {
    throw new Error(`${prefix}: books.json is not valid JSON`);
  }
  if (indexData.schema !== INDEX_SCHEMA_VERSION) {
    throw new Error(
      `${prefix}: books.json schema is "${indexData.schema ?? '(missing)'}", expected "${INDEX_SCHEMA_VERSION}"`,
    );
  }
  if (!indexData.title) {
    throw new Error(`${prefix}: books.json is missing a title`);
  }
  if (!Array.isArray(indexData.books) || indexData.books.length === 0) {
    throw new Error(`${prefix}: books.json must have a non-empty "books" array`);
  }
  console.log(`  ✓ ${entry.title} — books.json collection OK (${indexData.books.length} books)`);
}

async function main() {
  let registry;
  try {
    const raw = readFileSync('registry.json', 'utf8');
    registry = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse registry.json:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(registry.books)) {
    console.error('registry.json must have a "books" array');
    process.exit(1);
  }

  console.log(`Validating ${registry.books.length} book(s)…\n`);

  const errors = [];
  for (let i = 0; i < registry.books.length; i++) {
    try {
      await validateEntry(registry.books[i], i);
    } catch (e) {
      errors.push(e.message);
      console.error(`  ✗ ${e.message}`);
    }
  }

  console.log('');
  if (errors.length > 0) {
    console.error(`Validation failed with ${errors.length} error(s).`);
    process.exit(1);
  }
  console.log('All books validated successfully.');
}

main();
