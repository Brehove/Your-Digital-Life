import { getCollection } from "astro:content";

const publicPageIds = new Set([
  "what-a-prompt-costs",
  "inventory-your-day",
  "sources-and-method",
  "resources",
  "about-this-site",
  "data",
  "contribute"
]);
const headerNavPageIds = new Set([
  "sources-and-method",
  "about-this-site"
]);
const footerNavPageIds = new Set([
  "inventory-your-day",
  "sources-and-method",
  "about-this-site",
  "data",
  "contribute"
]);

function getPageKey(page: { id: string; data: { slug?: string } }) {
  return page.data.slug ?? page.id;
}

export function isPublicPage(page: { id: string; data: { slug?: string } }) {
  return publicPageIds.has(getPageKey(page));
}

export async function getPageById(id: string) {
  const pages = await getCollection("pages");
  return pages.find((page) => page.id === id || page.data.slug === id);
}

export async function getNavPages(location: "header" | "footer" = "header") {
  const pages = await getCollection("pages");
  const allowedIds = location === "footer" ? footerNavPageIds : headerNavPageIds;

  return pages
    .filter((page) => allowedIds.has(getPageKey(page)))
    .sort((left, right) => left.data.order - right.data.order);
}

export function sortByTitle<T extends { data: { title: string } }>(entries: T[]) {
  return [...entries].sort((left, right) =>
    left.data.title.localeCompare(right.data.title)
  );
}

export function getPageSlug(page: { id: string; data: { slug?: string } }) {
  return getPageKey(page);
}
