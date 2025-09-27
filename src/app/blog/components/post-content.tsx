"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Share2,
  Bookmark,
  Copy,
  Check,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";

interface Post {
  title: string;
  content: string;
}

interface PostContentProps {
  post: Post;
}

export default function PostContent({ post }: PostContentProps) {
  const [copied, setCopied] = useState(false);

  // Detecta conteúdo Web Stories (amp-story / iframe stories)
  const isWebStory = useMemo(() => {
    const html = post?.content || "";
    return /<amp-story|class=["']web-stories|<iframe[^>]+stories/i.test(html);
  }, [post?.content]);

  // Tenta extrair URL de Web Stories (href/src que contenha web-stories)
  const storyUrl = useMemo(() => {
    const html = post?.content || "";
    const hrefMatch = html.match(/href=["']([^"']*web-stories[^"']*)["']/i);
    if (hrefMatch?.[1]) return hrefMatch[1];
    const srcMatch = html.match(/src=["']([^"']*web-stories[^"']*)["']/i);
    if (srcMatch?.[1]) return srcMatch[1];
    return "";
  }, [post?.content]);

  // URL de embed (…/web-stories/slug/embed/)
  const embedUrl = useMemo(() => {
    if (!storyUrl) return "";
    let url = storyUrl.trim();
    if (url.startsWith("/")) {
      const base = process.env.NEXT_PUBLIC_WORDPRESS_URL || "";
      if (base) url = base.replace(/\/$/, "") + url;
    }
    // canonical base
    const canonical = url
      .replace(/\/?embed\/?(\?.*)?$/i, "/")
      .replace(/\/?$/, "/");
    // prefer path embed
    const embedPath = `${canonical}`;
    // also provide output=embed and amp hints
    const sep = embedPath.includes("?") ? "&" : "?";
    const candidate = `${embedPath}${sep}output=embed&mute=1&playsinline=1#amp=1`;
    return candidate;
  }, [storyUrl]);

  // Sanitiza links e remove embeds originais para evitar imagem estática
  const processedHtml = useMemo(() => {
    let html = post?.content || "";
    if (!html) return "";
    if (isWebStory) {
      // Para Web Stories, não exibimos nenhum HTML do post para evitar imagem/poster
      return "";
    }
    return html;
  }, [post?.content, isWebStory]);

  // Sem player JS: utilizamos iframe do /embed/ (sem links externos)

  const copyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Error copying:", err));
  };

  const sharePost = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post?.title || "Artigo interessante",
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      copyLink();
    }
  };

  return (
    <section className="relative py-20 px-6 bg-gray-950 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto -mt-16">
        <motion.article
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>

          {/* Card Background */}
          <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 overflow-hidden">
            {!isWebStory ? (
              <div className="flex justify-between p-6 border-b border-gray-700/50">
                <div className="flex gap-3">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full text-gray-400 hover:text-white hover:bg-blue-600/20 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
                    aria-label="Compartilhar no Facebook"
                  >
                    <Facebook size={18} />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full text-gray-400 hover:text-white hover:bg-sky-500/20 border border-gray-700/50 hover:border-sky-500/50 transition-all duration-300"
                    aria-label="Compartilhar no Twitter"
                  >
                    <Twitter size={18} />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full text-gray-400 hover:text-white hover:bg-blue-700/20 border border-gray-700/50 hover:border-blue-700/50 transition-all duration-300"
                    aria-label="Compartilhar no LinkedIn"
                  >
                    <Linkedin size={18} />
                  </a>
                  <button
                    onClick={copyLink}
                    className="p-3 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 relative"
                    aria-label="Copiar link"
                  >
                    {copied ? (
                      <Check size={18} className="text-green-400" />
                    ) : (
                      <Copy size={18} />
                    )}
                    {copied && (
                      <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                        Link copiado!
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={sharePost}
                    className="p-3 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                    aria-label="Compartilhar"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    className="p-3 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                    aria-label="Salvar"
                  >
                    <Bookmark size={18} />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Article Content */}
            <div className="p-4 md:p-8">
              {isWebStory && embedUrl && (
                <div className="mb-2 flex justify-center">
                  <iframe
                    src={embedUrl}
                    title={post.title}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    loading="eager"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full max-w-[560px] aspect-[9/16] rounded-2xl border border-white/10 bg-black"
                  />
                </div>
              )}
              <div
                className={`prose prose-lg max-w-none prose-invert 
                prose-headings:text-white prose-headings:font-bold 
                prose-h1:text-4xl prose-h1:mb-6 prose-h1:bg-gradient-to-r prose-h1:from-cyan-400 prose-h1:to-purple-400 prose-h1:bg-clip-text prose-h1:text-transparent
                prose-h2:text-3xl prose-h2:mb-4 prose-h2:text-cyan-400
                prose-h3:text-2xl prose-h3:mb-3 prose-h3:text-purple-400
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                prose-img:rounded-2xl prose-img:shadow-2xl prose-img:border prose-img:border-gray-700/50
                prose-pre:bg-gray-900/80 prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-700/50 prose-pre:rounded-xl
                prose-code:text-cyan-400 prose-code:bg-gray-900/50 prose-code:px-2 prose-code:py-1 prose-code:rounded
                prose-strong:text-white prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-gray-900/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:rounded-r-xl
                prose-ul:text-gray-300 prose-ol:text-gray-300 prose-li:mb-2
                ${isWebStory ? "hidden" : ""}`}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const anchor = target.closest && target.closest("a");
                  if (
                    anchor &&
                    typeof (anchor as HTMLAnchorElement).href === "string"
                  ) {
                    const href = (anchor as HTMLAnchorElement).href;
                    if (/web-stor/i.test(href)) {
                      e.preventDefault();
                    }
                  }
                }}
                dangerouslySetInnerHTML={{ __html: processedHtml }}
              />
              {isWebStory && (
                <style jsx>{`
                  .webstory-wrapper :global(amp-story),
                  .webstory-wrapper :global(.web-stories-embed),
                  .webstory-wrapper :global(iframe) {
                    width: 100%;
                    max-width: 420px;
                    aspect-ratio: 9 / 16;
                    display: block;
                    margin: 0 auto;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: #000;
                  }
                  @media (min-width: 768px) {
                    .webstory-wrapper :global(amp-story),
                    .webstory-wrapper :global(.web-stories-embed),
                    .webstory-wrapper :global(iframe) {
                      max-width: 560px;
                    }
                  }
                `}</style>
              )}
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
