export interface NFT {
  id: number
  tokenId: number
  contractAddress: string
  owner: string
  creator: string
  listed: boolean
  price: string | null
  name: string | null
  description: string | null
  imageUrl: string | null
  tokenURI: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface ListResponse {
  page: number
  limit: number
  total: number
}