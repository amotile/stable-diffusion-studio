import {Box, Flex, Icon, IconButton, Tag} from "@chakra-ui/react";
import React from "react";
import {useTheStore} from "@features/app/mainStore";
import {BiBrain} from "react-icons/bi";
import {FaBroom, FaHourglass, FaStop} from "react-icons/fa";
import {VscDebugDisconnect} from "react-icons/vsc";
import {useGeneration} from "@features/generation";

export function ConnectionBox() {
    const queueDepth = useTheStore(s => s.processingStats.queueDepth)
    const errors = useTheStore(s => s.processingStats.errors)
    let {status, stop, clear} = useGeneration();
    let icon = <VscDebugDisconnect/>
    if (status === 'connected')
        icon = <BiBrain/>
    else if (status === 'connecting')
        icon = <FaHourglass/>
    return <Flex position={"absolute"} right={0} top={0} alignItems={"center"} gap={2} p={2}>
        {status === 'connected' && <>
            {queueDepth > 0 && <IconButton onClick={stop} size={"xs"} aria-label={"stop"} icon={<Icon as={FaStop}/>}/>}
            <Tag>{queueDepth}</Tag>
            {errors > 0 && <>
                <Tag color={"red"}>{errors}</Tag>
                <IconButton onClick={clear} size={"xs"} aria-label={"clear"} icon={<Icon as={FaBroom}/>}/>
            </>}
        </>}
        <Box>{icon}</Box>
    </Flex>
}