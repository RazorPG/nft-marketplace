import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import FilterChips from "../components/FilterChips"
import NftCard from "../components/NftCard"
import { mockNfts, type NftStatus } from "../data/mockNfts"
import { useWallet } from "../hooks/useWallet"
import { shortenAddress } from "../utils/wallet"

const statusBadge: Record<NftStatus, string> = {
  listed: "Listed",
  sold: "Sold",
  owned: "Owned",
}

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

  const myNfts = useMemo(() => mockNfts.filter((item) => item.mine), [])

  const visibleItems = useMemo(() => {
    if (filter === "listed") return myNfts.filter((item) => item.listed)
    if (filter === "created") return myNfts.filter((item) => item.createdByMe)
    return myNfts
  }, [myNfts, filter])

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
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-[32px] font-semibold leading-[1.2] tracking-[-0.01em] text-on-surface">
            My NFTs
          </h1>
          <p className="mt-1 text-sm text-on-surface-muted">
            Koleksi NFT yang Anda miliki.
          </p>
        </div>
        <span className="badge">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-mono">{shortenAddress(address)}</span>
        </span>
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

      {visibleItems.length > 0 ? (
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
      ) : myNfts.length === 0 ? (
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
