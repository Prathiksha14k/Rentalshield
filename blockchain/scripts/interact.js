import { network } from "hardhat";

const { ethers } = await network.create();

async function main() {
  const [operator, landlord, tenant] = await ethers.getSigners();

  console.log("Operator address:", operator.address);
  console.log("Landlord address:", landlord.address);
  console.log("Tenant address:", tenant.address);

  const contract = await ethers.deployContract("RentalEscrow");
  await contract.waitForDeployment();

  console.log("Contract deployed at:", await contract.getAddress());

  const agreementId = "test-agreement-001";
  const depositAmount = ethers.parseEther("1.0");

  const depositTx = await contract.connect(landlord).depositFunds(
    agreementId,
    landlord.address,
    tenant.address,
    { value: depositAmount }
  );
  await depositTx.wait();
  console.log("Deposit made:", ethers.formatEther(depositAmount), "ETH");

  const hashTx = await contract.connect(operator).recordEvidenceHash(
    agreementId,
    "fakehash1234567890"
  );
  await hashTx.wait();
  console.log("Evidence hash recorded");

  const landlordShare = ethers.parseEther("0.4");
  const tenantShare = ethers.parseEther("0.6");

  const landlordBalanceBefore = await ethers.provider.getBalance(landlord.address);
  const tenantBalanceBefore = await ethers.provider.getBalance(tenant.address);

  const releaseTx = await contract.connect(operator).releaseFunds(
    agreementId,
    landlordShare,
    tenantShare
  );
  await releaseTx.wait();
  console.log("Funds released: landlord gets 0.4 ETH, tenant gets 0.6 ETH");

  const landlordBalanceAfter = await ethers.provider.getBalance(landlord.address);
  const tenantBalanceAfter = await ethers.provider.getBalance(tenant.address);

  console.log("Landlord balance increased by:", ethers.formatEther(landlordBalanceAfter - landlordBalanceBefore), "ETH");
  console.log("Tenant balance increased by:", ethers.formatEther(tenantBalanceAfter - tenantBalanceBefore), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});