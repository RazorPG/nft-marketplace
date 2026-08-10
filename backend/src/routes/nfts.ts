import { Router, type Request, type Response } from "express";
import prisma from "../prisma.js";

const router = Router();

function parseBool(value: unknown): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

// GET /api/nfts?listed=true&page=1&limit=20&creator=&contract=&sort=
router.get("/", async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const listed = parseBool(req.query.listed);
  const creator = typeof req.query.creator === "string" ? req.query.creator : undefined;
  const contractAddress =
    typeof req.query.contract === "string" ? req.query.contract : undefined;
  const sort = req.query.sort === "oldest" ? "oldest" : "newest";

  const where = {
    ...(listed === undefined ? {} : { listed }),
    ...(creator ? { creator: { equals: creator.toLowerCase() } } : {}),
    ...(contractAddress ? { contractAddress } : {}),
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
});

// GET /:tokenId
router.get("/:tokenId", async (req: Request, res: Response) => {
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
});

// GET /owner/:address
router.get("/owner/:address", async (req: Request, res: Response) => {
  const owner = String(req.params.address).toLowerCase();
  const items = await prisma.nft.findMany({ where: { owner } });
  res.json({ data: items });
});

export default router;
