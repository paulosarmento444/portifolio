export default function StoreLoading() {
  return (
    <main className="site-page-shell site-stack-page">
      <section className="site-section site-section-utility">
        <div className="site-container site-container-commerce">
          <div className="site-stack-page">
            <div className="site-stack-section">
              <div className="h-4 w-28 animate-pulse rounded-full bg-[color:var(--site-color-surface-inset)]" />
              <div className="h-12 max-w-3xl animate-pulse rounded-[var(--site-radius-md)] bg-[color:var(--site-color-surface-inset)]" />
              <div className="h-5 max-w-2xl animate-pulse rounded-[var(--site-radius-md)] bg-[color:var(--site-color-surface-inset)]" />
            </div>

            <div className="site-surface-strong site-stack-section p-[var(--site-card-padding)] md:p-[var(--site-card-padding-desktop)]">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div className="h-12 w-full animate-pulse rounded-[var(--site-radius-md)] bg-[color:var(--site-color-surface-inset)]" />
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-11 w-24 animate-pulse rounded-full bg-[color:var(--site-color-surface-inset)]"
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-[color:var(--site-color-surface-inset)]"
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="site-surface site-stack-section overflow-hidden p-0"
                >
                  <div className="aspect-[4/5] animate-pulse bg-[color:var(--site-color-surface-inset)]" />
                  <div className="site-stack-panel p-5 md:p-6">
                    <div className="h-4 w-20 animate-pulse rounded bg-[color:var(--site-color-surface-inset)]" />
                    <div className="h-6 w-4/5 animate-pulse rounded bg-[color:var(--site-color-surface-inset)]" />
                    <div className="h-4 w-full animate-pulse rounded bg-[color:var(--site-color-surface-inset)]" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-[color:var(--site-color-surface-inset)]" />
                    <div className="h-10 w-28 animate-pulse rounded bg-[color:var(--site-color-surface-inset)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
