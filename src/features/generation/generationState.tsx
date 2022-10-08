import {InputItem, ProcessingItem} from "@features/backend/shared-types";
import {Lookup} from "@features/app";
import {ConnectionStatus, Stats} from "@features/backend";



export interface GenerationState {
    connectionStatus: ConnectionStatus
    processingItem: Lookup<ProcessingItem>
    processingStats: Stats
    potentialToProcessing: Lookup<string> // our key -> backend id
}

export function createGenerationState(): GenerationState {
    return {
        connectionStatus: 'idle',
        processingStats: {queueDepth:0, errors:0},
        processingItem: {},
        potentialToProcessing: {}
    }
}
