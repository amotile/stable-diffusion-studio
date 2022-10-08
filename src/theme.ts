import {extendTheme, ThemeConfig} from "@chakra-ui/react";

const config :ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,

}

const theme = extendTheme({
    config,
    colors: {
        "keyFrameWidget": "#efd733",
        "keyFrameWidget_active": "#ffed9a",
        "keyFrameWidget_inactive": "#818181",
        "dope_top": "#282832",
        "dope_left": "#282832",
        "dope_right": "#212328",
        "dope_track": "#191919",


        "pagebg" : "#171717",
        "itembg" : "rgb(255,255,255,0.05)",
        "selectionborder" : "rgba(100,225,255,1)"
    },
    components: {
        Popover: {
            variants: {
                responsive: {
                    content: { width: "unset" },
                },
            },
        },
    }
})
export default theme
