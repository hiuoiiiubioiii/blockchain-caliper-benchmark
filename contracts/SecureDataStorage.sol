// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SecureDataStorage {
    mapping(string => string) private dataHashes;

    event DataStored(string indexed id, string dataHash);

    function storeData(string memory id, string memory dataHash) public {
        dataHashes[id] = dataHash;
        emit DataStored(id, dataHash);
    }

    function getData(string memory id) public view returns (string memory) {
        return dataHashes[id];
    }
}
