import {useContext, useEffect, useRef, useState} from "react";
import './css/DirectCallPage.css';
import io from "socket.io-client"
import {ConnectionContext} from "../store/ConnectionContext";
import {CallStatus} from "../common/call-status";
import {socket, SocketContext} from "../store/SocketContext";
import {CallContext} from "../store/CallContext";

export default function DirectCallPage() {

    const idContext = useContext(SocketContext);
    const callContext = useContext(CallContext);
    const connectionContext = useContext(ConnectionContext);

    const myVideo = useRef(null);
    const remoteVideo = useRef(null);
    const localStream = useRef(null);
    const remoteStream = useRef(null);
    const connection = useRef(null);

    const [callStatus, setCallStatus] = useState(CallStatus.NEW);
    const [errorMessage, setErrorMessage] = useState("");
    const [isCameraOpen, setCameraOpen] = useState(false);

    useEffect(() => {
        const webcamHeight = 540;
        const webcamWidth = 960;
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: {ideal: webcamWidth},
                height: {ideal: webcamHeight}
            },
            frameRate: 30,
            aspectRatio: {
                exact: webcamHeight / webcamWidth,
            },
        }).then(
            s => {
                console.log(s);
                connectionContext.setLocalStream(s);
            }
        );

    }, []);


    //wait for a call
    // socket.on("receiveCall", async (data) => {
    //     console.log(`receiving a call from ${data.from}`);
    //     // console.log(data.offer);
    //     setCall({
    //         from: data.from,
    //         offer: data.offer,
    //         to: idContext
    //     });
    //     console.log(call);
    //
    //     connection.current = createPeerConnection();
    //     // console.log(call.offer);
    //     console.log("setting remote desc");
    //     await connection.current.setRemoteDescription(data.offer);
    //
    //
    //     socket.on('ice-candidate', async (data) => {
    //         console.log("adding candidate")
    //         await connection.current.addIceCandidate(new RTCIceCandidate(data));
    //     });
    //
    //     setCallStatus("incoming");
    // });

    // }, [])

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
            from: idContext.myId,
        })

        console.log("setting local desc");
        await peerConnection.setLocalDescription(offer);
        // console.log(peerConnection);

        setCallStatus("calling");
        callContext.setStatus(CallStatus.OUTGOING);
        // setLocalStream(stream);

        //wait for the other peer to accept the call
        socket.on("callAccepted", (data) => {

            // openCamera(peerConnection);
            // myVideo.current.srcObject = localStream;
            console.log("call accepted")
            console.log(data.answer);
            console.log("setting remote desc");
            peerConnection.setRemoteDescription(data.answer);

            // setConnetion(peerConnection);
            callContext.setStatus(CallStatus.ON_CALL);
        })

        callContext.setCall({
            from: idContext,
            offer: offer,
            to: toUser,
        })
    }

    // async function answerCall() {
    //
    //     connection.current = createPeerConnection();
    //     // console.log(call.offer);
    //     console.log("setting remote desc");
    //     await connection.current.setRemoteDescription(callContext.call.offer);
    //
    //
    //     socket.on('ice-candidate', async (data) => {
    //         console.log("adding candidate")
    //         await connection.current.addIceCandidate(new RTCIceCandidate(data));
    //     });
    //
    //     connection.current.onicecandidate = event => {
    //         console.log("onicecandidate")
    //         if (event.candidate) {
    //             console.log("sending candidate from receiver to " + callContext.call.from)
    //             socket.emit('ice-candidate', {to: callContext.call.from, message: event.candidate});
    //         }
    //     };
    //
    //     // Get local media stream
    //     const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    //     console.log("local stream");
    //     console.log(stream);
    //     console.log(stream.getTracks());
    //     stream.getTracks().forEach(track => connection.current.addTrack(track, stream));
    //     localStream.current = stream;
    //
    //     console.log("creating answer");
    //     const answer = await connection.current.createAnswer();
    //     console.log(answer);
    //
    //     console.log("setting local desc");
    //     await connection.current.setLocalDescription(answer);
    //     console.log(connection.current);
    //
    //     console.log("sending answer");
    //     socket.emit("answerCall", {answer: answer, to: callContext.call.from});
    //
    //     callContext.setStatus(CallStatus.ON_CALL);
    //
    // }

    function turnOnCamera() {
        console.log("turn on camera")
        myVideo.current.srcObject = connectionContext.localStream;
    }

    function turnOffCamera() {
        console.log("turn off camera")
        myVideo.current.srcObject = null;
    }

    function mute() {
        console.log("turn on mic")
    }

    function unmute() {
        console.log("turn off mic")
    }

    function hangUpCall() {
        console.log("hanging up a call");
        setCallStatus(true);
    }

    switch (callContext.status) {
        case CallStatus.NEW:
            return (
                <div className="d-flex flex-row">
                    <div className="w-75">
                        <div className="video-wrapper">
                            <video id="myVideo" autoPlay playsInline ref={myVideo}></video>
                        </div>
                        <div className="d-flex flex-row">
                            <button className="icon-button" onClick={turnOnCamera}>
                                <span className="material-symbols-outlined">videocam</span>
                            </button>
                            <button className="icon-button" onClick={turnOffCamera}>
                                <span className="material-symbols-outlined">videocam_off</span>
                            </button>
                            <button className="icon-button" onClick={mute}>
                                <span className="material-symbols-outlined">mic</span>
                            </button>
                            <button className="icon-button" onClick={unmute}>
                                <span className="material-symbols-outlined">mic_off</span>
                            </button>
                        </div>
                    </div>
                    <div className="w25">
                        <form onSubmit={(e) => callUser(e)}>
                            <div>
                                <div>
                                    <label>Recipient ID</label>
                                </div>
                                <div className="mt-2">
                                    <input type="text" name="to"/>
                                </div>
                                <div className="mt-4">
                                    <button type="submit" className="text-capitalize">call</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>


            );
        case CallStatus.ON_CALL:
            return (
                <div>
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
        case CallStatus.OUTGOING:
            return (
                <div>
                    calling: {callContext.call.to}
                </div>
            )
    }

}