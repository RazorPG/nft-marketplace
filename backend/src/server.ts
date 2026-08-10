import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import nftRoutes from "./routes/nfts.js";
import { startIndexer } from "./indexer.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/nfts", nftRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
  startIndexer();
});