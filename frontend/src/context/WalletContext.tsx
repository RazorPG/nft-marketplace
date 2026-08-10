import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { Signer } from "ethers"
import { CHAIN_ID } from "../config"
import {
  connectWallet,
  getInjectedProvider,
  getWalletErrorMessage,
  switchToChain,
} from "../utils/wallet"
import type { EthereumProvider } from "../types/ethereum"

interface WalletContextValue {
  address: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  clearError: () => void
  provider: EthereumProvider | null
  signer: Signer | null
}

export const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const providerRef = useRef<EthereumProvider | null>(null)
  const signerRef = useRef<Signer | null>(null)

  const disconnectInternal = useCallback(() => {
    providerRef.current?.removeAllListeners()
    providerRef.current = null
    signerRef.current = null
    setAddress(null)
    setChainId(null)
    setIsConnecting(false)
  }, [])

  const connect = useCallback(async () => {
    if (isConnecting) return
    setIsConnecting(true)
    setError(null)

    try {
      const provider = getInjectedProvider()
      if (!provider) {
        setError(getWalletErrorMessage(new Error("NO_WALLET")))
        return
      }

      const result = await connectWallet()

      if (result.chainId !== CHAIN_ID) {
        await switchToChain(provider)
      }

      providerRef.current = provider
      signerRef.current = result.signer
      setAddress(result.address)
      setChainId(result.chainId)

      provider.on("accountsChanged", (accounts: unknown) => {
        const list = accounts as string[]
        if (!list.length) {
          disconnectInternal()
          return
        }
        setAddress(list[0])
      })

      provider.on("chainChanged", (hexChainId: unknown) => {
        setChainId(Number(hexChainId as string))
      })

      provider.on("disconnect", () => {
        disconnectInternal()
      })
    } catch (err) {
      setError(getWalletErrorMessage(err))
    } finally {
      setIsConnecting(false)
    }
  }, [isConnecting, disconnectInternal])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      chainId,
      isConnecting,
      error,
      connect,
      disconnect: disconnectInternal,
      clearError,
      provider: providerRef.current,
      signer: signerRef.current,
    }),
    [address, chainId, isConnecting, error, connect, disconnectInternal, clearError],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
