export type NftStatus = "listed" | "sold" | "owned"

export interface MockNft {
  id: number
  tokenId: number
  name: string
  creator: string
  price: string | null
  listed: boolean
  status: NftStatus
  mine: boolean
  createdByMe: boolean
  imageUrl: string
}

const raw: Array<
  Omit<MockNft, "imageUrl" | "mine" | "createdByMe"> & {
    mine?: boolean
    createdByMe?: boolean
  }
> = [
  { id: 1, tokenId: 1, name: "Emerald Genesis", creator: "0x8F3a…c91B", price: "0.05", listed: true, status: "listed", mine: true, createdByMe: true },
  { id: 2, tokenId: 2, name: "Neon Dreams", creator: "Mira K.", price: "0.12", listed: true, status: "listed" },
  { id: 3, tokenId: 3, name: "Chromatic Horizon", creator: "nft.artist", price: null, listed: false, status: "owned" },
  { id: 4, tokenId: 4, name: "Aurora Vault", creator: "0x1C7d…9aE4", price: "0.03", listed: true, status: "listed" },
  { id: 5, tokenId: 5, name: "Midnight Bloom", creator: "Sora Labs", price: "0.25", listed: true, status: "listed" },
  { id: 6, tokenId: 6, name: "Solar Flare #042", creator: "0x6A2b…f0D8", price: null, listed: false, status: "sold" },
  { id: 7, tokenId: 7, name: "Liquid Starlight", creator: "Pixel Hana", price: "0.08", listed: true, status: "listed" },
  { id: 8, tokenId: 8, name: "Digital Mirage", creator: "0x4E91…c3b6", price: "0.18", listed: true, status: "listed" },
  { id: 9, tokenId: 9, name: "Whispering Forest", creator: "Artez", price: "0.04", listed: true, status: "listed", mine: true, createdByMe: false },
  { id: 10, tokenId: 10, name: "Crypto Cartography", creator: "0x9F2b…a1C3", price: null, listed: false, status: "sold" },
  { id: 11, tokenId: 11, name: "Fragment of Light", creator: "Nova Mint", price: "0.09", listed: true, status: "listed" },
  { id: 12, tokenId: 12, name: "Oceanic Reverie", creator: "0x2D7e…51a9", price: "0.15", listed: true, status: "listed" },
  { id: 13, tokenId: 13, name: "Golden Hour", creator: "Lumen", price: null, listed: false, status: "owned", mine: true, createdByMe: true },
  { id: 14, tokenId: 14, name: "Terra Nova", creator: "0x5A3c…b72E", price: "0.06", listed: true, status: "listed" },
  { id: 15, tokenId: 15, name: "Nebula Drift", creator: "Echo Forge", price: null, listed: false, status: "sold", mine: true, createdByMe: true },
  { id: 16, tokenId: 16, name: "Phantom Peak", creator: "0x7B1a…d94C", price: "0.1", listed: true, status: "listed" },
]

export const mockNfts: MockNft[] = raw.map((item) => ({
  ...item,
  mine: item.mine ?? false,
  createdByMe: item.createdByMe ?? false,
  imageUrl: `https://picsum.photos/seed/nft-${item.tokenId}/600/600`,
}))
