import {updateTheStore, useTheStore} from "@features/app/mainStore";
import _ from "lodash";
import {Box, Flex} from "@chakra-ui/react";
import {getRowValueForFrame, PropEditor, useSortedKeyFrames} from "@features/sequence-editor";
import {Lookup} from "@features/app";
import {KeyFrameWidget} from "@features/sequence-editor/KeyFrameWidget";
import {FaPlay} from "react-icons/fa";

function SequenceRowHeaderView({seqId, id, editors}: { seqId: string, id: string, editors: Lookup<PropEditor<any,any>> }) {
    const row = useTheStore(s => s.sequenceRow[id])
    const playPosition = useTheStore(s => s.sequence[seqId].playPosition)
    let sortedFrames = useSortedKeyFrames(id)
    const editor = editors[row.type]
    const {value} = getRowValueForFrame(playPosition, editor, sortedFrames)
    return <Flex h={8} minW={200 + 'px'} px={1}>
        <Flex flex={1} gap={2} alignItems={"center"} mr={2}>
            <KeyFrameWidget seqId={seqId} rowId={row.id}/>
            <Box flex={1}>{row.label}</Box>
            <Box>{editor.display(value)}</Box>
        </Flex>
    </Flex>
}


let isPlaying = false
let frameCounter = 0
let lastTime = 0


const speed = 1000/12

function step(timestamp: number) {
    if (lastTime) {
        const diff = timestamp - lastTime
        frameCounter+= diff
        while(frameCounter>speed){
            updateTheStore(s => {
                let sequence = s.sequence[s.currentSequence||''];
                if(sequence)
                    sequence.playPosition +=0.1
                let maxFrames = s.playback.potentialFrames[s.currentSequence||'']?.length || 0;
                if(sequence.playPosition > maxFrames)
                    sequence.playPosition = 0
            })
            console.log(speed)
            frameCounter-=speed
        }
    }

    lastTime = timestamp
    requestAnimationFrame(step)
}

// requestAnimationFrame(step)


export function Left({
                         trackHeight,
                         id,
                         editors
                     }: { id: string, editors: Lookup<PropEditor<any,any>>, trackHeight: number }) {
    const rows = useTheStore(s => s.sequence[id].rows)
    return <Flex direction={"column"} bg={"dope_left"}>
        <Box h={trackHeight + "px"}>
            {/*<FaPlay onClick={() => isPlaying = true}/>*/}
        </Box>
        {rows.map(r => <SequenceRowHeaderView key={r} seqId={id} id={r} editors={editors}/>)}

    </Flex>


}