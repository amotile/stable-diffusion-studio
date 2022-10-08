import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {addKeyFrame, getRowValueForFrame, useSortedKeyFrames} from "@features/sequence-editor/index";
import {editors} from "@features/app";
import _ from "lodash";
import {Box, Button, Flex, Icon} from "@chakra-ui/react";
import {HiChevronLeft, HiChevronRight} from "react-icons/hi";
import {SequenceKeyFrame} from "@features/sequence-editor/state";


function NavIcon({seqId, isLeft, frame}:{seqId:string, isLeft?:boolean, frame?: SequenceKeyFrame}){
    const real = isLeft?HiChevronLeft:HiChevronRight
    if(!frame)
        return <Icon as={real} color={"gray"}/>
    return <Icon as={real} color={"keyFrameWidget"} _hover={{color: 'keyFrameWidget_active'}} cursor={"pointer"} onClick={()=>updateTheStore(s=>s.sequence[seqId].playPosition = frame?.frame)}/>
}

export function KeyFrameWidget({seqId, rowId, suggestedValue}: { seqId: string, rowId: string, suggestedValue?: any }) {
    const sequence = useTheStore(s => s.sequence[seqId])
    const row = useTheStore(s => s.sequenceRow[rowId])
    let sorted = useSortedKeyFrames(rowId);
    let {value, leftFrame, rightFrame, onFrame} = getRowValueForFrame(sequence.playPosition, editors[row.type], sorted);

    function applyValueToKeyframe() {
        let v = suggestedValue !== undefined ? suggestedValue : value;
        if (!onFrame) {
            addKeyFrame(seqId, rowId, v)
        } else {
            updateTheStore(s=>s.sequenceKeyFrame[onFrame!!.id].value = v)
        }
    }

    const canApply = (suggestedValue !== undefined && !_.isEqual(suggestedValue, value)) ||
        (onFrame !== undefined && !_.isEqual(onFrame.value, value)) ||
    !onFrame || !onFrame && !rightFrame

    return <Flex alignItems={"center"}>

        <NavIcon seqId={seqId} isLeft={true} frame={leftFrame}/>
        <Box w={10 + 'px'} h={10 + 'px'} transform={"rotate(45deg) scale(0.7)"} bg={canApply ? 'keyFrameWidget' : "keyFrameWidget_inactive"}
             _hover={{border: canApply?"1px solid white":undefined}}
             cursor={canApply && 'pointer' || undefined}
             onClick={applyValueToKeyframe}
        ></Box>
        <NavIcon seqId={seqId} frame={rightFrame}/>
    </Flex>
}
