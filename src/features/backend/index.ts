import {InputItem, ProcessingItem} from "@features/backend/shared-types";
import {Lookup} from "@features/app";
import _ from "lodash";


export type ConnectionStatus = 'idle' | 'connecting' | 'connected'
export interface Stats{
    queueDepth: number
    errors: number
}
type BackendParams = { server: string, remove: (id:string)=>void, store: (items: Lookup<ProcessingItem>) => void, statsChanged: (stats: Stats)=>void, getKnown: () => string[], setStatus: (status: ConnectionStatus) => void };


export interface BackendConnection {
    enqueue(items: InputItem[]): Promise<string[]>
    stop(): Promise<void>
    clear(): Promise<void>
    collectImages(images: String[]) :Promise<void>
}

export function backendConnection({
                                      server,
                                      store,
                                      remove,
                                      setStatus,
                                      getKnown,
                                      statsChanged
                                  }: BackendParams): BackendConnection {
    const httpUrl = 'http://' + server + ':4000'
    const socketUrl = 'ws://' + server + ':4001'

    let ws: WebSocket | undefined = undefined
    let timeout = 0

    function connect() {
        if(ws)
            return
        ws = new WebSocket(socketUrl)
        setStatus("connecting")

        ws.onerror = ()=>{
            // console.log("error")
        }

        ws.onopen = () => {
            subscribe(getKnown())
            setStatus("connected")
        }
        ws.onclose = () => {
            ws= undefined
            console.log("close", timeout)
            setStatus("idle");
            setTimeout(connect, timeout)
            if(timeout < 60000)
            timeout+=1000
        }

        ws.onmessage = (event) => {
            let message = JSON.parse(event.data);
            if (message.items) {
                store(message.items)
            } else if (message.stats){
                statsChanged(message.stats)
            } else if (message.removed){
                remove(message.removed)
            }
        }
    }
    connect()


    function subscribe(ids: string[]) {
        ws?.send(JSON.stringify({subscribe: ids}))
    }

    return {
        async stop() {
            await fetch(httpUrl + '/stop');
        },
        async clear() {
            await fetch(httpUrl + '/clear');
        },
        async enqueue(items: InputItem[]) {
            let response = await fetch(httpUrl + '/enqueue', {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify(items)
            });
            let processingItems = await response.json() as ProcessingItem[]
            store(_.keyBy(processingItems, 'id'))
            let ids = processingItems.map(i => i.id);
            await subscribe(ids)
            return ids
        },
        async collectImages(images: String[]) {
            let response = await fetch(httpUrl + '/collectImages', {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify(images)
            });
        },
    }
}