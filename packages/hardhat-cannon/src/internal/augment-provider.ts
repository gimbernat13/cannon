import { ChainArtifacts, handleTxnError } from '@usecannon/builder';
import { ProviderWrapper } from 'hardhat/internal/core/providers/wrapper';
import { EthereumProvider, HardhatRuntimeEnvironment, RequestArguments } from 'hardhat/types';

class CannonWrapperProvider extends ProviderWrapper {
  artifacts: ChainArtifacts;
  Web3Provider: any;

  constructor(provider: EthereumProvider, artifacts: ChainArtifacts, Web3Provider: any) {
    super(provider);
    this.artifacts = artifacts;
    this.Web3Provider = Web3Provider;
  }

  public async request(args: RequestArguments): Promise<unknown> {
    try {
      return this._wrappedProvider.request(args);
    } catch (err) {
      const provider = new (this as any).Web3Provider(this._wrappedProvider);
      await handleTxnError(this.artifacts, provider, err);
    }
  }
}

export async function augmentProvider(hre: HardhatRuntimeEnvironment, artifacts: ChainArtifacts = {}) {
  if (hre.network.name !== 'cannon') return;

  const { createProvider } = await import('hardhat/internal/core/providers/construction');
  const { BackwardsCompatibilityProviderAdapter } = await import('hardhat/internal/core/providers/backwards-compatibility');

  hre.config.networks.cannon.url = `http://127.0.0.1:${hre.config.networks.cannon.port}`;

  const baseProvider = await createProvider(hre.config, hre.network.name, hre.artifacts);

  const cannonProvider = new CannonWrapperProvider(baseProvider, artifacts, (hre as any).ethers.providers.Web3Provider);

  hre.network.provider = new BackwardsCompatibilityProviderAdapter(cannonProvider);

  if ((hre as any).ethers.version.startsWith('ethers/5.')) {
    // refresh hardhat ethers
    // todo this is hacky but somehow normal for hardhat network extension
    const { createProviderProxy } = await import('@nomiclabs/hardhat-ethers/internal/provider-proxy');
    (hre as any).ethers.provider = createProviderProxy(hre.network.provider);
  }
}
