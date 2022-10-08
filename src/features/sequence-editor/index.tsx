import {Flex} from "@chakra-ui/react";
import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {Lookup, uId} from "@features/app";
import {Left} from "@features/sequence-editor/Left/Left";
import {Right} from "@features/sequence-editor/Right/Right";
import {Sequence, SequenceKeyFrame, SequencesState} from "@features/sequence-editor/state";
import _ from "lodash";
import {InputItem} from "@features/backend/shared-types";
import {x2imageDefaults} from "@features/playback";
import {randomSeed} from "@features/prop-editors/SeedEditor";

export interface PropEditorProps<T> {
    value: T,
    set_value: (newV: T) => void,
    enqueueVariations: (variation: Partial<InputItem>[]) => void
    onClose: () => void
}

export interface PropEditor<T, V> {
    component: (props: PropEditorProps<T>) => any
    display: (v: T) => any
    convert: (v: T) => V
    interpolate: (left: V, right: V, weight: [number, number]) => V
}


export function addKeyFrame(seqId: string, rowId: string, value: any) {
    updateTheStore(s => {
        const seq = s.sequence[seqId]
        const row = s.sequenceRow[rowId]
        const newId = uId()
        s.sequenceKeyFrame[newId] = {
            id: newId,
            frame: Math.round(seq.playPosition),
            value
        }
        row.keyFrames.push(newId)
    })
}

export function deleteKeyFrame(rowId: string, kfId: string) {
    updateTheStore(s => {

        const row = s.sequenceRow[rowId]
        if (row.keyFrames.length > 1) {
            delete s.sequenceKeyFrame[kfId]
            row.keyFrames = row.keyFrames.filter(kf => kf !== kfId)
        }
    })
}

export function sortedKeyFrames(s: SequencesState, rowId: string, removeOverlap: boolean = true) {
    const row = s.sequenceRow[rowId]
    let lookup = s.sequenceKeyFrame;

    const start = Date.now()

    let sorted = _.sortBy(row.keyFrames.map(id => lookup[id]), k => k.frame);
    if (removeOverlap) {
        const compact = []
        let lastFrame = -1
        for (const k of sorted) {
            let thisFrame = k.frame;
            if (thisFrame != lastFrame) {
                lastFrame = thisFrame
                compact.push(k)
            }
        }
        return compact
    }
    const time = Date.now() - start

    return sorted
}

export function useSortedKeyFrames(rowId: string, removeOverlap: boolean = true) {
    return useTheStore(s => sortedKeyFrames(s, rowId, removeOverlap))
}


export function getRowValueForFrame<T, V>(frame: number, editor: PropEditor<T, V>, sortedFrames: SequenceKeyFrame[]): { value: V, leftFrame?: SequenceKeyFrame, onFrame?: SequenceKeyFrame, rightFrame?: SequenceKeyFrame } {
    frame = Math.floor(frame)
    const frameAIndex = _.findLastIndex(sortedFrames, f => f.frame <= frame)
    const frameA = sortedFrames[frameAIndex]
    if (!frameA) {
        return { value: editor.convert(sortedFrames[0].value as T), rightFrame: sortedFrames[0] }
    }
    if (frameA.frame === frame) {
        return {
            value: editor.convert(frameA.value as T),
            leftFrame: sortedFrames[frameAIndex - 1],
            onFrame: frameA,
            rightFrame: sortedFrames[frameAIndex + 1]
        }
    }
    const frameB = sortedFrames[frameAIndex + 1]
    if (frameB) {
        if (frameB.frame <= frame) {
            return { value: editor.convert(frameB.value as T), leftFrame: frameB }
        }


        return {
            value: editor.interpolate(editor.convert(frameA.value as T), editor.convert(frameB.value as T), [(frame - frameA.frame), (frameB.frame - frameA.frame)]),
            leftFrame: frameA,
            rightFrame: frameB
        }
    }
    return { value: editor.convert(frameA.value as T), leftFrame: frameA }
}

export default function SequenceEditor({ id, editors }: { id: string, editors: Lookup<PropEditor<any, any>> }) {
    const sequence = useTheStore(s => s.sequence[id])
    if (!sequence)
        return <></>
    const trackHeight = 20
    return <Flex minH={"100"}>
        <Left id={id} editors={editors} trackHeight={trackHeight}/>
        <Right seqId={id} editors={editors} trackHeight={trackHeight}/>
    </Flex>

}