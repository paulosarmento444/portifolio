"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchWordpressBlogPosts,
  type WordpressBlogListingResult,
} from "@site/integrations/wordpress";
import {
  BLOG_POSTS_PER_PAGE,
  cleanBlogExcerpt,
  getBlogCategories,
} from "../blog.utils";

type CachedBlogPage = WordpressBlogListingResult;

export function useBlogListing() {
  const [pages, setPages] = useState<Record<number, CachedBlogPage>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const loadPage = useCallback(async (page: number, after?: string | null) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchWordpressBlogPosts({
        first: BLOG_POSTS_PER_PAGE,
        after: after ?? null,
      });

      setPages((previous) => ({
        ...previous,
        [page]: result,
      }));
      setCurrentPage(page);
    } catch (fetchError) {
      console.error("Error fetching posts:", fetchError);
      setError("Falha ao carregar os posts. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1, null);
  }, [loadPage]);

  const currentListing = pages[currentPage];
  const currentPosts = useMemo(() => currentListing?.items ?? [], [currentListing]);

  const filteredPosts = useMemo(
    () =>
      currentPosts.filter((post) => {
        const matchesSearch =
          searchTerm === "" ||
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cleanBlogExcerpt(post.excerpt)
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === null ||
          post.categories.some((category) => category.name === selectedCategory);

        return matchesSearch && matchesCategory;
      }),
    [currentPosts, searchTerm, selectedCategory],
  );

  const categories = useMemo(() => getBlogCategories(currentPosts), [currentPosts]);
  const hasNextPage = currentListing?.pageInfo.hasNextPage ?? false;
  const hasPreviousPage = currentPage > 1;
  const totalPages = useMemo(() => {
    const loadedPages = Object.keys(pages)
      .map((page) => Number(page))
      .filter((page) => Number.isFinite(page));

    if (loadedPages.length === 0) {
      return 1;
    }

    const highestLoadedPage = Math.max(...loadedPages);
    const highestListing = pages[highestLoadedPage];

    return highestListing?.pageInfo.hasNextPage
      ? highestLoadedPage + 1
      : highestLoadedPage;
  }, [pages]);

  const handlePageChange = useCallback(
    async (page: number) => {
      if (page < 1 || page === currentPage) {
        return;
      }

      if (pages[page]) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const previousListing = pages[page - 1];
      if (page > currentPage && previousListing?.pageInfo.endCursor) {
        await loadPage(page, previousListing.pageInfo.endCursor);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentPage, loadPage, pages],
  );

  const handleRetry = useCallback(() => {
    const afterCursor =
      currentPage > 1 ? pages[currentPage - 1]?.pageInfo.endCursor ?? null : null;

    void loadPage(currentPage, afterCursor);
  }, [currentPage, loadPage, pages]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory(null);
  }, []);

  return {
    categories,
    currentPage,
    currentPosts,
    error,
    filteredPosts,
    hasNextPage,
    hasPreviousPage,
    loading,
    searchTerm,
    selectedCategory,
    totalPages,
    setSearchTerm,
    setSelectedCategory,
    handlePageChange,
    handleRetry,
    clearFilters,
  };
}
