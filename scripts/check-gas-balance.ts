#!/usr/bin/env tsx
/**
 * Check Base Sepolia Testnet Gas Balance
 * 
 * Checks if the wallet has sufficient ETH for gas fees on Base Sepolia testnet
 */

import { ethers } from 'ethers'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

async function checkGasBalance() {
    console.log('\n⛽ Checking Base Sepolia Testnet Gas Balance\n')
    
    // Get configuration
    const network = process.env.BLOCKCHAIN_NETWORK || 'base_sepolia'
    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY
    const deployerAddress = process.env.DEPLOYER_ADDRESS
    
    if (!privateKey) {
        console.error('❌ ERROR: BLOCKCHAIN_PRIVATE_KEY is not set in environment variables')
        console.log('\nSet it in your .env file:')
        console.log('  BLOCKCHAIN_PRIVATE_KEY=0x...')
        process.exit(1)
    }
    
    try {
        // Create provider and wallet
        const provider = new ethers.JsonRpcProvider(rpcUrl, {
            chainId: 84532,
            name: 'base-sepolia'
        })
        
        const wallet = new ethers.Wallet(privateKey, provider)
        const address = wallet.address
        
        console.log('📡 Network:', network === 'base_sepolia' ? 'Base Sepolia Testnet' : 'Base Mainnet')
        console.log('🔗 RPC URL:', rpcUrl)
        console.log('👛 Wallet Address:', address)
        if (deployerAddress && deployerAddress.toLowerCase() !== address.toLowerCase()) {
            console.log('⚠️  DEPLOYER_ADDRESS mismatch:', deployerAddress)
        }
        console.log('')
        
        // Check balance
        console.log('⏳ Fetching balance...')
        const balance = await provider.getBalance(address)
        const balanceEth = ethers.formatEther(balance)
        
        console.log('💰 Balance:', balanceEth, 'ETH')
        console.log('   (', balance.toString(), 'wei )')
        console.log('')
        
        // Check if sufficient for transactions
        // Typical gas costs:
        // - Simple transaction: ~21,000 gas
        // - Contract interaction: ~100,000 - 500,000 gas
        // - Base Sepolia gas price: ~0.1 gwei (very low)
        // - Estimated cost per transaction: ~0.00001 - 0.0001 ETH
        
        const minRecommended = ethers.parseEther('0.001') // 0.001 ETH minimum
        const sufficient = balance >= minRecommended
        
        if (sufficient) {
            console.log('✅ Sufficient balance for transactions')
            console.log('   (Recommended minimum: 0.001 ETH)')
        } else {
            console.log('⚠️  WARNING: Low balance!')
            console.log('   Recommended minimum: 0.001 ETH')
            console.log('   Current balance:', balanceEth, 'ETH')
            console.log('')
            console.log('💡 Get Base Sepolia ETH from:')
            console.log('   https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet')
            console.log('   or')
            console.log('   https://app.chainlink.com/faucets')
        }
        
        // Estimate gas price
        try {
            const feeData = await provider.getFeeData()
            if (feeData.gasPrice) {
                const gasPriceGwei = ethers.formatUnits(feeData.gasPrice, 'gwei')
                console.log('')
                console.log('⛽ Current Gas Price:', gasPriceGwei, 'gwei')
                
                // Estimate cost for a typical transaction
                const estimatedGas = 200000n // Typical contract interaction
                const estimatedCost = feeData.gasPrice * estimatedGas
                const estimatedCostEth = ethers.formatEther(estimatedCost)
                console.log('📊 Estimated cost per transaction (~200k gas):', estimatedCostEth, 'ETH')
            }
        } catch (gasError) {
            console.log('⚠️  Could not fetch gas price:', gasError instanceof Error ? gasError.message : 'Unknown error')
        }
        
        // Check network connectivity
        try {
            const blockNumber = await provider.getBlockNumber()
            console.log('')
            console.log('🌐 Network Status: Connected')
            console.log('📦 Latest Block:', blockNumber)
        } catch (networkError) {
            console.log('')
            console.error('❌ Network Error:', networkError instanceof Error ? networkError.message : 'Unknown error')
            console.log('   Check your RPC URL:', rpcUrl)
        }
        
        console.log('')
        
    } catch (error) {
        console.error('❌ Error checking balance:', error instanceof Error ? error.message : 'Unknown error')
        if (error instanceof Error && error.stack) {
            console.error('\nStack trace:', error.stack)
        }
        process.exit(1)
    }
}

// Run the check
checkGasBalance().catch(console.error)

