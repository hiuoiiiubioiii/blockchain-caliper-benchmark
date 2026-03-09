#!/bin/bash
set -xe

echo "Compiling SecureDataStorage.sol..."
npx --yes solc@0.8.20 --bin --abi contracts/SecureDataStorage.sol

echo "Starting Ganache node..."
lsof -t -i:8545 | xargs kill -9 || true
npx --yes ganache-cli@6.12.2 -m "test test test test test test test test test test test junk" -p 8545 -q > ganache.log 2>&1 &
GANACHE_PID=$!
sleep 5

echo "Deploying contract via ethers..."
node scripts/deploy.js || true

echo "Binding Caliper..."
npx --yes @hyperledger/caliper-cli@0.5.0 bind --caliper-bind-sut ethereum:1.2.1

echo "Launching Caliper..."
npx --yes @hyperledger/caliper-cli@0.5.0 launch manager \
  --caliper-workspace ./caliper-workspace \
  --caliper-networkconfig networks/ethereum-local.yaml \
  --caliper-benchconfig benchmarks/config.yaml \
  --caliper-flow-only-test > benchmark.log 2>&1

echo "Benchmark completed."
kill -9 $GANACHE_PID || true
