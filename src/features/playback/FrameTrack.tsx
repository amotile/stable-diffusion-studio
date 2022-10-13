import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {memo} from "react";
import {Flex} from "@chakra-ui/react";
import {ProcessingItemView} from "@features/generation/GenerationItemView";

export const FrameTrack = memo(({seqId}: { seqId: string }) => {
    let potentialFrames = useTheStore(s => s.playback.potentialFrames[seqId] || []);

    return <Flex gap={0} overflow={"auto"} bg={"rgb(0,0,0, 0.3)"}>
        {potentialFrames.map((pot, i) => {
            return <Flex cursor={"pointer"}
                         onMouseOver={()=>updateTheStore(s=>s.playback.hovered = pot.id)}
                         onMouseOut={()=>updateTheStore(s=>s.playback.hovered = undefined)}
                         onClick={()=>updateTheStore(s=>s.sequence[s.currentSequence!].playPosition = i)}
                         borderBottom={pot.keyFrames||0>0?"2px solid #30B3A6":undefined}
                         key={i} w={64 + 'px'} h={64 +2 + 'px'} bg={"rgb(0,0,0, 0.1)"} flexShrink={0}
                         justifyContent={"center"} alignItems={"center"}>
                <ProcessingItemView pot={pot}/>
            </Flex>
        })}
    </Flex>
})