import {Link} from "react-router-dom";
import MacroButton from "../components/MacroButton";
import './css/HomePage.css'

export default function HomePage() {

    return (
        <div className="container row justify-content-center">
            <div className="row justify-content-center">
                <div className="col-3 mt-5">
                    <MacroButton>
                        <Link to="/call" className="custom-link text-light">
                            new call
                        </Link>
                    </MacroButton>
                </div>
                <div className="col-3 mt-5">
                    <MacroButton>
                        <Link to="/" className="custom-link text-light">
                            new meeting
                        </Link>
                    </MacroButton>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-3 mt-5">
                    <MacroButton>
                        <Link to="/" className="custom-link text-light">
                            join meeting
                        </Link>
                    </MacroButton>
                </div>
                <div className="col-3 mt-5">
                    <MacroButton>
                        <Link to="/" className="custom-link text-light">
                            +
                        </Link>
                    </MacroButton>
                </div>
            </div>
        </div>
    );
}