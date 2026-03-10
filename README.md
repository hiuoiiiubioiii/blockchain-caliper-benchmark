# Blockchain Caliper Benchmark

This project demonstrates a custom blockchain benchmarking tool using [Hyperledger Caliper](https://hyperledger.github.io/caliper/), [Ganache](https://trufflesuite.com/ganache/), and [Ethers.js](https://docs.ethers.org/v5/). The benchmark evaluates the performance of a sample `SecureDataStorage` smart contract by tracking Transactions Per Second (TPS) for writes and Queries Per Second (QPS) for reads.

## Prerequisites

- Node.js (>= 18.x)
- npm

## Installation

```bash
npm install
```

## Running the Benchmark

The primary benchmark is contained in `custom-benchmark.js`. To run it locally, execute:

```bash
node custom-benchmark.js
```

### What it does:
1. Starts an in-memory Ganache server (local Ethereum node).
2. Deploys a `SecureDataStorage` smart contract to the local test network.
3. Automatically triggers 50 `storeData` operations (Write Benchmark) and calculates TPS.
4. Triggers 50 `getData` operations (Read Benchmark) and calculates QPS.
5. Cleans up and shuts down the Ganache server.

## Continuous Integration (CI)

This repository includes a GitHub Actions workflow (`.github/workflows/benchmark.yml`) that automatically runs the `custom-benchmark.js` script on every push to the `main` or `master` branch. This ensures that the script performs without errors on every iteration.

## Deployment & Hosting

Once this repository is published on GitHub, the automated benchmark CI pipeline will serve as a regular check metric for performance regressions on each commit.

