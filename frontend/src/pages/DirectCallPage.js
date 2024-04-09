import {useEffect, useRef, useState} from "react";
import './css/DirectCallPage.css';
import io from "socket.io-client"

const socket = io.connect('http://localhost:5000')

export default function DirectCallPage() {

    const myVideo = useRef(null);
    const [callStatus, setCallStatus] = useState("new"); //new, incoming, accepted, on, end,
    const [myId, setMyId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isCameraOpen, setCameraOpen] = useState(false);

    const [call, setCall] = useState({
        name: "",
        from: "",
        signal: ""
    })

    useEffect(() => {
        //get my session id
        socket.on("me", (id) => {
            setMyId(id);
        });

        //wait for a call
        socket.on("callUser", (data) => {
            setCallStatus("incoming");
            setCall({
                name: data.name,
                from: data.from,
                signal: data.signal
            });
        });

    }, [])

    async function openCamera() {
        try {
            const constraints = {
                audio: true,
                video: true
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log(stream);
            myVideo.current.srcObject = stream;
            setCameraOpen(true);
        } catch (error) {
            setErrorMessage(`getUserMedia error: ${error.name}`, error);
        }
    }

    function callUser() {
        console.log("making a new call");

        setCallStatus(false);
    }

    function acceptCall() {

    }

    function hangUpCall() {
        console.log("hanging up a call");
        setCallStatus(true);
    }

    if (callStatus) {
        return (
            <div className="col input-call-id">
                <div>
                    {myId}
                </div>
                <div className="row ">
                    <label htmlFor="">ID</label>
                    <input type="text"/>
                </div>
                <div className="row">
                    <button onClick={callUser} className="text-capitalize">call</button>
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <div className="camera-wrapper">
                    <video autoPlay playsInline ref={myVideo}></video>
                    <button disabled={isCameraOpen} onClick={(e) => openCamera(e)}>Open camera</button>

                    <div>{errorMessage}</div>
                </div>
                <div>
                    <button onClick={hangUpCall} className="text-capitalize">end call</button>
                </div>
            </div>
        );
    }

}