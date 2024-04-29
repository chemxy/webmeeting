import {createContext} from "react";

export const CallContext = createContext({
    status: "",
    call: {
        from: "",
        to: "",
        offer: null
    },
    setStatus: () => {
    },
    setCall: () => {
    }
})