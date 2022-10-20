import {useTheStore} from "@features/app/mainStore";
import {PotentialFrame, useGeneration} from "@features/generation/index";
import {Button, CircularProgress, Tooltip} from "@chakra-ui/react";
import {BiBrain} from "react-icons/bi";
import {FaHourglass} from "react-icons/fa";
import {VscWarning} from "react-icons/vsc";

const HTTP_URL = String(process.env.REACT_APP_HTTP_URL)

export function ProcessingItemView({pot}: { pot:PotentialFrame }) {
    let {enqueue} = useGeneration();
    let item = useTheStore(s => s.processingItem[s.potentialToProcessing[pot.id]])
    let content: any = <Button onClick={() => enqueue([pot])}><BiBrain/></Button>
    if (item) {
        if (item.processing)
            content = <CircularProgress isIndeterminate size='40px'/>
        else if (item.error)
            content = <Tooltip label={item.error} hasArrow>
                <span><VscWarning/></span>
            </Tooltip>
        else if (item.output)
            content = <img src={HTTP_URL+'/image/' + item.output?.result}/>
        else
            content = <FaHourglass/>
    }
    return <>{content}</>
}
