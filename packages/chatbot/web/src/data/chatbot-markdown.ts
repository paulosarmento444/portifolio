export const parseChatbotMarkdown = (text: string): string =>
  text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code class="rounded-md border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-1.5 py-0.5 text-sm text-[color:var(--site-color-foreground-strong)]">$1</code>',
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-[color:var(--site-color-primary)] underline underline-offset-2 hover:text-[color:var(--site-color-primary-strong)]" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(/\n/g, "<br>");
