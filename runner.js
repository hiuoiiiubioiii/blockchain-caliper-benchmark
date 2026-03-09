const ganache = require("ganache");
const { ethers } = require("ethers");
const fs = require("fs");
const { execSync } = require("child_process");

async function runBenchmark() {
    console.log("Starting Ganache server...");
    const options = {
        wallet: { mnemonic: "test test test test test test test test test test test junk" },
        logging: { quiet: true }
    };
    const server = ganache.server(options);

    await new Promise((resolve, reject) => {
        server.listen(8545, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
    console.log("Ganache server listening on ws://127.0.0.1:8545");

    try {
        console.log("Deploying SecureDataStorage...");
        const provider = new ethers.providers.WebSocketProvider("ws://127.0.0.1:8545");
        const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

        const abiJson = fs.readFileSync("./contracts_SecureDataStorage_sol_SecureDataStorage.abi", "utf8");
        const bytecode = fs.readFileSync("./contracts_SecureDataStorage_sol_SecureDataStorage.bin", "utf8");

        const factory = new ethers.ContractFactory(JSON.parse(abiJson), bytecode, wallet);
        const contract = await factory.deploy();
        await contract.deployTransaction.wait();

        const deployedAddress = contract.address;
        console.log("SecureDataStorage deployed to:", deployedAddress);

        // Update the network configuration with the deployed address
        let networkConfig = fs.readFileSync("./caliper-workspace/networks/ethereum-local.json", "utf8");
        // Caliper uses contractDeployerAddress and actually re-deploys via path in Ethereum-local, but providing address is also supported.
        // The default config I wrote deploys it natively via path. 

        // console.log("Binding Hyperledger Caliper...");
        // try {
        //     execSync("npx --yes @hyperledger/caliper-cli@0.5.0 bind --caliper-bind-sut ethereum:1.2.1", { stdio: "inherit" });
        // } catch (e) {
        //     console.error("Binding failed", e.message);
        // }

        console.log("Running Caliper benchmark...");
        try {
            execSync("npx --yes @hyperledger/caliper-cli@0.5.0 launch manager --caliper-workspace ./caliper-workspace --caliper-networkconfig networks/ethereum-local.json --caliper-benchconfig benchmarks/config.yaml --caliper-flow-only-test", { stdio: "inherit" });
        } catch (e) {
            console.error("Benchmark launch failed", e.message);
        }

        console.log("Benchmark complete. Results should be in report.html.");
    } catch (err) {
        console.error("Error during execution:", err);
    } finally {
        console.log("Closing Ganache server...");
        await server.close();
        console.log("Cleanup complete.");
    }
}

runBenchmark();
