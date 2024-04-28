import {createContext} from "react";

export const ConnectionContext = createContext({
    connection: null,
    localStream: null,
    remoteStream: null,
    setConnection: () => {
    },
    setLocalStream: () => {
    },
    setRemoteStream: () => {
    },

});