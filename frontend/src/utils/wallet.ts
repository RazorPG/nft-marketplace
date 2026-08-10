import { BrowserProvider, type Signer } from "ethers"
import { CHAIN_ID, RPC_URL } from "../config"
import type { EthereumProvider } from "../types/ethereum"

export type { EthereumProvider }

const CHAIN_HEX = `0x${CHAIN_ID.toString(16)}`

export function getInjectedProvider(): EthereumProvider | undefined {
  return window.ethereum
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

async function addChain(provider: EthereumProvider): Promise<void> {
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: CHAIN_HEX,
        chainName: "Hardhat Localhost",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: [RPC_URL],
      },
    ],
  })
}

export async function switchToChain(provider: EthereumProvider): Promise<void> {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_HEX }],
    })
  } catch (error) {
    const err = error as { code?: number }
    if (err.code === 4902) {
      await addChain(provider)
      return
    }
    throw error
  }
}

export async function connectWallet(): Promise<{
  provider: EthereumProvider
  signer: Signer
  address: string
  chainId: number
}> {
  const provider = getInjectedProvider()
  if (!provider) {
    throw new Error("NO_WALLET")
  }

  const accounts = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[]

  if (!accounts || accounts.length === 0) {
    throw new Error("REJECTED")
  }

  const ethersProvider = new BrowserProvider(provider)
  const signer = await ethersProvider.getSigner()
  const address = await signer.getAddress()
  const network = await ethersProvider.getNetwork()

  return {
    provider,
    signer,
    address,
    chainId: Number(network.chainId),
  }
}

export function getWalletErrorMessage(error: unknown): string {
  const err = error as { code?: number; message?: string }

  if (err.message === "NO_WALLET") {
    return "Wallet tidak terdeteksi. Pasang MetaMask atau wallet browser yang kompatibel."
  }
  if (err.message === "REJECTED" || err.code === 4001) {
    return "Permintaan koneksi ditolak."
  }
  if (err.code === -32002) {
    return "Permintaan koneksi sedang diproses. Buka wallet Anda untuk menyetujui."
  }
  return "Gagal menghubungkan wallet. Coba lagi."
}
