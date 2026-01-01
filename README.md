# blog

A tiny markdown blog workspace: create dated entries, generate an index for clients, and serve or fetch raw posts directly from GitHub.

## Folder layout

- Year/month/day directories under the repo root (for example `2025/12/31/slug.md`).
- Each post starts with YAML frontmatter:

```md
---
title: "My post title"
date: 2025-12-31
draft: false
tags: [life, notes]
---
```

## CLI (run with bun)

Commands live in [index.ts](index.ts).

- `bun index.ts create-entry <title> [--year YYYY] [--month MM] [--day DD]`: create a dated post using the template in [scripts/template.ts](scripts/template.ts).
- `bun index.ts list [year] [month]`: list posts (filters optional).
- `bun index.ts build`: write `build/blog-index.json` via [scripts/blogs.ts](scripts/blogs.ts) for client use.

## Fetch a raw post

You can pull markdown straight from GitHub’s raw endpoint. Example (JavaScript):

```js
const url = "https://raw.githubusercontent.com/packbier/blog/refs/heads/main/2025/12/31/my-2nd-blog.md";
const text = await fetch(url).then((res) => res.text());
console.log(text);
```

## Frontmatter rules

- `draft: true` entries are skipped.
- `date` defaults to the path-derived date (`YYYY/MM/DD` or `YYYY/MM/01`).
- `tags` accepts arrays or comma-separated strings.
- Posts are sorted newest-first in the generated index.
