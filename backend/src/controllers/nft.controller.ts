import type { Request, Response } from "express";
import prisma from "../prisma.js";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../services/ipfs.service.js";

function parseBool(value: unknown): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export const uploadNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    const { name, description } = req.body;
    if (!name || !description) {
      res.status(400).json({ error: "Name and description are required" });
      return;
    }

    // 1. Upload image to IPFS
    const imageRes = await uploadFileToIPFS(req.file.buffer, req.file.originalname, req.file.mimetype);
    const imageURI = `ipfs://${imageRes.IpfsHash}`;

    // 2. Upload metadata to IPFS
    const metadata = {
      name,
      description,
      image: imageURI,
    };
    const metadataRes = await uploadJSONToIPFS(metadata);
    const metadataURI = `ipfs://${metadataRes.IpfsHash}`;

    res.json({
      success: true,
      metadataURI,
      imageURI,
    });
  } catch (error: any) {
    console.error("Upload route error:", error);
    res.status(500).json({ error: "Failed to upload to IPFS" });
  }
};

export const getNFTs = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const listed = parseBool(req.query.listed);
  const creator = typeof req.query.creator === "string" ? req.query.creator : undefined;
  const contractAddress =
    typeof req.query.contract === "string" ? req.query.contract : undefined;
  const sort = req.query.sort === "oldest" ? "oldest" : "newest";
  const search = typeof req.query.search === "string" ? req.query.search : undefined;

  const where = {
    ...(listed === undefined ? {} : { listed }),
    ...(creator ? { creator: { equals: creator.toLowerCase() } } : {}),
    ...(contractAddress ? { contractAddress } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    } : {})
  };

  const [total, items] = await Promise.all([
    prisma.nft.count({ where }),
    prisma.nft.findMany({
      where,
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({ data: items, page, limit, total });
};

export const getNFTById = async (req: Request, res: Response): Promise<void> => {
  const tokenId = Number(req.params.tokenId);
  if (!Number.isInteger(tokenId) || tokenId < 0) {
    res.status(400).json({ error: "Invalid tokenId" });
    return;
  }

  const nft = await prisma.nft.findUnique({ where: { tokenId } });
  if (!nft) {
    res.status(404).json({ error: "NFT not found" });
    return;
  }

  res.json(nft);
};

export const getNFTsByOwner = async (req: Request, res: Response): Promise<void> => {
  const owner = String(req.params.address).toLowerCase();
  const items = await prisma.nft.findMany({ where: { owner } });
  res.json({ data: items });
};
