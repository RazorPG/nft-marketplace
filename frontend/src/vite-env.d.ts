/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NFT_CONTRACT_ADDRESS?: string
  readonly VITE_MARKETPLACE_CONTRACT_ADDRESS?: string
  readonly VITE_API_URL?: string
  readonly VITE_CHAIN_ID?: string
  readonly VITE_RPC_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}