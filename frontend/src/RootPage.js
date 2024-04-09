import {Outlet} from "react-router-dom";
import Navbar from "./components/Navbar";

export default function RootPage() {
    return (
        <div className="">
            <div className="row">
                <div className="col-1">
                    <div className="navbar-wrapper">
                        <Navbar></Navbar>
                    </div>
                </div>
                <div className="col-11">
                    <div className="content">
                        <Outlet></Outlet>
                    </div>
                </div>
            </div>
        </div>
    )
}