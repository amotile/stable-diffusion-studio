import {useLayoutEffect, useRef} from "react";
import {usePointerCapturing} from "./PointerCapturing";
import useRefAndState from "@features/utils/useRefAndState";

export enum MouseButton {
    Left = 0,
    Middle = 1,
}


type OnDragCallback = (totalX: number,
                       totalY: number,
                       event: MouseEvent,
) => void
type OnDragEndCallback = (didDrag: boolean, event?: MouseEvent) => void
type OnClickCallback = (mouseUpEvent: MouseEvent) => void


interface DragCallbacks {
    onDragEnd?: OnDragEndCallback
    onDrag: OnDragCallback
    onClick?: OnClickCallback

}

export interface UseDragOpts {
    disabled?: boolean
    lockPointer?: boolean
    buttons?: MouseButton[]
    onDragStart: (event: MouseEvent) => false | DragCallbacks
}

interface State_NotStarted {
    started: false
}

interface State_Started {
    started: true
    start: {
        x: number, y: number
    }
    detection: Detection_State_Detected | Detection_State_NotDetected
}

type State = State_Started | State_NotStarted

interface Detection_State_Detected {
    detected: true
    movement: {
        x: number, y: number
    }

}

interface Detection_State_NotDetected {
    detected: false
    distanceMoved: number
}


export default function useDrag(target: HTMLElement | null, opts: UseDragOpts): void {
    // storing this in a ref means we don't have to rerun the layout effect for every change.
    const optsRef = useRef<UseDragOpts>(opts)
    optsRef.current = opts

    const doLockPointer = opts.lockPointer // && !isSafari

    const {capturePointer} = usePointerCapturing("useDrag")

    useLayoutEffect(() => {
        if (!target)
            return

        let dragCallbacks: DragCallbacks = {
            onDrag: () => {
            }
        }
        let state: State = {
            started: false
        }


        function dragHandler(e: MouseEvent) {
            if (!state.started) return

            if (!state.detection.detected) {
                state.detection.distanceMoved += Math.abs(e.movementY) + Math.abs(e.movementX)

                if (state.detection.distanceMoved > 3) {
                    if (doLockPointer) {
                        target!!.requestPointerLock()
                    }

                    state.detection = {
                        detected: true,
                        movement: {x: 0, y: 0}
                    }
                }
            }

            if (state.detection.detected) {
                const {movement} = state.detection
                if (doLockPointer) {
                    // when locked, the pointer event screen position is going to be 0s, since the pointer can't move.
                    // So, we use the movement on the event
                    movement.x += e.movementX
                    movement.y += e.movementY
                } else {
                    const {start} = state
                    movement.x = e.screenX - start.x
                    movement.y = e.screenY - start.y
                }

                dragCallbacks.onDrag(
                    movement.x,
                    movement.y,
                    e,
                )
            }
        }

        function dragEndHandler(e: MouseEvent) {
            if (!state.started) return
            removeListeners()
            let didDrag = state.detection.detected;

            dragCallbacks.onDragEnd?.(didDrag)
            if (!didDrag)
                dragCallbacks.onClick?.(e)
            state = {started: false}

            if (doLockPointer)
                document.exitPointerLock()
        }


        const addListeners = () => {
            document.addEventListener('mousemove', dragHandler)
            document.addEventListener('mouseup', dragEndHandler)
        }

        const removeListeners = () => {
            // capturedPointerRef.current?.release()
            document.removeEventListener('mousemove', dragHandler)
            document.removeEventListener('mouseup', dragEndHandler)
        }

        function dragStartHandler(e: MouseEvent) {
            const opts = optsRef.current
            if (opts.disabled) return
            const allowedButtons: MouseButton[] = opts.buttons ?? [MouseButton.Left]

            if (!allowedButtons.includes(e.button)) return
            const onDragResponse = opts.onDragStart(e)
            if (!onDragResponse)
                return
            else dragCallbacks = onDragResponse
            e.preventDefault()
            e.stopPropagation()

            state = {
                started: true,
                start: {x: e.screenX, y: e.screenY},
                detection: {
                    detected: false,
                    distanceMoved: 0,
                },
            }
            addListeners()
        }

        function blockClick(e: MouseEvent) {
            const opts = optsRef.current
            if (opts.disabled) return
            e.stopPropagation()
        }


        target.addEventListener('mousedown', dragStartHandler)
        target.addEventListener('click', blockClick)

        return () => {
            removeListeners()
            target.removeEventListener('mousedown', dragStartHandler)
            target.removeEventListener('click', blockClick)

            if (state.started) {
                dragCallbacks.onDragEnd?.(state.detection.detected)
            }
        }
    }, [target])
}

export function useDragRef(opts: UseDragOpts){
    const [ref, node] = useRefAndState<HTMLDivElement|null>(null)
    useDrag(node, opts)
    return ref
}