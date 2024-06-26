import './App.scss';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import RootPage from "./pages/RootPage";
import HomePage from "./pages/Hompage";
import DirectCallPage from "./pages/DirectCallPage";
import {useEffect, useState} from "react";
import {ConnectionContext} from "./store/ConnectionContext";
import {socket, SocketContext} from "./store/SocketContext";
import {CallContext} from "./store/CallContext";
import {ThemeContext} from "./store/ThemeContext";
import {CallStatus} from "./common/call-status";
import {MyTheme} from "./common/my-theme";

const router = createBrowserRouter([
        {
            path: '/', element: <RootPage/>, children: [
                {path: '', element: <HomePage/>},
                {path: 'call', element: <DirectCallPage/>},
            ]
        }
    ]
)

function App() {

    const [theme, setTheme] = useState(MyTheme.LIGHT);
    const [connection, setConnection] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [myId, setMyId] = useState("");
    const [callStatus, setCallStatus] = useState(CallStatus.NEW); //new, incoming, calling, on, end,
    const [call, setCall] = useState({
        me: "",
        remote: "",
        offer: null
    });

    useEffect(() => {
        socket.on("me", (id) => {
            console.log(id)
            setMyId(id);
        });

    }, []);

    useEffect(() => {
        socket.on("receiveCall", async (data) => {
            console.log(`receiving a call from ${data.from}`);
            // console.log(data.offer);
            setCall({
                remote: data.from,
                offer: data.offer,
                me: myId
            });

            setCallStatus(CallStatus.INCOMING);
        })
    }, []);

    useEffect(() => {
        // callContext.setStatus(CallStatus.ON_CALL)
        const webcamWidth = 720;
        const webcamHeight = 320;
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: {ideal: webcamWidth},
                height: {ideal: webcamHeight}
            },
            frameRate: 30,
        }).then(
            s => {
                // console.log(s);
                setLocalStream(s);
            }
        );
    }, []);

    function toggleTheme() {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    const themeContextValue = {
        theme: theme,
        toggleTheme: toggleTheme
    }

    const myIdContextValue = {
        myId: myId,
        setMyId: setMyId
    }

    const callContextValue = {
        status: callStatus,
        call: call,
        setStatus: setCallStatus,
        setCall: setCall,
    }

    const connectionContextValue = {
        connection: connection,
        localStream: localStream,
        remoteStream: remoteStream,
        setConnection: setConnection,
        setLocalStream: setLocalStream,
        setRemoteStream: setRemoteStream
    }

    return (
        <ThemeContext.Provider value={themeContextValue}>
            <SocketContext.Provider value={myIdContextValue}>
                <CallContext.Provider value={callContextValue}>
                    <ConnectionContext.Provider value={connectionContextValue}>
                        <RouterProvider router={router}></RouterProvider>
                    </ConnectionContext.Provider>
                </CallContext.Provider>
            </SocketContext.Provider>
        </ThemeContext.Provider>
    );
}

export default App;
