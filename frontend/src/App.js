import './App.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import RootPage from "./pages/RootPage";
import HomePage from "./pages/Hompage";
import DirectCallPage from "./pages/DirectCallPage";
import {useState} from "react";
import {ConnectionContext} from "./store/ConnectionContext";

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

    const [connection, setConnection] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const connectionContextValue = {
        connection: connection,
        localStream: localStream,
        remoteStream: remoteStream,
        setConnection: setConnection,
        setLocalStream: setLocalStream,
        setRemoteStream: setRemoteStream
    }

    return (
        <ConnectionContext.Provider value={connectionContextValue}>
            <RouterProvider router={router}></RouterProvider>
        </ConnectionContext.Provider>


    );
}

export default App;
