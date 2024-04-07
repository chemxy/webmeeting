import logo from './logo.svg';
import './App.css';
import {useRef} from "react";

function App() {

    // const videoRef = useRef(null);

    // Put variables in global scope to make them available to the browser console.
    const constraints = window.constraints = {
        audio: false,
        video: true
    };

    function handleSuccess(stream) {
        const video = document.querySelector('video');
        // const video = videoRef.current;
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

    return (
        <div className="App">
            <div id="container">
                <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a>
                    <span>getUserMedia</span></h1>

                <video id="gum-local" autoPlay playsInline></video>
                <button id="showVideo" onClick={(e) => init(e)}>Open camera</button>

                <div id="errorMsg"></div>

                <p className="warning"><strong>Warning:</strong> if you're not using headphones, pressing play will cause
                    feedback.</p>

                <p>Display the video stream from <code>getUserMedia()</code> in a video element.</p>

                <p>The <code>MediaStream</code> object <code>stream</code> passed to
                    the <code>getUserMedia()</code> callback is in
                    global scope, so you can inspect it from the console.</p>

                <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/gum"
                   title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
            </div>
        </div>
    );
}

export default App;
