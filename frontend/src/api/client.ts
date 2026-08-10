import axios from "axios"
import { API_URL } from "../config"
import type { NFT, ListResponse } from "../types"

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

export interface ListNFTsParams {
  listed?: boolean
  page?: number
  limit?: number
  creator?: string
  contract?: string
  sort?: "newest" | "oldest"
}

export async function fetchNFTs(
  params: ListNFTsParams = {},
): Promise<{ data: NFT[] } & ListResponse> {
  const { data } = await api.get("/api/nfts", { params })
  return data
}

export async function fetchNFT(tokenId: number): Promise<NFT> {
  const { data } = await api.get<NFT>(`/api/nfts/${tokenId}`)
  return data
}

export async function fetchNFTsByOwner(address: string): Promise<NFT[]> {
  const { data } = await api.get<{ data: NFT[] }>(`/api/nfts/owner/${address}`)
  return data.data
}

export default api