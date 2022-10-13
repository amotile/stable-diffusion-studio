import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {BackendConnection, backendConnection} from "@features/backend";
import {InputItem} from "@features/backend/shared-types";



let theConnection: BackendConnection

export function generateFrameId(input: InputItem){
    let obj :any = input
    let fields = Object.keys(input);
    fields.sort()

    return fields.map(field => `${field}_${obj[field]}`).join("_")
}

// usually not stored (but might be for cache), instead used to create Processing Items
export interface PotentialFrame{
    id: string
    input: InputItem
    keyFrames?: number
}

export function useGeneration() {
    const connectionStatus = useTheStore(s => s.connectionStatus)
    if (!theConnection) {
        theConnection = backendConnection({
            server: 'localhost',
            store: (items) => updateTheStore(s => Object.assign(s.processingItem, items)),
            remove: (id) => updateTheStore(s => {delete s.processingItem[id]}),
            statsChanged: (stats) => updateTheStore(s => {s.processingStats = stats}),
            setStatus: (status) => updateTheStore(s => s.connectionStatus = status),
            getKnown: () => Object.keys(useTheStore.getState().processingItem)
        })
    }

    return {
        stop: theConnection.stop,
        clear: theConnection.clear,
        collectImages: theConnection.collectImages,
        async enqueue(potentialFrames: PotentialFrame[]) {

            let ids = await theConnection.enqueue(potentialFrames.map(i => i.input))
            updateTheStore(s => {
                for (let i = 0; i < potentialFrames.length; i++) {
                    const id = potentialFrames[i].id;
                    s.potentialToProcessing[id] = ids[i]
                }
            })
        },
        status: connectionStatus
    }
}
