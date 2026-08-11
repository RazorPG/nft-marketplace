import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { formatEther } from "ethers"
import FilterChips from "../components/FilterChips"
import NftCard from "../components/NftCard"
import { useWallet } from "../hooks/useWallet"
import { shortenAddress } from "../utils/wallet"
import { API_URL } from "../config"
import { resolveIpfsUri } from "../utils/ipfs"
import type { NftItem } from "../types/nft"

function EmptyIllustration() {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary">
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-4.5-4.5L7 20" />
      </svg>
    </div>
  )
}

function MyNfts() {
  const { address, isConnecting, error, connect } = useWallet()
  const [filter, setFilter] = useState("all")
  const [items, setItems] = useState<NftItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchMyNfts = useCallback(
    async (currentFilter: string, userAddress: string) => {
      setIsLoading(true)
      try {
        let url = `${API_URL}/api/nfts`

        if (currentFilter === "created") {
          url = `${API_URL}/api/nfts?creator=${userAddress}`
        } else {
          url = `${API_URL}/api/nfts/owner/${userAddress}`
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error("Failed to fetch")

        const data = await res.json()
        let newItems: NftItem[] = data.data || []

        if (currentFilter === "listed") {
          newItems = newItems.filter(item => item.listed)
        }

        setItems(newItems)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (address) {
      fetchMyNfts(filter, address)
    } else {
      setItems([])
    }
  }, [address, filter, fetchMyNfts])

  if (!address) {
    return (
      <div className="mx-auto flex max-w-[1152px] flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 lg:px-8">
        <EmptyIllustration />
        <h1 className="font-sora text-[32px] font-semibold leading-[1.2] tracking-[-0.01em] text-on-surface">
          Connect to see your NFTs
        </h1>
        <p className="max-w-xl text-lg text-on-surface-muted">
          Hubungkan wallet Anda untuk melihat koleksi NFT yang Anda miliki.
        </p>
        <button
          type="button"
          className="btn-primary mt-2"
          onClick={() => void connect()}
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting…" : "Connect Wallet"}
        </button>
        {error && <p className="max-w-sm text-sm text-error">{error}</p>}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1152px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col items-start gap-4">
        <div>
          <h1 className="font-sora text-[32px] font-semibold leading-[1.2] tracking-[-0.01em] text-on-surface">
            My NFTs
          </h1>
          <p className="mt-1 text-sm text-on-surface-muted">
            Koleksi NFT yang Anda miliki.
          </p>
        </div>
      </header>

      <div className="mb-6">
        <FilterChips
          options={[
            { value: "all", label: "All" },
            { value: "listed", label: "Listed" },
            { value: "created", label: "Created" },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-on-surface-muted">
          Loading NFTs...
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 sm:gap-6">
          {items.map(item => (
            <NftCard
              key={item.tokenId}
              imageUrl={resolveIpfsUri(item.imageUrl)}
              title={item.name || `NFT #${item.tokenId}`}
              creator={item.creator}
              price={item.price ? formatEther(item.price) : null}
              badge={item.listed ? "Listed" : "Owned"}
            />
          ))}
        </div>
      ) : filter === "all" ? (
        <div className="flex flex-col items-center gap-6 py-20 text-center">
          <EmptyIllustration />
          <h2 className="font-sora text-2xl font-semibold text-on-surface">
            Belum ada NFT
          </h2>
          <p className="max-w-md text-base text-on-surface-muted">
            Mulai perjalanan koleksi Anda dengan membuat NFT pertama.
          </p>
          <Link to="/create" className="btn-primary">
            Mint your first NFT
          </Link>
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-base text-on-surface-muted">
            Tidak ada NFT yang cocok dengan filter ini.
          </p>
        </div>
      )}
    </div>
  )
}

export default MyNfts
