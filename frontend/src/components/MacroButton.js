import './css/MacroButton.css';

export default function MacroButton(props) {

    return (
        <>
            <div className="macro-button">
                <button className="text-capitalize">
                    {props.children}
                </button>
            </div>
        </>
    )
}