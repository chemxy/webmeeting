import {Outlet} from "react-router-dom";
import Navbar from "../components/Navbar";

export default function RootPage() {
    return (
        <div>
            <div className="row container">
                <div className="col-2 d-flex align-items-center m-auto">
                    <div className="navbar-wrapper">
                        <Navbar></Navbar>
                    </div>
                </div>
                <div className="col-10 d-flex align-items-center m-auto">
                    <Outlet></Outlet>
                </div>
            </div>
        </div>
    )
}