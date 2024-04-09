import {useRef, useState} from "react";
import './css/DirectCallPage.css';

export default function DirectCallPage() {

    const videoRef = useRef(null);
    const [isNewCall, setNewCall] = useState(true);
    const [callerId, setCallerId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    async function initVideo() {
        try {
            const constraints = {
                audio: true,
                video: true
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log(stream);
            videoRef.current.srcObject = stream;
        } catch (error) {
            setErrorMessage(`getUserMedia error: ${error.name}`, error);
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