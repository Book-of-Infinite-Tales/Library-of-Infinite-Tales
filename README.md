# Library of Infinite Tales

A curated community registry of books for the [Book of Infinite Tales](https://github.com/RobMcA/Book-of-Infinite-Tales) reader app.

## What is this?

The Book of Infinite Tales reader app fetches `registry.json` from this repo to populate its **Community Books** section. Each entry points to a public GitHub repo containing a fan-created book (or collection of books) built with the Tales of the Arthurian Knights supplement format.

## Adding your book

Open a pull request that adds one entry to `registry.json`. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full submission guide — including the required fields, how to test your book in the app before submitting, and what CI checks must pass.

If you're starting from scratch, use the [Book-of-Tales-Template](https://github.com/RobMcA/Book-of-Tales-Template) to scaffold a new book.

## CI validation

Every pull request runs `scripts/validate-registry.mjs`, which:

1. Checks that each registry entry has the required fields (`repo`, `title`, `author`).
2. Fetches the book's `book.json` (or `books.json` for collections) from GitHub to confirm it is reachable and well-formed.
3. Verifies the schema version matches what the reader app expects.

PRs that fail validation cannot be merged.

To run the validator locally:

```
npm run validate
```

## Related repos

| Repo | Purpose |
|---|---|
| [RobMcA/Book-of-Infinite-Tales](https://github.com/RobMcA/Book-of-Infinite-Tales) | The reader app |
| [RobMcA/Book-of-Tales-Template](https://github.com/RobMcA/Book-of-Tales-Template) | Template for creating a new book |
