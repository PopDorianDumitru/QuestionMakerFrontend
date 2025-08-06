import { useQuestionsStore } from "../stores/useQuestionsStore"
import { useNavigate } from "react-router-dom"
import generateAnswerKeyPdf from "../utils/GenerateAnswerKeyPDF"
import generateQuizOnlyPdf from "../utils/GenerateQuizPDF"

const AllQuestionsPage = () => {
    const questions = useQuestionsStore((state) => state.questions)
    const nav = useNavigate()
    const setCurrentQuestion = useQuestionsStore((state) => state.setCurrentQuestion)

    const generateQuizPDF = () => {
        generateAnswerKeyPdf(questions)
        generateQuizOnlyPdf(questions)
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", width: "50rem" }}>
            <h1>Questions generated so far</h1>
            <div style={{width:"100%"}}>
                {questions.map((question, index) => (
                    <button style={{width:"100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} onClick={() => {setCurrentQuestion(index); nav("/generatedQuestion")}} key={index}> {question.question} </button>
                ))}
            </div>
            <button style={{marginTop: "3rem"}} onClick={() => nav("/question")}>
                Generate New Question
            </button>
            <button onClick={generateQuizPDF}>
                Export to PDF
            </button>
        </div>
    )
}

export default AllQuestionsPage