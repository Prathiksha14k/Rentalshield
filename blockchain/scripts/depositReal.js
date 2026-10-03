import { network } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const { ethers } = await network.create();

  const landlordWallet = new ethers.Wallet(process.env.LANDLORD_TEST_PRIVATE_KEY, ethers.provider);

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contract = await ethers.getContractAt("RentalEscrow", contractAddress, landlordWallet);

  const agreementId = "6abf7728a20039fc6581662f";
  const landlordAddress = "0x543203e6538a62FCBD2160b094ba138c8aC18A96";
  const tenantAddress = "0xE6BB0c86f4Db9c1B1AdFd7BAe9A5533F2863973f";
  const depositAmount = ethers.parseEther("0.01");

  console.log("Depositing for agreement:", agreementId);
  console.log("From:", landlordWallet.address);

  const tx = await contract.depositFunds(agreementId, landlordAddress, tenantAddress, {
    value: depositAmount
  });

  console.log("Transaction sent, waiting for confirmation...");
  const receipt = await tx.wait();

  console.log("Deposit confirmed!");
  console.log("Transaction hash:", receipt.hash);
  console.log("Agreement ID used:", agreementId);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});