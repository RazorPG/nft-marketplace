import { useMemo, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import NftCard from "../components/NftCard"
import Modal from "../components/Modal"

function Create() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [listForSale, setListForSale] = useState(false)
  const [price, setPrice] = useState("")
  const [successOpen, setSuccessOpen] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setImageError("File harus berupa gambar (PNG, JPG, GIF, atau SVG).")
      return
    }
    setImageError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImage(null)
    setPreviewUrl(null)
    setImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSuccessOpen(true)
  }

  const priceValid = price.trim() !== "" && Number(price) > 0
  const canSubmit = name.trim() !== "" && (!listForSale || priceValid)

  const previewPrice = useMemo(() => {
    if (!listForSale || !priceValid) return null
    return price.trim()
  }, [listForSale, priceValid, price])

  return (
    <div className="mx-auto max-w-[1152px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="font-sora text-[32px] font-semibold leading-[1.2] tracking-[-0.01em] text-on-surface">
          Create your NFT
        </h1>
        <p className="mt-2 max-w-xl text-lg text-on-surface-muted">
          Upload media, beri nama, lalu siapkan karya digital Anda untuk dijual.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
          <section className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface">Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {previewUrl ? (
              <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-medium text-on-surface">
                    {image?.name}
                  </p>
                  <p className="text-xs text-secondary">
                    {(image && (image.size / 1024).toFixed(1)) || "0"} KB
                  </p>
                  <button
                    type="button"
                    className="mt-1 w-fit cursor-pointer text-sm font-medium text-error hover:underline"
                    onClick={removeImage}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`dropzone ${dragOver ? "border-primary bg-primary-soft/40" : ""}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M12 16V4m0 0 4 4m-4-4L8 8" />
                    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">
                    Drag &amp; drop your image here
                  </p>
                  <p className="mt-1 text-xs text-secondary">
                    atau klik untuk memilih file · PNG, JPG, GIF, SVG
                  </p>
                </div>
              </div>
            )}
            {imageError && <p className="text-sm text-error">{imageError}</p>}
          </section>

          <section className="flex flex-col gap-2">
            <label htmlFor="nft-name" className="text-sm font-medium text-on-surface">
              Name
            </label>
            <input
              id="nft-name"
              className="input"
              placeholder="e.g. Emerald Genesis"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
            />
          </section>

          <section className="flex flex-col gap-2">
            <label
              htmlFor="nft-description"
              className="text-sm font-medium text-on-surface"
            >
              Description
            </label>
            <textarea
              id="nft-description"
              className="input min-h-32 resize-y"
              placeholder="Ceritakan kisah di balik karya Anda..."
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
            />
          </section>

          <section className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-on-surface">List for sale</p>
                <p className="mt-0.5 text-xs text-secondary">
                  Tawarkan NFT Anda di marketplace saat mint.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={listForSale}
                onClick={() => setListForSale((v) => !v)}
                className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                  listForSale ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-surface shadow transition-all duration-200 ${
                    listForSale ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {listForSale && (
              <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5">
                <label htmlFor="nft-price" className="text-sm font-medium text-on-surface">
                  Price (ETH)
                </label>
                <div className="relative">
                  <input
                    id="nft-price"
                    className="input pr-14 font-mono"
                    inputMode="decimal"
                    placeholder="0.05"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-secondary">
                    ETH
                  </span>
                </div>
                <p className="text-xs text-secondary">
                  Marketplace fee 1% akan berlaku saat NFT terjual.
                </p>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {listForSale ? "Mint & List" : "Mint NFT"}
            </button>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
              Fee 1% marketplace + biaya gas ditanggung pembuat
            </p>
          </section>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
            Live preview
          </p>
          <NftCard
            imageUrl={previewUrl}
            title={name.trim() || "Untitled NFT"}
            creator="you"
            price={previewPrice}
            badge={listForSale ? "Listed" : "New"}
          />
        </aside>
      </div>

      <Modal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="NFT minted successfully!"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSuccessOpen(false)}
            >
              Mint another
            </button>
            <Link to="/my-nfts" className="btn-primary">
              View your NFT
            </Link>
          </>
        }
      >
        <p>
          &ldquo;{name.trim() || "Untitled NFT"}&rdquo; telah berhasil dibuat
          {listForSale && priceValid ? ` dan dihargai ${price.trim()} ETH` : ""}.
          Lihat NFT Anda di halaman My NFTs.
        </p>
      </Modal>
    </div>
  )
}

export default Create
