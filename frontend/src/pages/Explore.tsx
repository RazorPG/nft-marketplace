import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import FilterChips from "../components/FilterChips"
import NftCard from "../components/NftCard"
import { mockNfts, type NftStatus } from "../data/mockNfts"

const PAGE_SIZE = 8

const statusBadge: Record<NftStatus, string> = {
  listed: "Listed",
  sold: "Sold",
  owned: "Owned",
}

function scrollToGrid() {
  document
    .getElementById("explore-grid")
    ?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function Explore() {
  const [filter, setFilter] = useState("all")
  const [sort, setSort] = useState("latest")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const items = useMemo(() => {
    let result = [...mockNfts]

    if (filter === "listed") {
      result = result.filter((item) => item.listed)
    }

    result.sort((a, b) =>
      sort === "latest" ? b.id - a.id : a.id - b.id,
    )

    return result
  }, [filter, sort])

  const visibleItems = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return (
    <div className="mx-auto max-w-[1152px] px-4 sm:px-6 lg:px-8">
      <section className="flex flex-col items-start gap-5 py-16 sm:py-20">
        <h1 className="font-sora text-[40px] font-bold leading-[1.15] tracking-[-0.02em] text-on-surface sm:text-[48px]">
          Discover &amp; trade digital collectibles
        </h1>
        <p className="max-w-xl text-lg text-on-surface-muted">
          Jelajahi, beli, dan koleksi NFT dari para kreator di seluruh dunia.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link to="/create" className="btn-primary">
            Mint now
          </Link>
          <button type="button" className="btn-secondary" onClick={scrollToGrid}>
            Browse
          </button>
        </div>
      </section>

      <section id="explore-grid" className="scroll-mt-24 pb-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
            All items · {items.length}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <FilterChips
              options={[
                { value: "all", label: "All" },
                { value: "listed", label: "Listed" },
              ]}
              value={filter}
              onChange={setFilter}
            />
            <div className="flex items-center gap-2">
              {["latest", "oldest"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSort(value)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    sort === value
                      ? "bg-primary-soft text-primary-rest"
                      : "border border-border bg-surface text-secondary hover:text-on-surface"
                  }`}
                >
                  {value === "latest" ? "Latest" : "Oldest"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 sm:gap-6">
          {visibleItems.map((item) => (
            <NftCard
              key={item.id}
              imageUrl={item.imageUrl}
              title={item.name}
              creator={item.creator}
              price={item.listed ? item.price : null}
              badge={statusBadge[item.status]}
            />
          ))}
        </div>

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              Load more
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default Explore
