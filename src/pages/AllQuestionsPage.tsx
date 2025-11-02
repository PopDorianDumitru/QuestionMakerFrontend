import { useQuestionsStore } from "../stores/useQuestionsStore"
import { useNavigate } from "react-router-dom"
import generateAnswerKeyPdf from "../utils/GenerateAnswerKeyPDF"
import generateQuizOnlyPdf from "../utils/GenerateQuizPDF"
import { useInformationStore } from "../stores/informationStore"
import "../css_files/SlideMCQGenerator.css"

const AllQuestionsPage = () => {
    const cachedQuestions = useQuestionsStore((state) => state.cachedQuestions)
    const questions = useQuestionsStore((state) => state.questions)
    const nav = useNavigate()
    const setCurrentQuestion = useQuestionsStore((state) => state.setCurrentQuestion)
    const informationStore = useInformationStore((state) => state)
    const generateQuizPDF = () => {
        const seenQuestions = questions.filter((_, index) => index <= informationStore.getIndex())
        generateAnswerKeyPdf([...cachedQuestions, ...seenQuestions])
        generateQuizOnlyPdf([...cachedQuestions, ...seenQuestions])
    }

    return (
        <div className="generated-question-container" id="questions-container">
            <h1 style={{ marginTop: "0.5rem" }}>Generated Questions</h1>
            <div style={{width:"100%"}}>
                {cachedQuestions.map((question, index) => {
                    return (
                        <button className="question-button" style={{width:"100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} onClick={() => {setCurrentQuestion(index); nav("/generatedQuestion")}} key={index}> <div className="answer-choice">{index + 1}</div>  {question.question} </button>
                    )
                })}
            </div>
            <div style={{width:"100%"}}>
                {questions.map((question, index) => {
                    if(index > informationStore.getIndex()) return;
                    return (
                        <button className="question-button" style={{width:"100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} onClick={() => {setCurrentQuestion(index); nav("/generatedQuestion")}} key={index}> <div className="answer-choice">{index + cachedQuestions.length + 1}</div> {question.question} </button>
                    )
                })}
            </div>
            <div className="control-buttons-container">
                <button className="generated-question-button whole-line-buttons" onClick={() => {
                    informationStore.setIndex(informationStore.getIndex() + 1);
                    nav("/question")
                    }}>
                    Generate New Question
                </button>
                <button className="generated-question-button whole-line-buttons" onClick={generateQuizPDF}>
                    Export to PDF
                </button>
            </div>
        </div>
    )
}

export default AllQuestionsPage