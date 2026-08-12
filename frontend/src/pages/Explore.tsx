import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { formatEther } from "ethers"
import FilterChips from "../components/FilterChips"
import NftCard from "../components/NftCard"
import { API_URL } from "../config"
import { resolveIpfsUri } from "../utils/ipfs"
import type { NftItem } from "../types/nft"

const PAGE_SIZE = 8



function Explore() {
  const [filter, setFilter] = useState("all")
  const [sort, setSort] = useState("latest")
  const [items, setItems] = useState<NftItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  
  const [searchInput, setSearchInput] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")

  const fetchNfts = useCallback(async (pageNum: number, currentFilter: string, currentSort: string, currentSearch: string, append: boolean) => {
    setIsLoading(true)
    try {
      const url = new URL(`${API_URL}/api/nfts`)
      url.searchParams.append("page", pageNum.toString())
      url.searchParams.append("limit", PAGE_SIZE.toString())
      url.searchParams.append("sort", currentSort)
      if (currentFilter === "listed") {
        url.searchParams.append("listed", "true")
      }
      if (currentSearch.trim()) {
        url.searchParams.append("search", currentSearch.trim())
      }

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      
      const newItems = data.data || []
      setItems(prev => append ? [...prev, ...newItems] : newItems)
      setTotalCount(data.total || 0)
      setHasMore(newItems.length === PAGE_SIZE)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Reset and fetch when filter, sort, or search changes
  useEffect(() => {
    setPage(1)
    fetchNfts(1, filter, sort, appliedSearch, false)
  }, [filter, sort, appliedSearch, fetchNfts])

  // Fetch when page changes (Load More)
  useEffect(() => {
    if (page > 1) {
      fetchNfts(page, filter, sort, appliedSearch, true)
    }
  }, [page, filter, sort, appliedSearch, fetchNfts])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAppliedSearch(searchInput)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <section className="flex flex-col items-start gap-5 py-16 sm:py-20">
        <h1 className="font-sora text-[40px] font-bold leading-[1.15] tracking-[-0.02em] text-on-surface sm:text-[48px]">
          Discover &amp; trade digital collectibles
        </h1>
        <p className="max-w-xl text-lg text-on-surface-muted">
          Jelajahi, beli, dan koleksi NFT dari para kreator di seluruh dunia.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 w-full max-w-2xl">
          <Link to="/create" className="btn-primary whitespace-nowrap">
            Mint now
          </Link>
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search NFTs by name or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none"
            />
            <button type="submit" className="btn-secondary whitespace-nowrap">
              Search
            </button>
          </form>
        </div>
      </section>

      <section id="explore-grid" className="scroll-mt-24 pb-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
            All items · {totalCount}
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
          {items.map((item) => (
            <NftCard
              key={item.tokenId}
              tokenId={item.tokenId}
              imageUrl={resolveIpfsUri(item.imageUrl)}
              title={item.name || `NFT #${item.tokenId}`}
              creator={item.creator}
              price={item.price ? formatEther(item.price) : null}
              badge={item.listed ? "Listed" : "Owned"}
            />
          ))}
        </div>

        {items.length === 0 && !isLoading && (
          <div className="py-20 text-center text-on-surface-muted">
            Tidak ada NFT yang ditemukan.
          </div>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setPage(p => p + 1)}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default Explore
