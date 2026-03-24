"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Facebook,
  Linkedin,
  Share2,
  Twitter,
} from "lucide-react";
import { EditorialSurface, MediaFrame, SectionShell, SecondaryButton, SurfaceCard } from "@site/shared";
import { buildStoryEmbedUrl, isBlogWebStoryContent } from "../../lib/blog.utils";

interface PostContentProps {
  post: {
    title: string;
    content: string;
  };
  wordpressPublicUrl?: string;
}

export function PostContent({ post, wordpressPublicUrl }: PostContentProps) {
  const [copied, setCopied] = useState(false);

  const isWebStory = useMemo(
    () => isBlogWebStoryContent(post?.content || ""),
    [post?.content],
  );

  const embedUrl = useMemo(
    () => buildStoryEmbedUrl(post?.content || "", wordpressPublicUrl),
    [post?.content, wordpressPublicUrl],
  );

  const processedHtml = useMemo(() => {
    if (isWebStory) {
      return "";
    }

    return post?.content || "";
  }, [post?.content, isWebStory]);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => console.error("Error copying:", error));
  };

  const sharePost = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post?.title || "Artigo interessante",
          url: currentUrl,
        })
        .catch((error) => console.error("Error sharing:", error));
    } else {
      copyLink();
    }
  };

  return (
    <SectionShell container="content" spacing="compact" stack="page">
      <SurfaceCard tone="soft" className="site-stack-section">
        <div className="flex flex-col gap-4 border-b border-[color:var(--site-color-border)] pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="site-text-meta uppercase tracking-[0.14em]">Leitura e distribuição</p>
            <h2 className="site-text-card-title">Continue a leitura ou compartilhe este conteúdo.</h2>
            <p className="site-text-body text-sm">Os botões abaixo preservam o fluxo atual de compartilhamento do artigo.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="site-button site-button-ghost !h-11 !w-11 !rounded-full !px-0 !py-0"
              aria-label="Compartilhar no Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="site-button site-button-ghost !h-11 !w-11 !rounded-full !px-0 !py-0"
              aria-label="Compartilhar no Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="site-button site-button-ghost !h-11 !w-11 !rounded-full !px-0 !py-0"
              aria-label="Compartilhar no LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <SecondaryButton
              size="sm"
              onClick={copyLink}
              leadingIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            >
              {copied ? "Link copiado" : "Copiar link"}
            </SecondaryButton>
            <SecondaryButton size="sm" onClick={sharePost} leadingIcon={<Share2 className="h-4 w-4" />}>
              Compartilhar
            </SecondaryButton>
          </div>
        </div>
      </SurfaceCard>

      {isWebStory && embedUrl ? (
        <SurfaceCard tone="soft" className="site-stack-section">
          <MediaFrame aspect="portrait" className="mx-auto w-full max-w-[560px]">
            <iframe
              src={embedUrl}
              title={post.title}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="eager"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[9/16] w-full"
            />
          </MediaFrame>
        </SurfaceCard>
      ) : isWebStory ? (
        <SurfaceCard tone="soft" className="site-stack-section">
          <p className="site-text-body">
            Esta web story não pôde ser incorporada automaticamente. Use os botões de compartilhamento para abrir a publicação completa no WordPress.
          </p>
        </SurfaceCard>
      ) : (
        <EditorialSurface compact>
          <article
            className="prose prose-slate max-w-none prose-headings:text-[color:var(--site-color-foreground-strong)] prose-headings:font-semibold prose-h2:mt-10 prose-h2:text-3xl prose-h3:mt-8 prose-h3:text-2xl prose-p:text-[color:var(--site-color-foreground)] prose-p:leading-8 prose-a:text-[color:var(--site-color-primary)] prose-a:no-underline hover:prose-a:underline prose-strong:text-[color:var(--site-color-foreground-strong)] prose-li:text-[color:var(--site-color-foreground)] prose-blockquote:border-l-[color:var(--site-color-primary)] prose-blockquote:bg-[color:var(--site-color-surface-soft)] prose-blockquote:py-2 prose-blockquote:px-5 prose-pre:border prose-pre:border-[color:var(--site-color-border)] prose-pre:bg-[color:var(--site-color-surface-inset)] prose-img:rounded-[var(--site-radius-lg)] prose-img:border prose-img:border-[color:var(--site-color-border)]"
            onClick={(event) => {
              const target = event.target as HTMLElement;
              const anchor = target.closest && target.closest("a");
              if (
                anchor &&
                typeof (anchor as HTMLAnchorElement).href === "string"
              ) {
                const href = (anchor as HTMLAnchorElement).href;
                if (/web-stor/i.test(href)) {
                  event.preventDefault();
                }
              }
            }}
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        </EditorialSurface>
      )}
    </SectionShell>
  );
}
