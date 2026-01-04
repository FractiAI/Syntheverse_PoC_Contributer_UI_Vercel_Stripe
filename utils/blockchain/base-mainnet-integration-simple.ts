/**
 * Simplified Base Integration - Testing Version
 *
 * This is a simplified version matching the working Base deployment pattern.
 * Use this to test if our over-complexity is causing the require(false) errors.
 */

import { debug, debugError } from '@/utils/debug';
import { ethers } from 'ethers';
import SyntheverseGenesisLensKernelABI from './SyntheverseGenesisLensKernel.abi.json';
import { getBaseMainnetConfig } from './base-mainnet-integration';

/**
 * Simplified emitLensEvent - matches working deployment pattern
 *
 * Differences from main implementation:
 * - No ENS overrides (trust ethers.js defaults)
 * - Minimal address trimming (only at config level)
 * - No pre-flight checks (trust the contract)
 * - Direct contract call pattern
 */
export async function emitLensEventSimple(
  extensionType: string,
  data: string
): Promise<{ success: boolean; transaction_hash?: string; block_number?: number; error?: string }> {
  debug('EmitLensEventSimple', 'Emitting lens event (simplified)', { extensionType });

  try {
    const config = getBaseMainnetConfig();
    if (!config) {
      return {
        success: false,
        error: 'Base blockchain configuration not available',
      };
    }

    // Simple provider creation - no ENS overrides
    const provider = new ethers.JsonRpcProvider(config.rpcUrl, {
      chainId: config.chainId,
      name: config.chainId === 8453 ? 'base-mainnet' : 'base-sepolia',
    });

    // Simple wallet creation
    const wallet = new ethers.Wallet(config.privateKey, provider);

    // Simple address handling - only trim at config level
    const lensKernelAddress = ethers.getAddress(config.lensKernelAddress.trim());

    // Simple contract creation - direct pattern
    const lensContract = new ethers.Contract(
      lensKernelAddress,
      SyntheverseGenesisLensKernelABI,
      wallet
    );

    // Convert data to bytes
    const dataBytes = ethers.toUtf8Bytes(data);

    // Direct call - no pre-checks, no gas estimation
    // Match the working deployment pattern exactly
    const tx = await lensContract.extendLens(extensionType, dataBytes);

    debug('EmitLensEventSimple', 'Transaction sent', { txHash: tx.hash });

    // Wait for confirmation
    const receipt = await tx.wait();

    debug('EmitLensEventSimple', 'Lens event emitted', {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });

    return {
      success: true,
      transaction_hash: receipt.hash,
      block_number: receipt.blockNumber,
    };
  } catch (error) {
    debugError('EmitLensEventSimple', 'Failed to emit lens event', error);

    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
