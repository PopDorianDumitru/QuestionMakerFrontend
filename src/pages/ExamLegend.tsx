import type React from "react";

const ExamLegend: React.FC = () => {
    return (
        <div className="exam-legend" style={{borderRadius: "1rem",width: "100%", textAlign: "left", backgroundColor: "white", paddingLeft: "2rem", paddingRight: "2rem", margin: "0", borderStyle: "solid", borderColor: "black", borderWidth: "1px"}}>
            <h1 style={{paddingTop: "0", marginTop: "0"}}>Legend</h1>
            <h2 style={{paddingTop: "0", marginTop: "0"}}>Colors</h2>
            <ul style={{paddingTop: "0", marginTop: "0"}}>
                <li>Correct answers to the question are <span style={{color: "green"}}>green</span></li>
                <li>Incorrect answers to the question are <span style={{color: "red"}}>red</span></li>
            </ul>
            <h2>Symbols</h2>
            <p> The following symbols will appear next to the answers when you submit a question </p>
            <ul style={{paddingTop: "0", marginTop: "0", display: "flex", flexDirection: "row", listStyle: "none"}}>
                <li>
                    <p style={{width: "100%", textAlign: "center", fontSize: "2rem", margin: "0"}}>✔️</p>
                    <ol>
                        <li>If you have chosen a correct answer</li>
                        <li>If you haven't chosen a wrong answer</li>
                    </ol>
                </li>

                <li>
                    <p style={{width: "100%", textAlign: "center", fontSize: "2rem", margin: "0"}}>❌</p>
                    <ol>
                        <li>If you haven't chosen a correct answer</li>
                        <li>If you have chosen a wrong answer</li>
                    </ol>
                </li>
            </ul>
            <p style={{paddingTop: "0", marginTop: "3rem", width: "100%", textAlign: "center"}}>If all of the answers have a ✔️ next to them, that means you answered the question perfectly</p>
        </div>
    )
}

export default ExamLegend