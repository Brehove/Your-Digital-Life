export interface SourceLike {
  title: string;
  organization: string;
  authors: string[];
  url: string;
  publishedDate: string;
  sourceType: string;
}

export function getSourceLabel(source: SourceLike) {
  const year = source.publishedDate.slice(0, 4);

  if (source.sourceType === "Internal synthesis") {
    return `Internal synthesis (${year})`;
  }

  if (source.authors.length > 0) {
    const leadAuthor = source.authors[0];
    if (source.authors.length === 1 && leadAuthor.trim() === source.organization.trim()) {
      return `${source.organization} (${year})`;
    }
    const lastName = leadAuthor.trim().split(/\s+/).at(-1) ?? leadAuthor;
    return source.authors.length > 1 ? `${lastName} et al. (${year})` : `${lastName} (${year})`;
  }

  return `${source.organization} (${year})`;
}

export function hasPublicUrl(source: Pick<SourceLike, "url">) {
  return source.url.startsWith("https://") || source.url.startsWith("http://");
}
