-- CreateTable
CREATE TABLE "NFTs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tokenId" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "listed" BOOLEAN NOT NULL DEFAULT false,
    "price" TEXT,
    "name" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "tokenURI" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NFTs_tokenId_key" ON "NFTs"("tokenId");
