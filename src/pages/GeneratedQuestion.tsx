import { useQuestionsStore } from "../stores/useQuestionsStore"
import "../css_files/SlideMCQGenerator.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"


const GeneratedQuestion: React.FC = () => {
    const getCurrentQuestion = useQuestionsStore((state) => state.getCurrentQuestion)
    const previousQuestion = useQuestionsStore((state) => state.previousQuestion)
    const nextQuestion = useQuestionsStore((state) => state.nextQuestion)
    const hasPreviousQuestion = useQuestionsStore((state) => state.hasPreviousQuestion)
    const hasNextQuestion = useQuestionsStore((state) => state.hasNextQuestion)
    const updateQuestion = useQuestionsStore((state) => state.updateQuestion)
    const index = useQuestionsStore((state) => state.currentQuestion)
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
    const question = getCurrentQuestion();
    const nav = useNavigate();
    const [checkedAnswers, setCheckedAnswers] = useState<boolean>(false)
    

    const resetQuestion = () => {
        setSelectedAnswers([]);
        setCheckedAnswers(false);
        updateQuestion(index, { selectedAnswers: [] });
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-4 p-4 border rounded shadow">
          <p className="mb-4 whitespace-pre-line">{question.question}</p>
          <div className='answer_container'>
            
          {Object.entries(question.answers).map(([option, text]) => {
            const correct = question.correctAnswers.includes(option)
            return (
              <div className='answer_wrapper'>
                <button
                  key={option}

                  onClick={() => {
                    if (selectedAnswers.includes(option)) {
                      setSelectedAnswers(selectedAnswers.filter((answer) => answer !== option));
                      updateQuestion(index, { selectedAnswers: selectedAnswers.filter((answer) => answer !== option) });
                    } else {
                      setSelectedAnswers([...selectedAnswers, option]);
                      updateQuestion(index, { selectedAnswers: [...selectedAnswers, option] });
                    }
                  }}

                  className={`
                    w-full text-left px-4 py-3 rounded-lg font-medium border 
                    transition-all duration-200 mb-3 answer_button
                    ${
                        !checkedAnswers ? ( 
                            selectedAnswers.includes(option) ? "checked_answers" : "normal_answers" 
                        )
                            :  correct? "correct_answers" : "incorrect_answers"
                    }
                  `}
                >
                  <strong>{option}:</strong> {text}
                </button>
              </div>
            );
          })}
          { checkedAnswers && <p>You picked: {[...question.selectedAnswers].join(', ')}</p>}
          </div>  
          
        </div>
      <button onClick={resetQuestion}>Reset Question</button>
      <button disabled={!hasPreviousQuestion()} onClick={previousQuestion}>
        Previous Question
      </button>
      <button onClick={() => setCheckedAnswers(true)}>
        Check Answers
      </button>
      <button disabled={!hasNextQuestion()} onClick={nextQuestion}>
        Next Question
      </button>
      <button onClick={() => nav("/allQuestions")}>
        All Questions
      </button>
    </div>
  );
}

export default GeneratedQuestion