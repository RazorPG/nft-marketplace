import { Router } from "express";
import multer from "multer";
import { uploadNFT, getNFTs, getNFTById, getNFTsByOwner } from "../controllers/nft.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/nfts/upload
router.post("/upload", upload.single("image"), uploadNFT);

// GET /api/nfts?listed=true&page=1&limit=20&creator=&contract=&sort=
router.get("/", getNFTs);

// GET /api/nfts/:tokenId
router.get("/:tokenId", getNFTById);

// GET /api/nfts/owner/:address
router.get("/owner/:address", getNFTsByOwner);

export default router;
