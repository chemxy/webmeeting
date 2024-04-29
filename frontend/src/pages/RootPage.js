import {Outlet} from "react-router-dom";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import {useContext, useEffect, useRef} from "react";
import {CallContext} from "../store/CallContext";
import {CallStatus} from "../common/call-status";

export default function RootPage() {

    const callContext = useContext(CallContext);
    const receivedCallModal = useRef();

    useEffect(() => {
        if (callContext.status === CallStatus.INCOMING) {
            console.log("incoming call");
            receivedCallModal.current.showModal();
        }
    }, [callContext.status]);


    function rejectCall() {
        receivedCallModal.current.close();
    }

    function answerCall() {

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
            <div className="row container">
                <div className="col-2 d-flex align-items-center m-auto">
                    <div className="navbar-wrapper">
                        <Navbar></Navbar>
                    </div>
                </div>
                <div className="col-10 align-items-center m-auto">
                    <div className="row">
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