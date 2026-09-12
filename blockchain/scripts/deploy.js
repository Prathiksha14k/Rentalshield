import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const [operator] = await ethers.getSigners();
  console.log("Deploying with operator account:", operator.address);

  const contract = await ethers.deployContract("RentalEscrow");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("RentalEscrow deployed to Sepolia at:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});