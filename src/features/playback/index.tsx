import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {Flex} from "@chakra-ui/react";
import {getRowValueForFrame, sortedKeyFrames} from "@features/sequence-editor";
import _ from "lodash";
import {doLookup, editors, Lookup} from "@features/app";
import {generateFrameId, PotentialFrame, useGeneration} from "@features/generation";
import {InputItem} from "@features/backend/shared-types";
import {ProcessingItemView} from "@features/generation/GenerationItemView";
import {PotentialFramesTools} from "@features/playback/PotentialFramesTools";
import {FrameTrack} from "@features/playback/FrameTrack";


export const x2imageDefaults: any = {
    type: "txt2img",
    prompt: 'fantasy landscape',
    cfg: '7',
    width: 512,
    height: 512,
    sampler: "LMS",
    seed: "1",
    steps: 15,
    tiling: false
}

export function createPotentialFrame(sequenceId: string, frame: number, variation: Partial<InputItem>): PotentialFrame {
    const s = useTheStore.getState()
    const rows = doLookup(s.sequence[sequenceId].rows, s.sequenceRow)
    const sortedFrameForRows = rows.map(row => sortedKeyFrames(s, row.id))
    const genInput = { ...x2imageDefaults }

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const sortedFrames = sortedFrameForRows[i];
        let { value } = getRowValueForFrame(frame, editors[row.type], sortedFrames);
        genInput[row.key] = value
    }

    Object.assign(genInput, variation)

    const id = generateFrameId(genInput)

    return { id, input: genInput }
}

const calculateFrames = _.debounce(() => {

    updateTheStore(s => {
            for (const key of Object.keys(s.sequence)) {
                const rows = doLookup(s.sequence[key].rows, s.sequenceRow)

                const sortedFrameForRows = rows.map(row => sortedKeyFrames(s, row.id))

                const maxFrame = _.max(sortedFrameForRows.map(r => _.last(r)?.frame)) || 0
                const genFrames: PotentialFrame[] = []
                for (let currentFrame = 0; currentFrame <= maxFrame; currentFrame++) {
                    // console.log("Frame,", currentFrame)
                    const genInput = { ...x2imageDefaults }

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const sortedFrames = sortedFrameForRows[i];
                        let { value } = getRowValueForFrame(currentFrame, editors[row.type], sortedFrames);
                        genInput[row.key] = value
                    }

                    const id = generateFrameId(genInput)

                    genFrames.push({
                        id,
                        input: genInput
                    })
                }
                s.playback.potentialFrames[key] = genFrames
            }
        }
    )
}, 500, { leading: false })


useTheStore.subscribe((s, prev) => {
    if (s.sequenceKeyFrame !== prev.sequenceKeyFrame) {
        calculateFrames()
    }
})


export function FrameViewer({ seqId }: { seqId: string }) {
    let { enqueue } = useGeneration();
    // return <Box flex={1}>FrameViewer</Box>
    let playPos = useTheStore(s => s.sequence[seqId].playPosition);
    let potentialFrames = useTheStore(s => s.playback.potentialFrames[seqId] || []);
    let potentialToProcessing = useTheStore(s => s.potentialToProcessing);
    let processingItem = useTheStore(s => s.processingItem);
    let hovered = useTheStore(s => s.processingItem[s.potentialToProcessing[s.playback.hovered||'']]);


    let a = _.findLastIndex(potentialFrames, f => !!processingItem[potentialToProcessing[f.id]]?.output, Math.floor(playPos))
    let b = _.findIndex(potentialFrames, f => !!processingItem[potentialToProcessing[f.id]]?.output, Math.floor(playPos))

    let focusFrame = potentialFrames[a < 0 ? b : a]
    if (a >= 0 && b >= 0) {
        if (playPos - a < b - playPos + 1)
            focusFrame = potentialFrames[a]
        else
            focusFrame = potentialFrames[b]
    }
    if(hovered?.output)
        focusFrame = hovered


    return <Flex flex={1} direction={"column"}>
        <Flex flex={1}>
            <Flex style={{ width: 512, height: 512 }} bg={"rgb(0,0,0, 0.1)"} justifyContent={"center"}
                  alignItems={"center"}>
                {focusFrame && <ProcessingItemView pot={focusFrame}/>}
            </Flex>
            <PotentialFramesTools seqId={seqId}/>
        </Flex>
        <FrameTrack seqId={seqId}/>

    </Flex>
}