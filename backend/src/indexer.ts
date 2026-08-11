import "dotenv/config";
import { JsonRpcProvider, Contract, type Log, type Result } from "ethers";
import axios from "axios";
import prisma from "./prisma.js";
import NFTArtifact from "./abi/NFT.json" with { type: "json" };
import MarketplaceArtifact from "./abi/Marketplace.json" with { type: "json" };

const RPC_URL = process.env.RPC_URL ?? "http://127.0.0.1:8545";
const NFT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS ?? "";
const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_CONTRACT_ADDRESS ?? "";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 5000);

let nftContract: Contract | undefined;
let marketplaceContract: Contract | undefined;
let provider: JsonRpcProvider | undefined;
let lastBlock = Number(process.env.FROM_BLOCK ?? 0);
let running = false;

function initContracts(): boolean {
  if (!NFT_ADDRESS || !MARKETPLACE_ADDRESS) {
    console.warn(
      "Indexer: NFT_CONTRACT_ADDRESS / MARKETPLACE_CONTRACT_ADDRESS belum di-set. Indexer nonaktif."
    );
    return false;
  }

  provider = new JsonRpcProvider(RPC_URL);
  nftContract = new Contract(NFT_ADDRESS, NFTArtifact.abi, provider);
  marketplaceContract = new Contract(MARKETPLACE_ADDRESS, MarketplaceArtifact.abi, provider);
  return true;
}

const toChecksummed = (value: unknown): string => {
  const v = String(value);
  return v.length === 42 ? v.toLowerCase() : v;
};

async function handleNFTMinted(creator: unknown, tokenId: bigint, tokenURI: string): Promise<void> {
  const tokenIdNumber = Number(tokenId);
  const creatorAddress = toChecksummed(creator);
  
  let name = null;
  let description = null;
  let imageUrl = null;
  let metadata = null;

  if (tokenURI) {
    try {
      const url = tokenURI.startsWith("ipfs://") 
        ? tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/") 
        : tokenURI;
      const res = await axios.get(url, { timeout: 10000 });
      metadata = res.data;
      name = metadata?.name ?? null;
      description = metadata?.description ?? null;
      imageUrl = metadata?.image ?? null;
    } catch (e: any) {
      console.error(`Indexer: gagal fetch metadata untuk token #${tokenIdNumber}`, e.message);
    }
  }

  await prisma.nft.upsert({
    where: { tokenId: tokenIdNumber },
    update: { 
      creator: creatorAddress, 
      owner: creatorAddress, 
      tokenURI,
      name,
      description,
      imageUrl,
      metadata: metadata || undefined,
    },
    create: {
      tokenId: tokenIdNumber,
      contractAddress: NFT_ADDRESS.toLowerCase(),
      owner: creatorAddress,
      creator: creatorAddress,
      tokenURI,
      name,
      description,
      imageUrl,
      metadata: metadata || undefined,
    },
  });
  console.log(`Indexer: NFTMinted #${tokenIdNumber}`);
}

async function handleNFTListed(seller: unknown, tokenId: bigint, _nft: unknown, price: bigint): Promise<void> {
  const tokenIdNumber = Number(tokenId);
  const sellerAddress = toChecksummed(seller);
  await prisma.nft.upsert({
    where: { tokenId: tokenIdNumber },
    update: { owner: sellerAddress, listed: true, price: price.toString() },
    create: {
      tokenId: tokenIdNumber,
      contractAddress: NFT_ADDRESS.toLowerCase(),
      owner: sellerAddress,
      creator: sellerAddress,
      listed: true,
      price: price.toString(),
    },
  });
  console.log(`Indexer: NFTListed #${tokenIdNumber} @ ${price.toString()} wei`);
}

async function handleNFTBought(buyer: unknown, _seller: unknown, tokenId: bigint): Promise<void> {
  await prisma.nft.update({
    where: { tokenId: Number(tokenId) },
    data: { owner: toChecksummed(buyer), listed: false, price: null },
  });
  console.log(`Indexer: NFTBought #${Number(tokenId)}`);
}

async function handleNFTListingCancelled(_seller: unknown, tokenId: bigint): Promise<void> {
  await prisma.nft.update({
    where: { tokenId: Number(tokenId) },
    data: { listed: false, price: null },
  });
  console.log(`Indexer: NFTListingCancelled #${Number(tokenId)}`);
}

const EVENT_HANDLERS: Record<string, (args: Result) => Promise<void>> = {
  NFTMinted: (args) => handleNFTMinted(args[0], args[1], args[2]),
  NFTListed: (args) => handleNFTListed(args[0], args[1], args[2], args[3]),
  NFTBought: (args) => handleNFTBought(args[0], args[1], args[2]),
  NFTListingCancelled: (args) => handleNFTListingCancelled(args[0], args[1]),
};

async function processContract(contract: Contract | undefined, currentBlock: number): Promise<void> {
  if (!contract) return;

  const from = Math.max(lastBlock + 1, 0);
  if (from > currentBlock) return;

  const logs = (await contract.queryFilter("*", from, currentBlock)) as Log[];
  if (logs.length === 0) return;

  logs.sort((a, b) => a.blockNumber - b.blockNumber || a.index - b.index);

  for (const log of logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (!parsed) continue;
      const handler = EVENT_HANDLERS[parsed.name];
      if (handler) await handler(parsed.args);
    } catch (error) {
      console.error(`Indexer: gagal memproses event di block #${log.blockNumber}`, error);
    }
  }
}

export async function syncOnce(): Promise<void> {
  if (!provider) return;
  const currentBlock = await provider.getBlockNumber();

  await processContract(nftContract, currentBlock);
  await processContract(marketplaceContract, currentBlock);

  lastBlock = currentBlock;
}

export function startIndexer(): void {
  if (!initContracts()) return;
  if (running) return;
  running = true;

  const tick = async () => {
    try {
      await syncOnce();
    } catch (error) {
      console.error("Indexer: sync error:", error);
    }
  };

  void tick();
  setInterval(tick, POLL_INTERVAL_MS);
  console.log(`Indexer berjalan tiap ${POLL_INTERVAL_MS}ms dari block #${lastBlock}`);
}