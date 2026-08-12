import { network } from "hardhat"
import fs from "fs"
import path from "path"

async function main() {
  const conn = await network.connect()
  const [deployer] = await conn.ethers.getSigners()

  console.log("Network     :", conn.networkName)
  console.log("Deployer    :", deployer.address)
  console.log("Balance     :", (await conn.ethers.provider.getBalance(deployer.address)).toString(), "wei\n")

  // ── Deploy NFT ────────────────────────────────────────────
  console.log("Deploying NFT contract...")
  const NFT = await conn.ethers.getContractFactory("NFT")
  const nft = await NFT.deploy()
  await nft.waitForDeployment()
  const nftAddress = await nft.getAddress()
  console.log("✔ NFT deployed to:", nftAddress)

  // ── Deploy Marketplace ────────────────────────────────────
  console.log("Deploying Marketplace contract...")
  const Marketplace = await conn.ethers.getContractFactory("Marketplace")
  const marketplace = await Marketplace.deploy()
  await marketplace.waitForDeployment()
  const marketplaceAddress = await marketplace.getAddress()
  console.log("✔ Marketplace deployed to:", marketplaceAddress)

  // ── Print summary ─────────────────────────────────────────
  console.log("\n────────────────────────────────────────────")
  console.log("Deployment complete! Update your .env files:")
  console.log("────────────────────────────────────────────")
  console.log(`NFT_CONTRACT_ADDRESS=${nftAddress}`)
  console.log(`MARKETPLACE_CONTRACT_ADDRESS=${marketplaceAddress}`)
  console.log("────────────────────────────────────────────\n")

  // ── Save to deploy-output.json ────────────────────────────
  const output = {
    network: conn.networkName,
    nftAddress,
    marketplaceAddress,
    deployedAt: new Date().toISOString(),
  }
  const outPath = path.resolve("deploy-output.json")
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log("Output saved to deploy-output.json")
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})