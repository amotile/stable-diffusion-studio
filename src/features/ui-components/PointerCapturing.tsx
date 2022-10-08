import React, {useContext, useEffect, useMemo} from 'react'

export type CapturedPointer = {
    release(): void
    isCapturing(): boolean
}

export type PointerCapturing = {
    isPointerBeingCaptured(): boolean
    capturePointer(debugReason: string): CapturedPointer
}

type InternalPointerCapturing = {
    capturing: PointerCapturing
    forceRelease(): void
}

type PointerCapturingFn = (forDebugName: string) => InternalPointerCapturing

function _usePointerCapturingContext(): PointerCapturingFn {
    type CaptureInfo = {
        debugOwnerName: string
        debugReason: string
    }
    let currentCaptureRef = React.useRef<null | CaptureInfo>(null)
    const isPointerBeingCaptured = () => currentCaptureRef.current != null

    return (forDebugName) => {
        /** keep track of the captures being made by this user of {@link usePointerCapturing} */
        let localCapture: CaptureInfo | null
        const updateCapture = (to: CaptureInfo | null): CaptureInfo | null => {
            localCapture = to
            currentCaptureRef.current = to
            return to
        }
        const capturing: PointerCapturing = {
            capturePointer(reason) {
                if (currentCaptureRef.current != null) {
                    throw new Error(
                        `"${forDebugName}" attempted capturing pointer for "${reason}" while already captured by "${currentCaptureRef.current.debugOwnerName}" for "${currentCaptureRef.current.debugReason}"`,
                    )
                }

                const releaseCapture = updateCapture({
                    debugOwnerName: forDebugName,
                    debugReason: reason,
                })

                return {
                    isCapturing() {
                        return releaseCapture === currentCaptureRef.current
                    },
                    release() {
                        if (releaseCapture === currentCaptureRef.current) {
                            updateCapture(null)
                            return true
                        }
                        return false
                    },
                }
            },
            isPointerBeingCaptured,
        }

        return {
            capturing,
            forceRelease() {
                if (localCapture && currentCaptureRef.current === localCapture) {
                    updateCapture(null)
                }
            },
        }
    }
}

const PointerCapturingContext = React.createContext<PointerCapturingFn>(
    null as any,
)

const ProviderChildrenMemo: (props: any)=>any = React.memo(({children}) => (
    <>{children}</>
))

export function ProvidePointerCapturing(props: {
    children?: React.ReactNode
}): React.ReactElement {
    const ctx = _usePointerCapturingContext()
    return (
        <PointerCapturingContext.Provider value={ctx}>
            <ProviderChildrenMemo children={props.children} />
        </PointerCapturingContext.Provider>
    )
}

export function usePointerCapturing(forDebugName: string): PointerCapturing {
    const pointerCapturingFn = useContext(PointerCapturingContext)
    const control = useMemo(() => {
        return pointerCapturingFn(forDebugName)
    }, [forDebugName, pointerCapturingFn])

    useEffect(() => {
        return () => {
            // force release on unmount
            control.forceRelease()
        }
    }, [control])

    return control.capturing
}