import {Outlet} from "react-router-dom";
import Navbar from "./components/Navbar";

export default function RootPage() {
    return (
        <div className="container">
            <div className="flex-row">
                <div className="navbar-wrapper">
                    <Navbar></Navbar>
                </div>
                <div className="content">
                    <Outlet></Outlet>
                </div>

            </div>
        </div>
    )
}