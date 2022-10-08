import React from 'react'
import ReactDOM from 'react-dom/client';
import reportWebVitals from "./reportWebVitals";
import "./index.css";

import App from '@features/app';
import {ChakraProvider, ColorModeScript} from "@chakra-ui/react";
import theme from './theme'
import {ProvidePointerCapturing} from "@features/ui-components/PointerCapturing";
import {FallbackErrorBoundary} from "@features/app/FallbackErrorBoundary";




const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
)
root.render(
    <React.StrictMode>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider theme={theme}>
            <ProvidePointerCapturing>
                <FallbackErrorBoundary>
                <App/>
                </FallbackErrorBoundary>
            </ProvidePointerCapturing>
        </ChakraProvider>
    </React.StrictMode>
)

reportWebVitals();


