import NFTArtifact from "../abi/NFT.json"
import MarketplaceArtifact from "../abi/Marketplace.json"

export const NFT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS ?? ""
export const MARKETPLACE_ADDRESS =
  import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS ?? ""
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000"
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 31337)
export const RPC_URL = import.meta.env.VITE_RPC_URL ?? "http://127.0.0.1:8545"

export const NFT_ABI = NFTArtifact.abi
export const MARKETPLACE_ABI = MarketplaceArtifact.abi