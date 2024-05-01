import {Outlet, useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import {useContext, useEffect, useRef} from "react";
import {CallContext} from "../store/CallContext";
import {CallStatus} from "../common/call-status";
import {ConnectionContext} from "../store/ConnectionContext";
import {socket} from "../store/SocketContext";
import "./css/RootPage.css";

export default function RootPage() {

    const callContext = useContext(CallContext);
    const connectionContext = useContext(ConnectionContext);
    const receivedCallModal = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        if (callContext.status === CallStatus.INCOMING) {
            console.log("incoming call");
            receivedCallModal.current.showModal();
        }
    }, [callContext.status]);


    function rejectCall() {
        console.log("reject call")
        receivedCallModal.current.close();
    }

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
            connectionContext.setRemoteStream(e.streams[0]);
            // console.log(remoteStream);
            // console.log(remoteStream.getTracks());
        };

        return peerConnection;
    }

    async function answerCall() {
        console.log("answer call");
        let peerConnection = createPeerConnection();
        // console.log(call.offer);
        console.log("setting remote desc");
        await peerConnection.setRemoteDescription(callContext.call.offer);


        socket.on('ice-candidate', async (data) => {
            console.log("adding candidate")
            await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        });

        peerConnection.onicecandidate = event => {
            console.log("onicecandidate")
            if (event.candidate) {
                console.log("sending candidate from receiver to " + callContext.call.from)
                socket.emit('ice-candidate', {to: callContext.call.from, message: event.candidate});
            }
        };

        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        console.log("local stream");
        console.log(stream);
        console.log(stream.getTracks());
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        connectionContext.setLocalStream(stream);

        console.log("creating answer");
        const answer = await peerConnection.createAnswer();
        console.log(answer);

        console.log("setting local desc");
        await peerConnection.setLocalDescription(answer);
        console.log(peerConnection);

        console.log("sending answer");
        socket.emit("answerCall", {answer: answer, to: callContext.call.from});

        connectionContext.setConnection(peerConnection);
        receivedCallModal.current.close();
        callContext.setStatus(CallStatus.ON_CALL);
        navigate('call');
    }

    return (
        <div>
            <div>
                {/*e.preventDefault() to prevent from closing the dialog with ESC key*/}
                <dialog ref={receivedCallModal} onCancel={e => e.preventDefault()}>
                    <p>You have a call from {callContext.call.from}</p>
                    <button onClick={answerCall}>Accept</button>
                    <button onClick={rejectCall}>Reject</button>
                </dialog>
            </div>

            <div className="d-flex flex-row m-auto" id="root-wrapper">
                <div className="d-flex align-items-center" id="navbar-wrapper">
                    <Navbar></Navbar>
                </div>
                <div className="align-items-center mt-10" id="header-wrapper">
                    <div className="row mb-10">
                        <Header></Header>
                    </div>
                    <div className="row">
                        <Outlet></Outlet>
                    </div>
                </div>
            </div>
        </div>
    )
}