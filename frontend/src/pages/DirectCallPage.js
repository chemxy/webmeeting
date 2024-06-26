import {useContext, useEffect, useRef, useState} from "react";
import './css/DirectCallPage.css';
import {ConnectionContext} from "../store/ConnectionContext";
import {CallStatus} from "../common/call-status";
import {socket, SocketContext} from "../store/SocketContext";
import {CallContext} from "../store/CallContext";

export default function DirectCallPage() {

    const socketContext = useContext(SocketContext);
    const callContext = useContext(CallContext);
    const connectionContext = useContext(ConnectionContext);

    const myVideo = useRef(null);
    const remoteVideo = useRef(null);

    const [isCameraOpen, setCameraOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isChatOpen, setChatOpen] = useState(false);
    const [isParticipantListOpen, setParticipantListOpen] = useState(false);

    useEffect(() => {
        if (callContext.status === CallStatus.ON_CALL) {
            socket.on('open-remote-camera', data => {
                console.log("turning on remote camera")
                console.log(connectionContext.remoteStream)
                remoteVideo.current.srcObject = connectionContext.remoteStream;
            })

            socket.on('close-remote-camera', data => {
                console.log("turning off remote camera")
                remoteVideo.current.srcObject = null;
            })

            socket.on('end-call', data => {
                console.log("ending call")
                connectionContext.connection.close();
                myVideo.current.srcObject = null;
                remoteVideo.current.srcObject = null;
                callContext.setStatus(CallStatus.END);
            })
        }
    },);

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
            // remoteStream.current = e.streams[0];
            connectionContext.setRemoteStream(e.streams[0]);
            console.log(connectionContext.remoteStream);
            // console.log(remoteStream.current);
            // console.log(remoteStream.current.getTracks());
        };

        return peerConnection;
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
        // const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        const stream = connectionContext.localStream;
        // console.log("local stream");
        // console.log(stream);
        // console.log(stream.getTracks());
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        // localStream.current = stream;
        connectionContext.setLocalStream(stream);

        // Create offer
        console.log("creating offer");
        const offer = await peerConnection.createOffer();
        console.log(offer);

        // Send offer to the other peer
        socket.emit("callUser", {
            userToCall: toUser,
            offer: offer,
            from: socketContext.myId,
        })

        console.log("setting local desc");
        await peerConnection.setLocalDescription(offer);
        // console.log(peerConnection);

        callContext.setStatus(CallStatus.OUTGOING);
        // setLocalStream(stream);

        //wait for the other peer to accept the call
        socket.on("callAccepted", (data) => {

            console.log("call accepted")
            console.log(data.answer);
            console.log("setting remote desc");
            peerConnection.setRemoteDescription(data.answer);

            connectionContext.setConnection(peerConnection);
            callContext.setStatus(CallStatus.ON_CALL);
        })

        callContext.setCall({
            me: socketContext.myId,
            offer: offer,
            remote: toUser,
        });
    }

    function turnOnLocalCamera() {
        console.log("turn on camera")
        myVideo.current.srcObject = connectionContext.localStream;
        setCameraOpen(true);
        socket.emit('open-remote-camera', {to: callContext.call.remote});
    }

    function turnOffLocalCamera() {
        console.log("turn off camera")
        myVideo.current.srcObject = null;
        setCameraOpen(false);
        socket.emit('close-remote-camera', {to: callContext.call.remote});
    }

    function mute() {
        console.log("turn on mic")
        setIsMuted(true);
    }

    function unmute() {
        console.log("turn off mic");
        setIsMuted(false);
    }

    function toggleChat() {
        // console.log(`toggleChat to ${!isChatOpen}`)
        setChatOpen(!isChatOpen);
    }

    function toggleParticipantList() {
        // console.log(`toggleParticipantList to ${!isParticipantListOpen}`)
        setParticipantListOpen(!isParticipantListOpen);
    }

    function hangUpCall() {
        console.log("hanging up a call");
        socket.emit('end-call', {to: callContext.call.remote});
        connectionContext.connection.close();
        myVideo.current.srcObject = null;
        remoteVideo.current.srcObject = null;
        callContext.setStatus(CallStatus.END);
    }

    switch (callContext.status) {
        case CallStatus.NEW:
            return (
                <div className="d-flex flex-row">
                    <div className="w-75">
                        <div className="video-wrapper mb-2">
                            <video id="myVideo" autoPlay playsInline ref={myVideo}></video>
                        </div>
                        <div className="d-flex flex-row">
                            {!isCameraOpen && <button className="icon-button me-1" onClick={turnOnLocalCamera}>
                                <span className="material-symbols-outlined">videocam_off</span>
                            </button>}
                            {isCameraOpen && <button className="icon-button" onClick={turnOffLocalCamera}>
                                <span className="material-symbols-outlined">videocam</span>
                            </button>}
                            {!isMuted && <button className="icon-button" onClick={mute}>
                                <span className="material-symbols-outlined">mic</span>
                            </button>}
                            {isMuted && <button className="icon-button" onClick={unmute}>
                                <span className="material-symbols-outlined">mic_off</span>
                            </button>}
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
                <div className="d-flex flex-row mb-4">
                    <div className="me-2">
                        <div className="camera-wrapper">
                            <div className="flex-row">
                                <div className="video-wrapper mb-2">
                                    <video id="myVideo" autoPlay playsInline ref={myVideo}></video>
                                </div>
                                <div className="video-wrapper mb-2">
                                    <video id="remoteVideo" autoPlay playsInline ref={remoteVideo}></video>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-row justify-content-center pe-5">
                            <button onClick={toggleChat} className="icon-button me-1">
                                <span className="material-symbols-outlined">chat</span>
                            </button>
                            <button onClick={toggleParticipantList} className="icon-button me-1">
                                <span className="material-symbols-outlined">group</span>
                            </button>
                            {!isCameraOpen && <button className="icon-button me-1" onClick={turnOnLocalCamera}>
                                <span className="material-symbols-outlined">videocam_off</span>
                            </button>}
                            {isCameraOpen && <button className="icon-button me-1" onClick={turnOffLocalCamera}>
                                <span className="material-symbols-outlined">videocam</span>
                            </button>}
                            {!isMuted && <button className="icon-button me-1" onClick={mute}>
                                <span className="material-symbols-outlined">mic</span>
                            </button>}
                            {isMuted && <button className="icon-button me-1" onClick={unmute}>
                                <span className="material-symbols-outlined">mic_off</span>
                            </button>}
                            <button className="icon-button me-1">
                                <span className="material-symbols-outlined">screen_share</span>
                            </button>
                            <button onClick={hangUpCall} className="icon-button bg-danger">
                                <span className="material-symbols-outlined">call_end</span>
                            </button>
                        </div>
                    </div>
                    <div className="d-flex flex-column w-100">
                        {isChatOpen && <div id="chatbox-wrapper" className="mb-2">
                            <div className="text-center">
                                <h3>Chat History</h3>
                            </div>
                        </div>}
                        {isParticipantListOpen && <div id="participant-list-wrapper">
                            <div className="text-center">
                                <h3>Participants</h3>
                            </div>
                        </div>}
                    </div>
                </div>
            );
        case CallStatus.OUTGOING:
            return (
                <div>
                    calling: {callContext.call.remote}
                </div>
            )
        case CallStatus.END:
            return (
                <div>
                    Call has ended. <button onClick={() => callContext.setStatus(CallStatus.NEW)}>Return to home
                    screen</button>
                </div>
            )
    }

}
