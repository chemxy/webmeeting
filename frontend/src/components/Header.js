import {useContext} from "react";
import {SocketContext} from "../store/SocketContext";
import myImage from "../assets/images/default_user.png";
import "./css/Header.css";

export default function Header() {

    const myId = useContext(SocketContext);

    return (
        <div className="header d-flex flex-row align-items-center justify-content-end bg-light border rounded-pill">
            <div className="d-flex me-2">
                {myId.myId}
            </div>
            <div className="d-flex profile-picture-wrapper align-items-center justify-content-center rounded-circle">
                <img className="profile-picture" src={myImage} alt="my profile picture"/>
            </div>
        </div>
    )
}