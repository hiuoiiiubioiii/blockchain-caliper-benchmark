const ganache = require("ganache");
const { ethers } = require("ethers");
const fs = require("fs");

async function runCustomBenchmark(txCount = 50) {
    let results = {
        write: { tps: 0, timeSec: 0, count: txCount },
        read: { qps: 0, timeSec: 0, count: txCount },
        error: null
    };

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
    console.log("Ganache server listening on http://127.0.0.1:8545");

    try {
        console.log("Deploying SecureDataStorage...");
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
        const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

        const abiJson = fs.readFileSync("./contracts_SecureDataStorage_sol_SecureDataStorage.abi", "utf8");
        const bytecode = fs.readFileSync("./contracts_SecureDataStorage_sol_SecureDataStorage.bin", "utf8");

        const factory = new ethers.ContractFactory(JSON.parse(abiJson), bytecode, wallet);
        const contract = await factory.deploy();
        await contract.deployTransaction.wait();

        const deployedAddress = contract.address;
        console.log("SecureDataStorage deployed to:", deployedAddress);

        const TX_COUNT = txCount;

        console.log(`\nStarting Custom Benchmark: ${TX_COUNT} Transactions`);

        // Store Data Benchmark
        console.log("--- Store Data (Write) Benchmark ---");
        let startTime = Date.now();
        let promises = [];

        let startingNonce = await wallet.getTransactionCount();
        const gasPrice = await provider.getGasPrice();

        for (let i = 0; i < TX_COUNT; i++) {
            // Include await if we want sequential or push to promises for parallel (simulate concurrent users)
            promises.push(contract.storeData(`doc_${i}`, `hash_${i}`, { nonce: startingNonce + i, gasPrice: gasPrice, gasLimit: 200000 }));
        }

        let txResponses = await Promise.all(promises);
        let waitPromises = txResponses.map(tx => tx.wait());
        await Promise.all(waitPromises);

        let endTime = Date.now();
        let totalTimeSec = (endTime - startTime) / 1000;
        let tps = (TX_COUNT / totalTimeSec) || 0;

        results.write.tps = tps;
        results.write.timeSec = totalTimeSec;

        console.log(`Successfully stored ${TX_COUNT} records.`);
        console.log(`Total Time: ${totalTimeSec.toFixed(2)} s`);
        console.log(`Transactions Per Second (TPS): ${tps.toFixed(2)}\n`);

        // Get Data Benchmark
        console.log("--- Get Data (Read) Benchmark ---");
        startTime = Date.now();
        promises = [];

        for (let i = 0; i < TX_COUNT; i++) {
            promises.push(contract.getData(`doc_${i}`));
        }

        await Promise.all(promises);

        endTime = Date.now();
        totalTimeSec = (endTime - startTime) / 1000;
        tps = (TX_COUNT / totalTimeSec) || 0;

        results.read.qps = tps;
        results.read.timeSec = totalTimeSec;

        console.log(`Successfully retrieved ${TX_COUNT} records.`);
        console.log(`Total Time: ${totalTimeSec.toFixed(2)} s`);
        console.log(`Queries Per Second (QPS): ${tps.toFixed(2)}\n`);

    } catch (err) {
        console.error("Error during execution:", err);
        results.error = err.message;
    } finally {
        console.log("Closing Ganache server...");
        await server.close();
        console.log("Cleanup complete.");
    }
    return results;
}

if (require.main === module) {
    runCustomBenchmark().catch(console.error);
}

module.exports = { runCustomBenchmark };
