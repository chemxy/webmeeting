import { Link } from "react-router-dom";

export default function Navbar() {

    return (
        <div className="navbar mt-4">
            <nav>
                <ul className="nav flex-column ">
                    <li className="nav-item">
                        <Link to="/" className="text-capitalize nav-link">
                            <span className="material-symbols-outlined fs-1">home</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/call" className="text-capitalize nav-link">
                            <span className="material-symbols-outlined fs-1">call</span> </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/" className="text-capitalize nav-link">
                            <span className="material-symbols-outlined fs-1">video_call</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/" className="text-capitalize nav-link">
                            <span className="material-symbols-outlined fs-1">sports_esports</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/" className="text-capitalize nav-link">
                            <span className="material-symbols-outlined fs-1">group</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/" className="text-capitalize nav-link">
                            <span className="material-symbols-outlined fs-1">settings</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}