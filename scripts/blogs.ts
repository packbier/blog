import fs from "fs";
import path from "path";

export const BASE_DIR = path.join(__dirname, "..");

export type BlogPost = {
    slug: string;
    title: string;
    draft: boolean;
    tags: string[];
    date: string;

    filePath: string;
};

type Frontmatter = {
    title?: string;
    date?: string;
    draft?: boolean;
    tags?: string[];
};

function collectMarkdownFiles(root: string): string[] {
    const stack = [root];
    const files: string[] = [];

    while (stack.length > 0) {
        const current = stack.pop();
        if (!current || !fs.existsSync(current)) continue;
        const stat = fs.statSync(current);

        if (stat.isDirectory()) {
            const entries = fs.readdirSync(current);
            for (const entry of entries) {
                if (entry.startsWith(".")) continue;
                stack.push(path.join(current, entry));
            }
        } else if (stat.isFile() && current.endsWith(".md")) {
            files.push(current);
        }
    }

    return files;
}

function parseFrontmatter(content: string): Frontmatter {
    const match = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
    if (!match || !match[1]) return {};

    const lines = match[1].split(/\r?\n/);
    const data: Record<string, unknown> = {};

    for (const line of lines) {
        const [rawKey, ...rawRest] = line.split(":");
        if (!rawKey || rawRest.length === 0) continue;

        const key = rawKey.trim();
        const rawValue = rawRest.join(":").trim();
        if (!key || !rawValue) continue;

        if (rawValue === "true" || rawValue === "false") {
            data[key] = rawValue === "true";
            continue;
        }

        if (/^\[.*\]$/.test(rawValue)) {
            try {
                const parsed = JSON.parse(rawValue.replace(/'/g, '"'));
                if (Array.isArray(parsed)) {
                    data[key] = parsed.map((item) => String(item)).filter(Boolean);
                    continue;
                }
            } catch { }
        }

        const unquoted = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
        data[key] = unquoted;
    }

    return data as Frontmatter;
}

function deriveDateFromPath(relativePath: string): string | null {
    const normalized = relativePath.replace(/\\/g, "/");
    const fullDate = normalized.match(/(\d{4})\/(\d{2})\/(\d{2})/);
    if (fullDate) {
        const [, y, m, d] = fullDate;
        return `${y}-${m}-${d}`;
    }

    const yearMonth = normalized.match(/(\d{4})\/(\d{2})/);
    if (yearMonth) {
        const [, y, m] = yearMonth;
        return `${y}-${m}-01`;
    }

    return null;
}

function normalizeSlug(fileName: string): string {
    return fileName.replace(/\.md$/, "").replace(/^\d{2,}-/, "");
}

function parseTags(raw: unknown): string[] {
    if (Array.isArray(raw)) {
        return raw.map((tag) => String(tag).trim()).filter(Boolean);
    }

    if (typeof raw === "string") {
        const cleaned = raw.replace(/\[|\]|"|'/g, "");
        return cleaned
            .split(/,\s*/)
            .map((tag) => tag.trim())
            .filter(Boolean);
    }

    return [];
}

function collectBlogPosts(): BlogPost[] {
    const today = new Date();
    const posts: BlogPost[] = [];

    const files = collectMarkdownFiles(BASE_DIR);

    for (const file of files) {
        const content = fs.readFileSync(file, "utf8");
        const frontmatter = parseFrontmatter(content);
        const relativePath = path.relative(BASE_DIR, file);

        const dateStr = frontmatter.date || deriveDateFromPath(relativePath);
        if (!dateStr) continue;

        const postDate = new Date(dateStr);
        if (Number.isNaN(postDate.getTime()) || postDate > today) continue;

        const draft = Boolean(frontmatter.draft);
        if (draft) continue;

        const slug = normalizeSlug(path.basename(file));
        const tags = parseTags(frontmatter.tags);

        posts.push({
            slug,
            title: frontmatter.title || slug.replace(/-/g, " "),
            draft,
            tags,
            date: dateStr,
            filePath: relativePath.replace(/\\/g, "/"),
        });
    }

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return posts;
}

export function allBlogPosts(): BlogPost[] {
    return collectBlogPosts();
}

export function lastBlogPosts(count: number): BlogPost[] {
    return collectBlogPosts().slice(0, Math.max(0, count));
}

export function buildEntriesIndex(outFile = path.join(BASE_DIR, "build", "entries.json")): BlogPost[] {
    const posts = collectBlogPosts();
    const targetDir = path.dirname(outFile);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(posts, null, 2));
    return posts;
}