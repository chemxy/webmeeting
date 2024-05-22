import {createContext} from "react";

export const CallContext = createContext({
    status: "",
    call: {
        me: "",
        remote: "",
        offer: null
    },
    setStatus: () => {
    },
    setCall: () => {
    }
})