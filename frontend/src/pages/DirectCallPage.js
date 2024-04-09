import {useRef, useState} from "react";
import './css/DirectCallPage.css';
import {useNavigate} from "react-router-dom";

export default function DirectCallPage() {

    const videoRef = useRef(null);
    const [isNewCall, setNewCall] = useState(true);
    const [callerId, setCallerId] = useState("");
    const [stream, setStream] = useState();
    const [errorMessage, setErrorMessage] = useState("");

    function setUserVideo(stream) {
        setStream(stream);
        videoRef.current.srcObject = stream;
    }

    function handleError(error) {
        if (error.name === 'OverconstrainedError') {
            setErrorMessage(`The resolution is not supported by your device.`);
        } else if (error.name === 'NotAllowedError') {
            setErrorMessage('Permissions have not been granted to use your camera and ' +
                'microphone, you need to allow the page access to your devices in ' +
                'order for the demo to work.');
        }
        setErrorMessage(`getUserMedia error: ${error.name}`, error);
    }

    async function initVideo(event) {
        try {
            const constraints = {
                audio: true,
                video: true
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log(stream);
            setUserVideo(stream);
            event.target.disabled = true;
        } catch (err) {
            handleError(err);
        }
    }

    function makeNewCall() {
        console.log("making a new call");
        setNewCall(false);
    }

    function hangUpCall() {
        console.log("hanging up a call");
        setNewCall(true);
    }

    if (isNewCall) {
        return (
            <div className="col input-call-id">
                <div className="row ">
                    <label htmlFor="">ID</label>
                    <input type="text"/>
                </div>
                <div className="row">
                    <button onClick={makeNewCall} className="text-capitalize">call</button>
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <div className="camera-wrapper">
                    <video id="gum-local" autoPlay playsInline ref={videoRef}></video>
                    <button id="showVideo" onClick={(e) => initVideo(e)}>Open camera</button>

                    <div id="errorMsg">{errorMessage}</div>
                </div>
                <div>
                    <button onClick={hangUpCall} className="text-capitalize">end call</button>
                </div>
            </div>
        );
    }

}