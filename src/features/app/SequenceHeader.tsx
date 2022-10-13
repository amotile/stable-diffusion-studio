import {editors, Lookup} from "@features/app/index";
import {getRowValueForFrame, PropEditor, useSortedKeyFrames} from "@features/sequence-editor";
import {useTheStore} from "@features/app/mainStore";
import {Box, Flex} from "@chakra-ui/react";

function OneRow({id, prefix, type, rowKey, editors}:{id:string, editors: Lookup<PropEditor<any,any>>, type:string, rowKey?: string ,prefix?:string }){
    const sequence = useTheStore(s=>s.sequence[id]);
    const frame = useTheStore(s=>s.sequence[id].playPosition);
    const rowId = useTheStore(s=>{
        return sequence.rows.find(r => s.sequenceRow[r].key ===(rowKey || type))
    });
    if(!rowId){
        return <div></div>
    }
    let sortedFrames = useSortedKeyFrames(rowId, true);
    let {value} = getRowValueForFrame(frame, editors[type], sortedFrames);
    if(value === ""){
        return <></>
    }
    return <div>{prefix}{value}</div>
}

export function SequenceHeader({id, editors}:{id:string, editors: Lookup<PropEditor<any, any>> }){
    // const frame = useTheStore(s=>s.sequence[id].playPosition);
    return <Flex p={2}  bg={"dope_top"} direction={"column"} gap={1}>
        {/*{frame.toFixed(1)}*/}
        <OneRow id={id} editors={editors} type={'prompt'}/>
        <OneRow id={id} editors={editors} type={'prompt'} rowKey={"negativePrompt"} prefix={"- "}/>
        <OneRow id={id} editors={editors} type={'seed'}/>
    </Flex>
}