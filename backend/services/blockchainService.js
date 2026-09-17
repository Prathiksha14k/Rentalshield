const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACT_ABI = [
  "function depositFunds(string agreementId, address landlord, address tenant) external payable",
  "function recordEvidenceHash(string agreementId, string hash) external",
  "function releaseFunds(string agreementId, uint256 landlordAmount, uint256 tenantAmount) external"
];

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const operatorWallet = new ethers.Wallet(process.env.OPERATOR_PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, operatorWallet);

async function releaseFunds(agreementId, landlordAmountEth, tenantAmountEth) {
  const landlordAmountWei = ethers.parseEther(landlordAmountEth.toString());
  const tenantAmountWei = ethers.parseEther(tenantAmountEth.toString());

  const tx = await contract.releaseFunds(agreementId, landlordAmountWei, tenantAmountWei);
  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber
  };
}

async function recordEvidenceHash(agreementId, hash) {
  const tx = await contract.recordEvidenceHash(agreementId, hash);
  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber
  };
}

module.exports = { releaseFunds, recordEvidenceHash };