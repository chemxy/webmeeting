import {useEffect, useRef, useState} from "react";
import './css/DirectCallPage.css';
import io from "socket.io-client"

const socket = io.connect('http://localhost:5000')

export default function DirectCallPage() {

    const myVideo = useRef(null);
    const otherVideo = useRef(null);
    const [localStream, setLocalStream] = useState(null);

    const [connection, setConnetion] = useState(null);

    const [callStatus, setCallStatus] = useState("new"); //new, incoming, calling, on, end,
    const [myId, setMyId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isCameraOpen, setCameraOpen] = useState(false);

    const [call, setCall] = useState({
        name: "",
        from: "",
        signal: "",
        to: "",
    })

    useEffect(() => {
        //get my session id
        socket.on("me", (id) => {
            setMyId(id);
        });

        //wait for a call
        socket.on("callUser", (data) => {
            console.log(`receiving a call from`);
            console.log(data.signal);
            setCallStatus("incoming");
            setCall({
                ...call,
                name: data.name,
                from: data.from,
                signal: data.signal
            });
        });

    }, [])

    // Function to create an RTCPeerConnection object
    function createPeerConnection() {
        console.log("creating peer connection")
        const config = {
            iceServers: [
                {urls: "stun:stun.l.google.com:19302"} // Using Google's public STUN server
            ]
        };
        return new RTCPeerConnection(config);
    }

    async function openCamera() {
        try {
            const constraints = {
                audio: true,
                video: true
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log(stream);
            myVideo.current.srcObject = stream;
            stream.getTracks().forEach(track => connection.addTrack(track, stream));
            setCameraOpen(true);
            setLocalStream(stream);
        } catch (error) {
            console.log(error);
            setErrorMessage(`getUserMedia error: ${error.name}`, error);
        }
    }

    async function callUser(event) {
        event.preventDefault();
        console.log("making a new call");
        //get receiver's id
        const fd = new FormData(event.target);
        const toUser = fd.get("to");
        console.log("to user: " + toUser);

        // Create peer connection
        let peerConnection = createPeerConnection();

        peerConnection.ontrack = e => otherVideo.current.srcObject = e.streams[0];

        // Get media stream
        // const localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
        // console.log(localStream);
        // setLocalStream(localStream);
        // myVideo.current.srcObject = localStream;
        // localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Create offer
        const offer = await peerConnection.createOffer();
        console.log(offer);
        await peerConnection.setLocalDescription(offer);
        console.log(peerConnection);
        setConnetion(peerConnection);

        // Send offer to the other peer
        socket.emit("callUser", {
            userToCall: toUser,
            signalData: peerConnection.localDescription,
            from: myId,
            name: call.name
        })
        setCall({
            ...call,
            to: toUser,
        })

        setCallStatus("calling");

        //wait for the other peer to accept the call
        socket.on("callAccepted", (signal) => {
            setCallStatus("on");
            // openCamera(peerConnection);
            // myVideo.current.srcObject = localStream;
            console.log(signal);
            peerConnection.setRemoteDescription(signal);
            setConnetion(peerConnection);
        })
    }

    async function acceptCall() {
        setCallStatus("accepted");

        let peerConnection = createPeerConnection();

        peerConnection.ontrack = e => otherVideo.current.srcObject = e.streams[0];

        await peerConnection.setRemoteDescription(call.signal);

        // Get media stream
        // const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
        // console.log(stream);
        // setLocalStream(stream);
        // myVideo.current.srcObject = localStream;
        // stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        // myVideo.current.srcObject = localStream;

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        setConnetion(peerConnection);
        console.log(answer);
        socket.emit("answerCall", {signal: answer, to: call.from})

        setCallStatus("on");

        // openCamera();
    }

    function hangUpCall() {
        console.log("hanging up a call");
        setCallStatus(true);
    }

    switch (callStatus) {
        case "new":
            return (
                <div className="col input-call-id">
                    <div className="row">
                        my id: {myId}
                    </div>
                    <div className="row ">
                        <form onSubmit={(e) => callUser(e)}>
                            <div className="col">
                                <div className="row">
                                    <label>ID</label>
                                </div>
                                <div className="row">
                                    <input type="text" name="to"/>
                                </div>
                                <div className="row">
                                    <button type="submit" className="text-capitalize">call</button>
                                </div>
                            </div>

                        </form>

                    </div>
                </div>
            );
        case "on":
            return (
                <div>
                    <div className="camera-wrapper">
                        <div className="flex-column">
                            <div>
                                <video autoPlay playsInline ref={myVideo}></video>
                            </div>
                            <div>
                                <video autoPlay playsInline ref={otherVideo}></video>
                            </div>
                        </div>

                        <button disabled={isCameraOpen} onClick={(e) => openCamera(e)}>Open camera</button>

                        <div>{errorMessage}</div>
                    </div>
                    <div>
                        <button onClick={hangUpCall} className="text-capitalize">end call</button>
                    </div>
                </div>
            );
        case "incoming":
            return (
                <div>
                    <div>
                        receiving incoming call from: {call.from}
                    </div>
                    <div>
                        <button onClick={acceptCall}>Answer</button>
                    </div>
                </div>
            )
        case "calling":
            return (
                <div>
                    calling: {call.to}
                </div>
            )
    }

}