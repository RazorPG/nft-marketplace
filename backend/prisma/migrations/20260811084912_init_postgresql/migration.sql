-- CreateTable
CREATE TABLE "NFTs" (
    "id" SERIAL NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFTs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NFTs_tokenId_key" ON "NFTs"("tokenId");
