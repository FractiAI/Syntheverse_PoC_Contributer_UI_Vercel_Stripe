/**
 * Verify Contract Ownership
 *
 * This script verifies that the configured wallet is the owner of the SyntheverseGenesisLensKernel contract.
 * Based on the successful deployment at: https://github.com/FractiAI/Syntheverse-Genesis-Base-Blockchain
 *
 * Expected owner (deployer): 0x3563388d0E1c2D66A004E5E57717dc6D7e568BE3
 */

import { ethers } from 'ethers';
import { config } from 'dotenv';
import {
  getBaseMainnetConfig,
  createBaseProvider,
} from '../utils/blockchain/base-mainnet-integration';
import SyntheverseGenesisLensKernelABI from '../utils/blockchain/SyntheverseGenesisLensKernel.abi.json';

config();

async function verifyOwnership() {
  console.log('🔍 Verifying contract ownership...\n');

  try {
    const config = getBaseMainnetConfig();
    if (!config) {
      console.error('❌ Base configuration not available');
      process.exit(1);
    }

    const { provider, wallet } = createBaseProvider(config);
    const walletAddress = await wallet.getAddress();

    console.log(`📝 Network: ${config.chainId === 8453 ? 'Base Mainnet' : 'Base Sepolia'}`);
    console.log(`📝 RPC: ${config.rpcUrl}`);
    console.log(`📝 Wallet Address: ${walletAddress}`);
    console.log(`📝 LensKernel Address: ${config.lensKernelAddress}\n`);

    // Get contract instance
    const lensKernelAddress = ethers.getAddress(config.lensKernelAddress.trim());
    const lensContract = new ethers.Contract(
      lensKernelAddress,
      SyntheverseGenesisLensKernelABI,
      provider
    );

    // Get contract owner
    const contractOwner = await lensContract.owner();
    console.log(`👤 Contract Owner: ${contractOwner}`);
    console.log(`👤 Your Wallet:    ${walletAddress}\n`);

    // Compare addresses (case-insensitive)
    if (contractOwner.toLowerCase() === walletAddress.toLowerCase()) {
      console.log('✅ SUCCESS: Your wallet IS the contract owner!');
      console.log('✅ You can call extendLens() successfully.\n');

      // Get additional contract info
      const [name, purpose, version, genesis] = await lensContract.getLensInfo();
      console.log('📋 Contract Info:');
      console.log(`   Name: ${name}`);
      console.log(`   Purpose: ${purpose}`);
      console.log(`   Version: ${version}`);
      console.log(`   Genesis: ${genesis}`);

      return true;
    } else {
      console.log('❌ ERROR: Your wallet is NOT the contract owner!');
      console.log(`\n⚠️  To fix this:`);
      console.log(`   1. Ensure BLOCKCHAIN_PRIVATE_KEY corresponds to the deployer wallet`);
      console.log(`   2. Expected owner: 0x3563388d0E1c2D66A004E5E57717dc6D7e568BE3`);
      console.log(`   3. Your wallet: ${walletAddress}`);
      console.log(`\n💡 Note: extendLens() requires onlyOwner modifier.`);
      console.log(`   Only the contract owner can emit Lens events.\n`);

      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying ownership:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
}

verifyOwnership()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
