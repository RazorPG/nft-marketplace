import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express"
import cors from "cors"
import nftRoutes from "./routes/nfts.route.js"
import { startIndexer } from "./indexer.js"

const app = express()
const PORT = Number(process.env.PORT ?? 4000)

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map(o => o.trim())

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
)

app.use(express.json())

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" })
})

app.use("/api/nfts", nftRoutes)

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: "Internal server error" })
})

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`)
  startIndexer()
})
