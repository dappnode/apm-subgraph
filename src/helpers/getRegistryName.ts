import { DNP_REGISTRY_ADDRESS, PUBLIC_REGISTRY_ADDRESS } from "./constants";

export function getRegistryName(registryAddress: string): string {
  let name = "";
  if (registryAddress == DNP_REGISTRY_ADDRESS) {
    name = "dnp.dappnode.eth";
  } else if (registryAddress == PUBLIC_REGISTRY_ADDRESS) {
    name = "public.dappnode.eth";
  }
  return name;
}
