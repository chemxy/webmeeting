import {useRef, useState} from "react";
import './css/DirectCallPage.css';
import {useNavigate} from "react-router-dom";

export default function DirectCallPage() {

    const videoRef = useRef(null);
    const [isNewCall, setNewCall] = useState(true);
    const navigate = useNavigate();

    // Put variables in global scope to make them available to the browser console.
    const constraints = window.constraints = {
        audio: false,
        video: true
    };

    function handleSuccess(stream) {
        // const video = document.querySelector('video');
        const video = videoRef.current;
        const videoTracks = stream.getVideoTracks();
        console.log('Got stream with constraints:', constraints);
        console.log(`Using video device: ${videoTracks[0].label}`);
        window.stream = stream; // make variable available to browser console
        video.srcObject = stream;
    }

    function handleError(error) {
        if (error.name === 'OverconstrainedError') {
            const v = constraints.video;
            errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
        } else if (error.name === 'NotAllowedError') {
            errorMsg('Permissions have not been granted to use your camera and ' +
                'microphone, you need to allow the page access to your devices in ' +
                'order for the demo to work.');
        }
        errorMsg(`getUserMedia error: ${error.name}`, error);
    }

    function errorMsg(msg, error) {
        const errorElement = document.querySelector('#errorMsg');
        errorElement.innerHTML += `<p>${msg}</p>`;
        if (typeof error !== 'undefined') {
            console.error(error);
        }
    }

    async function init(e) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log(stream);
            handleSuccess(stream);
            e.target.disabled = true;
        } catch (e) {
            handleError(e);
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
            <div className="col">
                <div className="row">
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
                    <button id="showVideo" onClick={(e) => init(e)}>Open camera</button>

                    <div id="errorMsg"></div>
                </div>
                <div>
                    <button onClick={hangUpCall} className="text-capitalize">end call</button>
                </div>
            </div>
        );
    }

}