import {InputItem} from "@features/backend/shared-types";
import {useTheStore} from "@features/app/mainStore";
import {
    Box, ButtonGroup, Divider,
    Flex, Icon, IconButton,
    Popover,
    PopoverArrow, PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Portal,
    Tag,
    useDisclosure
} from "@chakra-ui/react";
import {useRef, useState} from "react";
import {editors} from "@features/app";
import {randomSeed} from "@features/prop-editors/SeedEditor";
import {KeyFrameWidget} from "@features/sequence-editor/KeyFrameWidget";
import {IoDiceOutline, IoFlask} from "react-icons/io5";

export function FieldEditor({enqueueVariations, label, value, seqId, rowId}:  {label: string, seqId: string, rowId :string, value: any, enqueueVariations: (variations: Partial<InputItem>[])=>void}){
    const row = useTheStore(s=>s.sequenceRow[rowId])
    const {isOpen, onToggle, onClose} = useDisclosure()
    const [tmpValue, set_tmpValue] = useState(value)
    const valueRef = useRef(value)
    const editor = editors[row.type]
    const Editor = editor.component

    function set_theValue(newV:any) {
        set_tmpValue(newV)
        valueRef.current = newV
    }

    function enqueueVariation(){
        enqueueVariations([{[row.key as keyof InputItem]: valueRef.current}])
    }
    function enqueueVariationRandomSeed(){
        let variation :Partial<InputItem> = {
            seed: randomSeed(),
        };
        if(row.key !== 'seed')
            variation[row.key as keyof InputItem] = valueRef.current
        enqueueVariations([variation])
    }
    return <Flex alignItems={"center"} gap={2}>
        {<KeyFrameWidget suggestedValue={value} seqId={seqId}
                         rowId={rowId}/>}

        <Flex flex={1} gap={1}>
            <Box w={80 + 'px'}>{label}</Box>
            <Box flex={1}>

                <Popover isOpen={isOpen} onClose={onClose} variant={"responsive"} placement={"top"}>
                    <PopoverTrigger>
                        <Tag cursor={"pointer"} onClick={()=>{onToggle(); set_theValue(value)}}> {value} </Tag>
                    </PopoverTrigger>
                    <Portal>
                        <PopoverContent>
                            <PopoverArrow/>
                            <PopoverBody >
                                <Flex alignItems={"center"} gap={5}>

                                    <Box flex={1}>{row.label}</Box>
                                    <ButtonGroup isAttached variant={"outline"}>
                                        <IconButton icon={<Icon as={IoFlask}/>} onClick={enqueueVariation} aria-label="" />
                                        <IconButton icon={<Icon as={IoDiceOutline}/>} onClick={enqueueVariationRandomSeed} aria-label=""/>
                                        {/*<IconButton icon={<Icon as={IoFlask}/>} onClick={triggerInWorkshop} aria-label="" />*/}
                                    </ButtonGroup>
                                </Flex>
                                <Divider my={2}/>
                                <Editor
                                    enqueueVariations={enqueueVariations}
                                    onClose={enqueueVariation}
                                    value={tmpValue}
                                    set_value={(newV) => set_theValue(newV)}/>
                            </PopoverBody>
                        </PopoverContent>
                    </Portal>
                </Popover>
            </Box>


        </Flex>

    </Flex>


}
