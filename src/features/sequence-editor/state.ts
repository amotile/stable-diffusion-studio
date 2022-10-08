import {Lookup} from "@features/app";

export interface SequencesState {
    currentSequence?: string,
    sequence: Lookup<Sequence>
    sequenceRow: Lookup<SequenceRow>
    sequenceKeyFrame: Lookup<SequenceKeyFrame>
}

export interface Sequence{
    id:string
    name:string
    playPosition: number
    rows: string[] //ids
    lastOpen: number
}

export interface SequenceRow {
    id:string
    key: string
    label: string,
    type: string,
    keyFrames: string[] // ids
}

export interface SequenceKeyFrame {
    id:string
    frame: number
    locked?: boolean
    value: any
}

export function createSequencesState() : SequencesState{
   return {

        sequence: {
        },
        sequenceRow: {
        },
        sequenceKeyFrame: {
        }

    }
}