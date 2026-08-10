import { useEffect, useRef, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { useWallet } from "../hooks/useWallet"
import { shortenAddress } from "../utils/wallet"

const navLinks = [
  { to: "/", label: "Explore" },
  { to: "/my-nfts", label: "My NFTs" },
  { to: "/create", label: "Create" },
]

function WalletButton() {
  const { address, isConnecting, error, connect, disconnect, clearError } =
    useWallet()
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  const handleCopy = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard tidak tersedia */
    }
  }

  const handleDisconnect = () => {
    setMenuOpen(false)
    disconnect()
  }

  return (
    <div className="relative" ref={menuRef}>
      {address ? (
        <>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-4 transition-colors hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
            <span className="font-mono text-sm text-on-surface">
              {shortenAddress(address)}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-secondary transition-transform duration-150 ${
                menuOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-border bg-surface p-2 shadow-modal"
              role="menu"
            >
              <div className="border-b border-border px-3 pb-3 pt-1">
                <p className="text-xs text-secondary">Connected wallet</p>
                <p className="mt-1 break-all font-mono text-sm text-on-surface">
                  {address}
                </p>
              </div>
              <div className="mt-1 flex flex-col">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleCopy}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-on-surface transition-colors hover:bg-background"
                >
                  {copied ? (
                    <span className="text-success">Copied!</span>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <rect x="9" y="9" width="12" height="12" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy address
                    </>
                  )}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDisconnect}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-error transition-colors hover:bg-error/5"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="m16 17 5-5-5-5M21 12H9" />
                  </svg>
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => void connect()}
          disabled={isConnecting}
          className="btn-primary"
        >
          {isConnecting ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
              Connecting…
            </>
          ) : (
            "Connect Wallet"
          )}
        </button>
      )}

      {error && (
        <div
          className="absolute right-0 top-full z-50 mt-2 flex max-w-xs items-start gap-2 rounded-lg border border-error/30 bg-surface px-3 py-2 text-sm text-error shadow-modal"
          role="alert"
        >
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="cursor-pointer text-error/70 hover:text-error"
            aria-label="Tutup pesan error"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1152px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2 22 20H2L12 2Z" />
            </svg>
          </span>
          <span className="font-sora text-lg font-semibold text-on-surface">
            NFT Marketplace
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                  isActive
                    ? "border-b-2 border-primary pb-1 text-on-surface"
                    : "border-b-2 border-transparent pb-1 text-secondary hover:text-on-surface"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <WalletButton />
      </div>
    </header>
  )
}

export default Navbar
