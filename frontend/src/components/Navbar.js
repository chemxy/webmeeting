import {NavLink} from "react-router-dom";
import './css/Navbar.css';

export default function Navbar() {

    return (
        <div className="navbar mt-5 ms-4">
            <nav>
                <ul className="nav flex-column">
                    <li className="nav-item mt-3">
                        <NavLink to="/" className="text-capitalize nav-NavLink">
                            <span className="material-symbols-outlined fs-1">home</span>
                        </NavLink>
                    </li>
                    <li className="nav-item mt-3">
                        <NavLink to="/call" className="text-capitalize nav-NavLink">
                            <span className="material-symbols-outlined fs-1">call</span> </NavLink>
                    </li>
                    <li className="nav-item mt-3">
                        <NavLink to="/0" className="text-capitalize nav-NavLink">
                            <span className="material-symbols-outlined fs-1">video_call</span>
                        </NavLink>
                    </li>
                    <li className="nav-item mt-3">
                        <NavLink to="/1" className="text-capitalize nav-NavLink">
                            <span className="material-symbols-outlined fs-1">sports_esports</span>
                        </NavLink>
                    </li>
                    <li className="nav-item mt-3">
                        <NavLink to="/2" className="text-capitalize nav-NavLink">
                            <span className="material-symbols-outlined fs-1">person</span>
                        </NavLink>
                    </li>
                    <li className="nav-item mt-3">
                        <NavLink to="/3" className="text-capitalize nav-NavLink">
                            <span className="material-symbols-outlined fs-1">settings</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
