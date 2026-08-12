import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Contract, parseEther, formatEther, BrowserProvider } from "ethers"
import { useWallet } from "../hooks/useWallet"
import {
  API_URL,
  NFT_ADDRESS,
  MARKETPLACE_ADDRESS,
  NFT_ABI,
  MARKETPLACE_ABI,
} from "../config"
import { resolveIpfsUri } from "../utils/ipfs"
import { shortenAddress } from "../utils/wallet"
import type { NftItem } from "../types/nft"

function NftDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { address } = useWallet()

  const [nft, setNft] = useState<NftItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [listPrice, setListPrice] = useState("")

  const fetchNft = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/nfts/${id}`)
      if (!res.ok) throw new Error("NFT not found")
      const data = await res.json()
      setNft(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchNft()
  }, [fetchNft])

  const handleList = async () => {
    if (!nft || !listPrice || !window.ethereum) return
    setIsProcessing(true)
    try {
      const provider = new BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const nftContract = new Contract(NFT_ADDRESS, NFT_ABI, signer)
      const marketplace = new Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      )

      const approved = await nftContract.getApproved(nft.tokenId)
      if (approved.toLowerCase() !== MARKETPLACE_ADDRESS.toLowerCase()) {
        const approveTx = await nftContract.approve(
          MARKETPLACE_ADDRESS,
          nft.tokenId
        )
        await approveTx.wait()
      }

      const priceWei = parseEther(listPrice)
      const tx = await marketplace.listItem(NFT_ADDRESS, nft.tokenId, priceWei)
      await tx.wait()

      alert("NFT successfully listed!")
      setTimeout(fetchNft, 3000) // Wait for indexer
    } catch (err: any) {
      console.error(err)
      alert("Failed to list: " + (err.reason || err.message))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!nft || !window.ethereum) return
    setIsProcessing(true)
    try {
      const provider = new BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const marketplace = new Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      )

      const tx = await marketplace.cancelListing(NFT_ADDRESS, nft.tokenId)
      await tx.wait()

      alert("Listing cancelled!")
      setTimeout(fetchNft, 3000)
    } catch (err: any) {
      console.error(err)
      alert("Failed to cancel: " + (err.reason || err.message))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBuy = async () => {
    if (!nft || !nft.price || !window.ethereum) return
    setIsProcessing(true)
    try {
      const provider = new BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const marketplace = new Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      )

      const tx = await marketplace.buyItem(NFT_ADDRESS, nft.tokenId, {
        value: nft.price,
      })
      await tx.wait()

      alert("NFT bought successfully!")
      setTimeout(fetchNft, 3000)
    } catch (err: any) {
      console.error(err)
      alert("Failed to buy: " + (err.reason || err.message))
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading)
    return (
      <div className="py-20 text-center text-on-surface-muted">Loading...</div>
    )
  if (!nft)
    return <div className="py-20 text-center text-error">NFT not found</div>

  const isOwner = address?.toLowerCase() === nft.owner.toLowerCase()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm font-medium text-secondary hover:text-primary transition-colors border rounded-lg px-4 py-2"
      >
        Back
      </button>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-sm">
          {nft.imageUrl ? (
            <img
              src={resolveIpfsUri(nft.imageUrl)}
              alt={nft.name || ""}
              className="w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-background text-secondary">
              No Image
            </div>
          )}
        </div>

        <div className="flex flex-col items-start">
          <h1 className="font-sora text-3xl font-bold text-on-surface mb-2">
            {nft.name || `NFT #${nft.tokenId}`}
          </h1>
          <p className="text-sm text-secondary mb-6">
            Owned by{" "}
            <span className="font-mono text-primary font-medium">
              {shortenAddress(nft.owner)}
            </span>
          </p>

          <div className="mb-6 w-full rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">
              Description
            </h2>
            <p className="text-sm text-on-surface-muted leading-relaxed">
              {nft.description || "No description provided."}
            </p>
          </div>

          <div className="mb-6 w-full rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">
              Current Status
            </h2>

            {nft.listed ? (
              <div className="mb-6">
                <p className="text-3xl font-mono font-bold text-on-surface">
                  {formatEther(nft.price!)} ETH
                </p>
                <p className="text-xs font-medium text-secondary mt-1">
                  Listed for sale
                </p>
              </div>
            ) : (
              <p className="mb-6 text-sm font-medium text-secondary">
                Not listed for sale
              </p>
            )}

            {!address ? (
              <p className="text-sm font-medium text-error bg-error/10 p-3 rounded-lg">
                Please connect your wallet to interact.
              </p>
            ) : isOwner ? (
              nft.listed ? (
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="btn-secondary w-full py-3"
                >
                  {isProcessing ? "Processing..." : "Cancel Listing"}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Set Price in ETH"
                    value={listPrice}
                    onChange={e => setListPrice(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    onClick={handleList}
                    disabled={
                      isProcessing || !listPrice || Number(listPrice) <= 0
                    }
                    className="btn-primary w-full py-3"
                  >
                    {isProcessing ? "Processing..." : "List for Sale"}
                  </button>
                </div>
              )
            ) : nft.listed ? (
              <button
                onClick={handleBuy}
                disabled={isProcessing}
                className="btn-primary w-full py-3"
              >
                {isProcessing ? "Processing..." : "Buy Now"}
              </button>
            ) : (
              <p className="text-sm text-secondary italic text-center w-full bg-background p-3 rounded-lg border border-border">
                This NFT is not for sale.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NftDetails
