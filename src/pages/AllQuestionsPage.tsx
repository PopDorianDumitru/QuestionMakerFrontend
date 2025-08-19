import { useQuestionsStore } from "../stores/useQuestionsStore"
import { useNavigate } from "react-router-dom"
import generateAnswerKeyPdf from "../utils/GenerateAnswerKeyPDF"
import generateQuizOnlyPdf from "../utils/GenerateQuizPDF"
import { useInformationStore } from "../stores/informationStore"

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
        <div style={{ display: "flex", flexDirection: "column", width: "50rem" }}>
            <h1>Questions generated so far</h1>
            <div style={{width:"100%"}}>
                {cachedQuestions.map((question, index) => {
                    return (
                        <button style={{width:"100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} onClick={() => {setCurrentQuestion(index); nav("/generatedQuestion")}} key={index}> {question.question} </button>
                    )
                })}
            </div>
            <div style={{width:"100%"}}>
                {questions.map((question, index) => {
                    if(index > informationStore.getIndex()) return;
                    return (
                        <button style={{width:"100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} onClick={() => {setCurrentQuestion(index); nav("/generatedQuestion")}} key={index}> {question.question} </button>
                    )
                })}
            </div>
            <button style={{marginTop: "3rem"}} onClick={() => {
                informationStore.setIndex(informationStore.getIndex() + 1);
                nav("/question")
                }}>
                Generate New Question
            </button>
            <button onClick={generateQuizPDF}>
                Export to PDF
            </button>
        </div>
    )
}

export default AllQuestionsPage