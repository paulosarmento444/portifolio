"use client";

import { BlogFilters } from "../components/list/blog-filters.component";
import { BlogGrid } from "../components/list/blog-grid.component";
import { BlogHero } from "../components/list/blog-hero.component";
import { BlogPagination } from "../components/list/blog-pagination.component";
import { cleanBlogExcerpt } from "../data/blog.utils";
import { useBlogListing } from "../data/hooks/use-blog-listing.hook";

export function BlogListingPage() {
  const {
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
  } = useBlogListing();

  return (
    <main className="site-page-shell site-page-shell-compact">
      <BlogHero postCount={currentPosts.length} categoryCount={categories.length} />
      <BlogFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        resultsCount={filteredPosts.length}
      />
      <BlogGrid
        posts={filteredPosts}
        loading={loading}
        error={error}
        getExcerpt={cleanBlogExcerpt}
        onRetry={handleRetry}
        onClearFilters={clearFilters}
      />
      {!loading && !error && totalPages > 1 ? (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            void handlePageChange(page);
          }}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      ) : null}
    </main>
  );
}
