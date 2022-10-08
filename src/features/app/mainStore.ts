import create from "zustand";
import {AppState, createAppState} from "@features/app/appState";
import {devtools, persist} from "zustand/middleware";
import {produce} from "immer";
import _ from "lodash";
import {createSequencesState, SequencesState} from "@features/sequence-editor/state";
import {createGenerationState, GenerationState} from "@features/generation/generationState";
import {createWorkshopState, WorkshopState} from "@features/workshop/workshopState";
import {createPlaybackState, PlaybackState} from "@features/playback/playbackState";
// import {createRemoteState, RemoteState} from "@features/app/remote";
// import {createGenerationState, PotentialFramesState} from "@features/frame-viewer/generationState";

export type FullState = AppState & SequencesState & GenerationState & PlaybackState & WorkshopState

export const defaultState: FullState = {
    ...createAppState(),
    ...createPlaybackState(),
    ...createSequencesState(),
    ...createGenerationState(),
    ...createWorkshopState(),

};
export const useTheStore = create<FullState>()(
    devtools(
        persist(() => _.cloneDeep(defaultState), {
                name: 'stored',
                partialize: state => (state),
// merge: (s, current)=>{
//     // debugger
//     if(s){
//
//         const s2 = _.merge(current, s) as FullState
//
//         for (const id of s2.history) {
//             let status = s2.images[id]?.status;
//             if(status !='complete' &&  status !='failed'){
//                 delete s2.images[id]
//             }
//         }
//         setTimeout(doProcessing,1)
//         // debugger
//         return s2
//     }
//     return current
//
// },
            }
        )
    )
)

export function updateTheStore(setter: (s: FullState) => void) {
    useTheStore.setState(realState => produce(realState, (immerState) => {
        setter(immerState)
    }))
}
