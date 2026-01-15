/**
 * Deployment Script for SynthGANOS Genesis Protocol Smart Contract
 * Target Network: Base Mainnet
 * Contract: SynthGANOSGenesisProtocol.sol
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// ========================================
// CONFIGURATION
// ========================================

const CONFIG = {
  // Base Mainnet Configuration
  NETWORK: {
    name: 'base-mainnet',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
  },
  
  // Certifier Addresses (UPDATE THESE)
  CERTIFIERS: {
    marekAddress: process.env.MAREK_CERTIFIER_ADDRESS || '', // Zero-Delta Auditor
    pabloAddress: process.env.PABLO_CERTIFIER_ADDRESS || '', // Instrument-Grade Auditor
  },
  
  // Deployment Configuration
  DEPLOYMENT: {
    gasLimit: 5_000_000,
    maxFeePerGas: ethers.parseUnits('2', 'gwei'),
    maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei'),
  },
};

// ========================================
// DEPLOYMENT FUNCTION
// ========================================

async function deployGenesisContract() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  SYNTH-GANOS GENESIS PROTOCOL DEPLOYMENT                    ║');
  console.log('║  Target: Base Mainnet                                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Step 1: Validate Configuration
  console.log('📋 Step 1: Validating Configuration...');
  
  if (!CONFIG.CERTIFIERS.marekAddress || !CONFIG.CERTIFIERS.pabloAddress) {
    throw new Error(
      'Certifier addresses not configured. Please set:\n' +
      '  - MAREK_CERTIFIER_ADDRESS (Zero-Delta Auditor)\n' +
      '  - PABLO_CERTIFIER_ADDRESS (Instrument-Grade Auditor)'
    );
  }
  
  if (!ethers.isAddress(CONFIG.CERTIFIERS.marekAddress)) {
    throw new Error(`Invalid Marek certifier address: ${CONFIG.CERTIFIERS.marekAddress}`);
  }
  
  if (!ethers.isAddress(CONFIG.CERTIFIERS.pabloAddress)) {
    throw new Error(`Invalid Pablo certifier address: ${CONFIG.CERTIFIERS.pabloAddress}`);
  }
  
  console.log('✅ Configuration valid');
  console.log(`   Marek Certifier: ${CONFIG.CERTIFIERS.marekAddress}`);
  console.log(`   Pablo Certifier: ${CONFIG.CERTIFIERS.pabloAddress}`);
  console.log('');
  
  // Step 2: Connect to Base Mainnet
  console.log('🌐 Step 2: Connecting to Base Mainnet...');
  
  const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.rpcUrl);
  const network = await provider.getNetwork();
  
  console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
  
  if (Number(network.chainId) !== CONFIG.NETWORK.chainId) {
    throw new Error(`Chain ID mismatch. Expected ${CONFIG.NETWORK.chainId}, got ${network.chainId}`);
  }
  console.log('');
  
  // Step 3: Load Deployer Wallet
  console.log('🔑 Step 3: Loading Deployer Wallet...');
  
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY not set in environment');
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  const deployerAddress = await wallet.getAddress();
  const balance = await provider.getBalance(deployerAddress);
  
  console.log(`✅ Deployer Address: ${deployerAddress}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther('0.01')) {
    throw new Error('Insufficient balance. Need at least 0.01 ETH for deployment.');
  }
  console.log('');
  
  // Step 4: Compile Contract (assume already compiled)
  console.log('🔨 Step 4: Loading Contract Bytecode...');
  
  const contractPath = path.join(__dirname, 'SynthGANOSGenesisProtocol.sol');
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract file not found: ${contractPath}`);
  }
  
  // NOTE: In production, use Hardhat or Foundry to compile
  // This is a placeholder - actual compilation would happen via build tools
  console.log('⚠️  Note: Contract compilation via Hardhat/Foundry required before deployment');
  console.log('   Run: npx hardhat compile');
  console.log('');
  
  // Step 5: Deploy Contract
  console.log('🚀 Step 5: Deploying SynthGANOS Genesis Protocol...');
  
  // Load compiled contract (this would come from Hardhat artifacts)
  const artifactPath = path.join(__dirname, '../artifacts/contracts/SynthGANOSGenesisProtocol.sol/SynthGANOSGenesisProtocol.json');
  
  if (!fs.existsSync(artifactPath)) {
    console.log('❌ Compiled artifact not found. Please compile first:');
    console.log('   npx hardhat compile');
    console.log('');
    console.log('   Or use Foundry:');
    console.log('   forge build');
    return;
  }
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  
  console.log('   Deploying with constructor arguments:');
  console.log(`   - Marek Certifier: ${CONFIG.CERTIFIERS.marekAddress}`);
  console.log(`   - Pablo Certifier: ${CONFIG.CERTIFIERS.pabloAddress}`);
  console.log('');
  
  const contract = await factory.deploy(
    CONFIG.CERTIFIERS.marekAddress,
    CONFIG.CERTIFIERS.pabloAddress,
    {
      gasLimit: CONFIG.DEPLOYMENT.gasLimit,
      maxFeePerGas: CONFIG.DEPLOYMENT.maxFeePerGas,
      maxPriorityFeePerGas: CONFIG.DEPLOYMENT.maxPriorityFeePerGas,
    }
  );
  
  console.log('⏳ Transaction submitted. Waiting for confirmation...');
  console.log(`   Transaction Hash: ${contract.deploymentTransaction()?.hash}`);
  console.log('');
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log('✅ Contract Deployed Successfully!');
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Block Number: ${(await provider.getBlock('latest'))?.number}`);
  console.log(`   Explorer: ${CONFIG.NETWORK.explorerUrl}/address/${contractAddress}`);
  console.log('');
  
  // Step 6: Verify Deployment
  console.log('✅ Step 6: Verifying Deployment...');
  
  // TypeScript doesn't have full type definitions for custom contract methods
  const contractWithMethods = contract as any;
  const protocolInfo = await contractWithMethods.getProtocolInfo();
  console.log(`   Protocol Name: ${protocolInfo[0]}`);
  console.log(`   Protocol Version: ${protocolInfo[2]}`);
  console.log(`   Instrument-Grade Fidelity: ${Number(protocolInfo[4]) / 100}%`);
  console.log('');
  
  const metrics = await contractWithMethods.getProtocolMetrics();
  console.log('   Initial Metrics:');
  console.log(`   - Total Translations: ${metrics[0]}`);
  console.log(`   - Total NSP Verifications: ${metrics[1]}`);
  console.log(`   - Total Octave Synchronizations: ${metrics[2]}`);
  console.log(`   - Deployment Block: ${metrics[4]}`);
  console.log('');
  
  // Step 7: Save Deployment Info
  console.log('💾 Step 7: Saving Deployment Information...');
  
  const deploymentInfo = {
    network: CONFIG.NETWORK.name,
    chainId: CONFIG.NETWORK.chainId,
    contractAddress: contractAddress,
    deployerAddress: deployerAddress,
    marekCertifier: CONFIG.CERTIFIERS.marekAddress,
    pabloCertifier: CONFIG.CERTIFIERS.pabloAddress,
    deploymentBlock: Number(metrics[4]),
    deploymentTimestamp: Number(metrics[5]),
    transactionHash: contract.deploymentTransaction()?.hash,
    explorerUrl: `${CONFIG.NETWORK.explorerUrl}/address/${contractAddress}`,
    protocolName: protocolInfo[0],
    protocolVersion: protocolInfo[2],
  };
  
  const deploymentPath = path.join(__dirname, '../deployment-genesis-contract.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`✅ Deployment info saved to: ${deploymentPath}`);
  console.log('');
  
  // Step 8: Display Next Steps
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  DEPLOYMENT COMPLETE                                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('');
  console.log('1. Verify contract on Basescan:');
  console.log(`   npx hardhat verify --network base-mainnet ${contractAddress} ${CONFIG.CERTIFIERS.marekAddress} ${CONFIG.CERTIFIERS.pabloAddress}`);
  console.log('');
  console.log('2. Update backend to use contract address:');
  console.log(`   SYNTH_GANOS_CONTRACT_ADDRESS=${contractAddress}`);
  console.log('');
  console.log('3. Test NSP verification:');
  console.log(`   node test-genesis-contract.ts`);
  console.log('');
  console.log('4. Integrate with Syntheverse UI:');
  console.log('   - Add contract ABI to /lib/contracts/');
  console.log('   - Update API to call on-chain verification');
  console.log('   - Display contract metrics in Operator Console');
  console.log('');
  console.log('🔥 Genesis Protocol is now IMMUTABLE and ON-CHAIN! 🔥');
  console.log('');
  
  return deploymentInfo;
}

// ========================================
// MAIN EXECUTION
// ========================================

if (require.main === module) {
  deployGenesisContract()
    .then(() => {
      console.log('Deployment script completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    });
}

export { deployGenesisContract };






