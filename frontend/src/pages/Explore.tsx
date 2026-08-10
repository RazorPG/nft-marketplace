import { Link } from "react-router-dom"

function Explore() {
  return (
    <div className="mx-auto flex max-w-[1152px] flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="font-sora text-[48px] font-bold leading-[1.15] tracking-[-0.02em] text-on-surface">
        Discover &amp; trade digital collectibles
      </h1>
      <p className="max-w-xl text-lg text-on-surface-muted">
        Halaman Explore akan diimplementasikan pada tahap pengembangan berikutnya.
      </p>
      <Link to="/create" className="btn-primary mt-2">
        Mint now
      </Link>
    </div>
  )
}

export default Explore
