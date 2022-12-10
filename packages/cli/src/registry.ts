import { ethers } from 'ethers';
import { ReadOnlyCannonRegistry } from '@usecannon/builder';

interface Options {
  registryAddress: string;
  registryRpc: string;
  ipfsUrl: string;
  ipfsAuthorizationHeader?: string;
}

export function createRegistry({ registryAddress, registryRpc, ipfsUrl, ipfsAuthorizationHeader }: Options) {
  const ipfsOptions: ConstructorParameters<typeof ReadOnlyCannonRegistry>[0]['ipfsOptions'] = { url: ipfsUrl };

  if (ipfsAuthorizationHeader) {
    ipfsOptions.headers = {
      authorization: ipfsAuthorizationHeader,
    };
  }

  return new ReadOnlyCannonRegistry({
    address: registryAddress,
    signerOrProvider: new ethers.providers.JsonRpcProvider(registryRpc),
    ipfsOptions,
  });
}
