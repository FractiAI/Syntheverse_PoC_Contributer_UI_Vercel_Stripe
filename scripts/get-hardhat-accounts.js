/**
 * Get Hardhat default account private keys
 * For local development and testing
 */

// Hardhat's default accounts (first 20 accounts)
const HARDHAT_DEFAULT_ACCOUNTS = [
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  // Add more if needed
];

console.log('Hardhat Default Accounts (for local testing):');
console.log('='.repeat(60));
HARDHAT_DEFAULT_ACCOUNTS.forEach((account, index) => {
  console.log(`\nAccount ${index}:`);
  console.log(`  Address: ${account.address}`);
  console.log(`  Private Key: ${account.privateKey}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n⚠️  WARNING: These are default test accounts - NEVER use in production!');
console.log('For production, generate a secure wallet and use its private key.\n');
