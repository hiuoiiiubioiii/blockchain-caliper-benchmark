const hre = require("hardhat");

async function main() {
    const SecureDataStorage = await hre.ethers.getContractFactory("SecureDataStorage");
    console.log("Deploying SecureDataStorage...");
    const contract = await SecureDataStorage.deploy();
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    console.log("SecureDataStorage deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
