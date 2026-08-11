export function resolveIpfsUri(uri: string | null | undefined): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  return uri;
}
