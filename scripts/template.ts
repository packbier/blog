export function createTemplate(title: string, year: number, month: number, day: number): string {
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0];

    return `---
title: "${title}"
date: ${dateStr}
draft: false
tags: []
---

# ${title}

Write your blog content here...

## Section 1

Your content...

## Section 2

More content...

---

*Published on ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}*
`;
}