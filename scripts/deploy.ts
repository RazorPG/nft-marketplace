import { network } from "hardhat"

async function main() {
  const [deployer] = await (await network.create()).ethers.getSigners()

  console.log("Deploying contracts with the account:", deployer.address)

  const connection = await network.create()
  const NFT = await connection.ethers.getContractFactory("NFT")
  const nft = await NFT.deploy()
  await nft.waitForDeployment()

  const Marketplace = await connection.ethers.getContractFactory("Marketplace")
  const marketplace = await Marketplace.deploy()
  await marketplace.waitForDeployment()

  const nftAddress = await nft.getAddress()
  const marketplaceAddress = await marketplace.getAddress()

  console.log("NFT contract deployed to:", nftAddress)
  console.log("Marketplace contract deployed to:", marketplaceAddress)

  return { nftAddress, marketplaceAddress }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})