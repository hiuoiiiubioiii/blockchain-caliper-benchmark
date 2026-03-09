'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class StoreDataWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }

    async submitTransaction() {
        this.txIndex++;
        const id = `data_${this.workerIndex}_${this.txIndex}`;
        const dataHash = `hash_${Date.now()}_${Math.random()}`;

        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'storeData',
            contractArguments: [id, dataHash],
            readOnly: false
        };

        try {
            await this.sutAdapter.sendRequests(request);
        } catch (err) {
            console.error(err);
        }
    }
}

function createWorkloadModule() {
    return new StoreDataWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
