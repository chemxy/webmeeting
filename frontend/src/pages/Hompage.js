import {Link} from "react-router-dom";
import MacroButton from "../components/MacroButton";
import './css/HomePage.css'

export default function HomePage() {

    return (
        <div className="row justify-content-center align-self-center align-items-center mt-30">
            <div className="row justify-content-center mb-10">
                <div className="col-2">
                    <MacroButton>
                        <Link to="/call" className="custom-link text-light">
                            new call
                        </Link>
                    </MacroButton>
                </div>
                <div className="col-2">
                    <MacroButton>
                        <Link to="/" className="custom-link text-light">
                            new meeting
                        </Link>
                    </MacroButton>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-2">
                    <MacroButton>
                        <Link to="/" className="custom-link text-light">
                            join meeting
                        </Link>
                    </MacroButton>
                </div>
                <div className="col-2">
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