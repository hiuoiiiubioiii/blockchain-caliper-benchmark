'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class RetrieveDataWorkload extends WorkloadModuleBase {
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

        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'getData',
            contractArguments: [id],
            readOnly: true
        };

        try {
            await this.sutAdapter.sendRequests(request);
        } catch (err) {
            console.error(err);
        }
    }
}

function createWorkloadModule() {
    return new RetrieveDataWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
