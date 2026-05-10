# Library of Infinite Tales

The **Library of Infinite Tales** is the community book registry for the [Book of Infinite Tales](https://github.com/RobMcA/Book-of-Infinite-Tales) ecosystem — a platform for creating and reading branching, choose-your-own-adventure style books.

This repo holds `registry.json`, the list of community-submitted books that appears in the reader app's **Community Books** section. Anyone can publish a book and submit it here via pull request.

## The ecosystem

| Repo | What it is |
|---|---|
| [RobMcA/Book-of-Infinite-Tales](https://github.com/RobMcA/Book-of-Infinite-Tales) | The reader app — browse and read books from the community registry |
| [RobMcA/Book-of-Tales-Template](https://github.com/RobMcA/Book-of-Tales-Template) | Starter kit for creating your own book or book collection |
| [RobMcA/book-of-tales-example](https://github.com/RobMcA/book-of-tales-example) | Example book collection showing the format in action |
| [RobMcA/Library-of-Infinite-Tales](https://github.com/RobMcA/Library-of-Infinite-Tales) | This repo — the community registry |

## Adding your book

Open a pull request that adds one entry to `registry.json`. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full submission guide — including the required fields, how to test your book in the app before submitting, and what CI checks must pass.

If you're starting from scratch, use the [Book-of-Tales-Template](https://github.com/RobMcA/Book-of-Tales-Template) to scaffold a new book, or browse [book-of-tales-example](https://github.com/RobMcA/book-of-tales-example) to see how a finished book collection is structured.

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
