import {InputItem, ProcessingItem} from "@features/backend/shared-types";
import {Lookup} from "@features/app";
import {PotentialFrame} from "@features/generation";


export interface PlaybackState {
    playback: {
        potentialFrames: Lookup<PotentialFrame[]> // sequenceId is Key
        hovered?: string
    }
}

export function createPlaybackState(): PlaybackState {
    return {
        playback: {
            potentialFrames: {},
        }
    }
}
