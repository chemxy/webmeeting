import {useContext, useEffect, useRef, useState} from "react";
import './css/DirectCallPage.css';
import io from "socket.io-client"
import {ConnectionContext} from "../store/ConnectionContext";

const socket = io.connect('http://localhost:5000')

export default function DirectCallPage() {

    const myVideo = useRef(null);
    const remoteVideo = useRef(null);
    const localStream = useRef(null);
    const remoteStream = useRef(null);
    const connection = useRef(null);


    const [callStatus, setCallStatus] = useState("new"); //new, incoming, calling, on, end,
    const [myId, setMyId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isCameraOpen, setCameraOpen] = useState(false);

    const [call, setCall] = useState({
        from: "",
        offer: "",
        to: "",
    })

    useEffect(() => {
        //get my session id
        socket.on("me", (id) => {
            setMyId(id);
        });

        //wait for a call
        socket.on("receiveCall", async (data) => {
            console.log(`receiving a call from ${data.from}`);
            // console.log(data.offer);
            setCall({
                from: data.from,
                offer: data.offer,
                to: myId
            });
            // console.log(call);

            // connection.current = createPeerConnection();
            // // console.log(call.offer);
            // console.log("setting remote desc");
            // await connection.current.setRemoteDescription(data.offer);
            //
            //
            // socket.on('ice-candidate', async (data) => {
            //     console.log("adding candidate")
            //     await connection.current.addIceCandidate(new RTCIceCandidate(data));
            // });

            setCallStatus("incoming");
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
        const peerConnection = new RTCPeerConnection(config);

        peerConnection.ontrack = async (e) => {
            console.log("remote stream");
            console.log(e);
            // setRemoteStream(e.streams[0]);
            remoteStream.current = e.streams[0];
            console.log(remoteStream.current);
            console.log(remoteStream.current.getTracks());
        };

        return peerConnection;
    }

    async function openCamera() {
        myVideo.current.srcObject = localStream.current;
        remoteVideo.current.srcObject = remoteStream.current;
        console.log(myVideo.current.srcObject);
        console.log(myVideo.current.srcObject.getTracks());
        console.log(remoteVideo.current.srcObject);
        console.log(remoteVideo.current.srcObject.getTracks());
        setCameraOpen(true);
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

        peerConnection.onicecandidate = event => {
            console.log("onicecandidate")
            if (event.candidate) {
                console.log("sending candidate from caller to " + toUser)
                socket.emit('ice-candidate', {to: toUser, message: event.candidate});
            }
        };

        socket.on('ice-candidate', async (data) => {
            console.log("adding candidate")
            await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        });

        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        console.log("local stream");
        console.log(stream);
        console.log(stream.getTracks());
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        localStream.current = stream;

        // Create offer
        console.log("creating offer");
        const offer = await peerConnection.createOffer();
        console.log(offer);

        // Send offer to the other peer
        socket.emit("callUser", {
            userToCall: toUser,
            offer: offer,
            from: myId,
        })

        console.log("setting local desc");
        await peerConnection.setLocalDescription(offer);
        // console.log(peerConnection);

        setCallStatus("calling");
        // setLocalStream(stream);

        //wait for the other peer to accept the call
        socket.on("callAccepted", (data) => {

            // openCamera(peerConnection);
            // myVideo.current.srcObject = localStream;
            console.log("accepting call")
            console.log(data.answer);
            console.log("setting remote desc");
            peerConnection.setRemoteDescription(data.answer);

            // setConnetion(peerConnection);
            setCallStatus("on");
        })

        setCall({
            from: myId,
            offer: offer,
            to: toUser,
        })
    }

    async function answerCall() {

        connection.current = createPeerConnection();
        // console.log(call.offer);
        console.log("setting remote desc");
        await connection.current.setRemoteDescription(call.offer);


        socket.on('ice-candidate', async (data) => {
            console.log("adding candidate")
            await connection.current.addIceCandidate(new RTCIceCandidate(data));
        });

        connection.current.onicecandidate = event => {
            console.log("onicecandidate")
            if (event.candidate) {
                console.log("sending candidate from receiver to " + call.from)
                socket.emit('ice-candidate', {to: call.from, message: event.candidate});
            }
        };

        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        console.log("local stream");
        console.log(stream);
        console.log(stream.getTracks());
        stream.getTracks().forEach(track => connection.current.addTrack(track, stream));
        localStream.current = stream;

        console.log("creating answer");
        const answer = await connection.current.createAnswer();
        console.log(answer);

        console.log("setting local desc");
        await connection.current.setLocalDescription(answer);
        console.log(connection.current);

        console.log("sending answer");
        socket.emit("answerCall", {answer: answer, to: call.from});

        setCallStatus("on");
    }

    function hangUpCall() {
        console.log("hanging up a call");
        setCallStatus(true);
    }

    switch (callStatus) {
        case "new":
            return (
                <div className="row">
                    <div className="col">
                        <div className="video-wrapper">
                            <video id="myVideo" autoPlay playsInline ref={myVideo}></video>
                        </div>
                        <div className="d-flex flex-row">
                            <button className="icon-button">
                                <span className="material-symbols-outlined">videocam_off</span>
                            </button>
                            <button className="icon-button">
                                <span className="material-symbols-outlined">videocam</span>
                            </button>
                            <button className="icon-button">
                                <span className="material-symbols-outlined">mic</span>
                            </button>
                            <button className="icon-button">
                                <span className="material-symbols-outlined">mic_off</span>
                            </button>
                        </div>
                    </div>
                    <div className="col input-call-id">
                        <div className="row">
                            my id: {myId}
                        </div>
                        <div className="row">
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
                </div>

            );
        case "on":
            return (
                <div>
                    <div>I am {myId}</div>
                    <div className="camera-wrapper">
                        <div className="flex-row">
                            <div className="video-wrapper">
                                <video id="myVideo" autoPlay playsInline ref={myVideo}></video>
                            </div>
                            <div className="video-wrapper">
                                <video id="remoteVideo" autoPlay playsInline ref={remoteVideo}></video>
                            </div>
                        </div>

                        <button disabled={isCameraOpen} onClick={openCamera}>Open camera</button>

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
                        <button onClick={answerCall}>Answer</button>
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