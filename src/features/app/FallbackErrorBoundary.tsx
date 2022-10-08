import React, {ErrorInfo} from "react";
import {Button, Flex} from "@chakra-ui/react";

export class FallbackErrorBoundary extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error:any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error:Error, errorInfo:ErrorInfo) {
        // You can also log the error to an error reporting service
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <Flex justifyContent={"center"} gap={3} mt={100}><h1>Something went wrong. <Button onClick={()=>{
                localStorage.setItem("stored", "{}")
                location.reload();
            }
            }>Clear local_storage and reload</Button> it might help</h1></Flex>;
        }

        return this.props.children;
    }
}