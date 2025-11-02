import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "../css_files/SlideMCQGenerator.css"
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { type User } from 'firebase/auth';
import { useQuestionsStore } from '../stores/useQuestionsStore';
import { useInformationStore, type InformationState } from '../stores/informationStore';
import type { Question } from '../types/Question';
const backendURL = import.meta.env.VITE_BACKEND

type SlideGroup = string[];

function groupByTriplets(slides: string[]): SlideGroup[] {
  const groups: SlideGroup[] = [];
  for (let i = 0; i < slides.length; i += 3) {
    groups.push(slides.slice(i, i + 3));
  }
  return groups;
}

function groupRandomChunks<T>(slides: T[], groupSize: number = 3): T[][] {
  const shuffled = [...slides].sort(() => 0.5 - Math.random());
  const groups: T[][] = [];
  for (let i = 0; i < shuffled.length; i += groupSize) {
    groups.push(shuffled.slice(i, i + groupSize));
  }
  return groups;
}

async function generateMCQ(group: SlideGroup, user: User | null, addQuestion: (question: Question) => void, informationStore: InformationState): Promise<string> {
  console.log("Rendering SlideMCQGenerator");

  const slides = group.map((slide, index) => `Slide ${index + 1}: ${slide}`).join('\n');
  const response = await axios.post(`${backendURL}/generate_question`, {
    topic: `${slides}`,
    instructions: `${informationStore.getCustomPrompt()}`
  }, { headers: {Authorization: `Bearer ${await user?.getIdToken()}`} })
  .catch((error) => {
    console.error(error); 
    throw error;
  });
  const result = response?.data?.output?.[0]?.content?.[0]?.text;
  const parsedResult = JSON.parse(result) as { question: string, A: string, B: string, C: string, D: string, correct_answers: string[] };

  const answers: Record<string, string> = {
  A: parsedResult.A ?? '',
  B: parsedResult.B ?? '',
  C: parsedResult.C ?? '',
  D: parsedResult.D ?? ''
  };
  const question: Question = {
    question: parsedResult.question ?? 'No response',
    answers: answers,
    correctAnswers: parsedResult.correct_answers ?? [],
    selectedAnswers: [],
  }
  addQuestion(question);
  return parsedResult.question ?? 'No response';
}

const SlideMCQGenerator: React.FC = () => {
  const [allGroups, setAllGroups] = useState<SlideGroup[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Set<string>>(new Set());
  const user = useUserStore((state) => state.user);
  const navigator = useNavigate();
  // const createSnackBar = useSnackBarStore((state) => state.createSnackBar);
  const addQuestion = useQuestionsStore((state) => state.addQuestion)
  const updateQuestion = useQuestionsStore((state) => state.updateQuestion)
  const cacheQuestions = useQuestionsStore((state) => state.cacheQuestions)
  const setQuestions = useQuestionsStore((state) => state.setQuestions)
  // const getCurrentQuestion = useQuestionsStore((state) => state.getCurrentQuestion)
  const questionIndex = useQuestionsStore((state) => state.currentQuestion)
  const informationStore = useInformationStore((state) => state);
  const getQuestion = useQuestionsStore((state) => state.getQuestion)

  useEffect(() => {
    if(informationStore.hasInformation()) {
      const slides = informationStore.getStructuredInformation();
      setCurrentIndex(informationStore.getIndex());
      setAllGroups(slides);
      return;
    } else {
      setCurrentIndex(0);
    }
  }, []);

  useEffect(() => {
    if(currentIndex == -1) return;
    if(currentIndex == 0) {
      if(!informationStore.hasInformation()) {
        setLoading(true);
        const slidesJson = localStorage.getItem('slides');
        if (slidesJson) {
          const slides = JSON.parse(slidesJson) as string[];
          const fileType = localStorage.getItem('fileType');
          let getStructuredInformation = null;
          if (fileType === 'pptx')
            getStructuredInformation = groupByTriplets(slides);
          else
            getStructuredInformation = groupRandomChunks(slides);

          setAllGroups(getStructuredInformation);
          informationStore.setStructuredInformation(getStructuredInformation);
        }  
      }
      const groups = informationStore.getStructuredInformation();
      console.log(groups)
      generateMCQ(groups[currentIndex], user, addQuestion, informationStore)
      .then(() => {
        console.log("Done with first question");
        setLoading(false);
        const question = getQuestion(0);
        setCurrentQuestion(question.question);
        setAnswers(question.answers);
        setCorrectAnswers(question.correctAnswers);
        setSelectedAnswers(new Set());
        setChecked(false);
        if(currentIndex < groups.length - 1) {
          generateMCQ(groups[currentIndex + 1], user, addQuestion, informationStore)
          .then(() => {
            console.log("Done with second question");
            if(currentIndex < groups.length - 2) {
              generateMCQ(groups[currentIndex + 2], user, addQuestion, informationStore)
              .then(() => {
                console.log("Done with third question");
              })
            }
          })
        }
        }
      )
    } else if (currentIndex < allGroups.length) {
      const question = getQuestion(currentIndex);
      informationStore.setIndex(currentIndex);
      setCurrentQuestion(question.question);
      setAnswers(question.answers);
      setCorrectAnswers(question.correctAnswers);
      setSelectedAnswers(new Set());
      setChecked(false);
      if(currentIndex < allGroups.length - 2) {
        generateMCQ(allGroups[currentIndex + 2], user, addQuestion, informationStore)
        .then(() => {
          console.log("Done with follow up question");
        })
      }
    } else {
      cacheQuestions();
      setQuestions([]);
      informationStore.reset();
      setCurrentIndex(0);
    }
  }, [currentIndex]);


  const toggleAnswer = (option: string) => {
    if (checked) return;
    const newSet = new Set(selectedAnswers);
    if (newSet.has(option)) {
      newSet.delete(option);
    } else {
      newSet.add(option);
    }
    setSelectedAnswers(newSet);
  };

  const handleCheckAnswers = () => {
    if (checked) return;
    updateQuestion(questionIndex, { selectedAnswers: Array.from(selectedAnswers) });
    setChecked(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const isCorrect = (option: string) =>
    correctAnswers.includes(option);

  const isIncorrect = (option: string) =>
    !correctAnswers.includes(option);

  const exitQuiz = () => {
    const confirm = window.confirm('Are you sure you want to exit?');
    if (confirm) {
      localStorage.setItem('slides', '');
      localStorage.setItem('fileType', '');
      navigator('/');
    }
  }

  return (
    <div className="generated-question-container">
      {loading ? (
        <p>Loading question...</p>
      ) : (
        <div>
          <p className="question-text">{currentQuestion}</p>
          <div className='answer_container'>
            
          {Object.entries(answers).map(([option, text]) => {
            const isSelected = selectedAnswers.has(option);
            const correct = isCorrect(option);
            const incorrect = isIncorrect(option);
            return (
              <div className='answer-wrapper'>
                <div className='answer-choice'>{option}</div>
                <button
                  key={option}
                  onClick={() => toggleAnswer(option)}
                  className={`
                    answer_button
                    ${
                      checked
                        ? correct
                          ? 'correct_answers'
                          : incorrect
                          ? 'incorrect_answers'
                          : 'bg-gray-100'
                        : isSelected
                        ? 'checked_answers'
                        : 'normal_answers'
                    }
                  `}
                >
                  <p className='answer-text'>{text}</p>
                </button>
              </div>
            );
          })}
          {checked && (
            <p style={{ margin: '0'}}>You picked: {[...selectedAnswers].sort().join(', ')}</p>
          )}
          </div>  
          <div className='control-buttons'>
            {(
              <button
                onClick={handleCheckAnswers}
                className="generated-question-button"
                disabled={selectedAnswers.size === 0}
              >
                Check Answers
              </button>
            )}
            {checked && (
              <button
                onClick={handleNext}
                className="generated-question-button"
              >
                Next Question
              </button>
            )}
          </div>
        </div>
      )}
      <button className='generated-question-button' onClick={() => navigator('/allQuestions')}>
        See All Questions
      </button>
      <button className='generated-question-button' onClick={exitQuiz}>
        Exit Quiz
      </button>
    </div>
  );
};

export default SlideMCQGenerator;
