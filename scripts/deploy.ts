import hre from "hardhat";

async function main() {
  const Marketplace = await hre.ethers.getContractFactory("DataMarketplace");

  const marketplace = await Marketplace.deploy();

  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();

  console.log("DataMarketplace deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});