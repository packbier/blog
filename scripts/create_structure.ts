import fs from "fs";
import path from "path";
import { createTemplate } from "./template";
import { allBlogPosts, buildEntriesIndex } from "./blogs";

export const BASE_DIR = path.join(__dirname, "..");

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

export function createBlogEntry(year: number, month: number, day: number, title: string): void {
    const slug = slugify(title);
    const yearStr = year.toString();
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');

    const filename = `${slug}.md`;

    const filePath = path.join(BASE_DIR, yearStr, monthStr, dayStr, filename);

    if (fs.existsSync(filePath)) {
        console.log(`ERROR: Blog entry already exists: ${yearStr}/${monthStr}/${dayStr}/${filename}`);
        return;
    }

    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });

    const content = createTemplate(title, year, month, day);
    fs.writeFileSync(filePath, content);
    console.log(`INFO: Created blog entry: ${yearStr}/${monthStr}/${dayStr}/${filename}`);
}

export function createYearlyStructure(year: number): void {
    const yearStr = year.toString();
    for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, "0");
        const dir = path.join(BASE_DIR, yearStr, monthStr);
        fs.mkdirSync(dir, { recursive: true });
    }
    console.log(`INFO: Created year structure for ${yearStr}`);
}

export function listBlogEntries(year?: number, month?: number): void {
    const posts = allBlogPosts().filter((post) => {
        if (!year) return true;
        const [y, m] = post.date.split("-");
        if (Number(y) !== year) return false;
        if (!month) return true;
        return Number(m) === month;
    });

    if (posts.length === 0) {
        console.log("No blog entries found.");
        return;
    }

    for (const post of posts) {
        console.log(`${post.date} - ${post.title} (${post.filePath})`);
    }
}

export function buildIndex(): void {
    const outputPath = path.join(BASE_DIR, "build", "blog-index.json");
    const posts = buildEntriesIndex(outputPath);
    console.log(`INFO: Wrote ${posts.length} entries to build/blog-index.json`);
}