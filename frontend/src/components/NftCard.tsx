import { useState } from "react"

interface NftCardProps {
  imageUrl?: string | null
  title: string
  creator?: string
  price?: string | null
  badge?: string
}

function NftCard({ imageUrl, title, creator, price, badge }: NftCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-surface p-2 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
        {imageUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-background" />
            )}
            <img
              src={imageUrl}
              alt={title}
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 animate-pulse">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-secondary/60"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-4.5-4.5L7 20" />
            </svg>
            <span className="text-xs text-secondary">No image yet</span>
          </div>
        )}

        {badge && (
          <span className="badge absolute right-3 top-3">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {badge}
          </span>
        )}
      </div>

      <div className="px-3 pb-3 pt-4">
        <p className="font-sora text-lg font-semibold text-on-surface">{title}</p>
        <p className="mt-0.5 text-sm text-on-surface-muted">
          by <span className="font-medium text-on-surface">{creator || "Unknown"}</span>
        </p>
        <div className="mt-3 flex items-center justify-between">
          {price ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
                Price
              </p>
              <p className="font-mono text-sm text-on-surface">{price} ETH</p>
            </div>
          ) : (
            <span className="text-xs text-secondary">Not listed</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default NftCard
