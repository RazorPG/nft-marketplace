export interface NftItem {
  id: number;
  tokenId: number;
  contractAddress: string;
  owner: string;
  creator: string;
  listed: boolean;
  price: string | null;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  tokenURI: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NftApiResponse {
  data: NftItem[];
  page?: number;
  limit?: number;
  total?: number;
}
