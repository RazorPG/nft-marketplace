import { Link } from "react-router-dom"

function MyNfts() {
  return (
    <div className="mx-auto flex max-w-[1152px] flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="font-sora text-[32px] font-semibold leading-[1.2] tracking-[-0.01em] text-on-surface">
        My NFTs
      </h1>
      <p className="max-w-xl text-lg text-on-surface-muted">
        Koleksi NFT Anda akan tampil di sini pada tahap pengembangan berikutnya.
      </p>
      <Link to="/create" className="btn-primary mt-2">
        Mint your first NFT
      </Link>
    </div>
  )
}

export default MyNfts
