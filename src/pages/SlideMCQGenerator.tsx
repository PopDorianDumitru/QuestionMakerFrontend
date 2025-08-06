import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "../css_files/SlideMCQGenerator.css"
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { type User } from 'firebase/auth';
import { useSnackBarStore } from '../stores/snackBarStore';
import { useQuestionsStore } from '../stores/useQuestionsStore';
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

async function generateMCQFuture(group: SlideGroup, addQuestion: (question: Question) => void, user: User | null) {
  const slides = group.map((slide, index) => `Slide ${index + 1}: ${slide}`).join('\n');
  const response = await axios.post(`${backendURL}/generate_question`, {
    topic: `${slides}`
  }, { headers: {Authorization: `Bearer ${await user?.getIdToken()}`} })
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
}

async function generateMCQ(group: SlideGroup, setCurrentQuestion: (question: string) => void, setLoading: (loading: boolean) => void, setCorrectAnswers: (answers: string[]) => void, setAnswers: (answers: Record<string, string>) => void, user: User | null, createSnackBar: (message: string, severity: string) => void, addQuestion: (question: Question) => void): Promise<string> {
  console.log("Rendering SlideMCQGenerator");

  setLoading(true);

  const slides = group.map((slide, index) => `Slide ${index + 1}: ${slide}`).join('\n');
  const response = await axios.post(`${backendURL}/generate_question`, {
    topic: `${slides}`
  }, { headers: {Authorization: `Bearer ${await user?.getIdToken()}`} })
  .catch((error) => {console.error(error); createSnackBar('Error generating question, please try again. If the error persists, please return later', 'error'); setLoading(false);});
  const result = response?.data?.output?.[0]?.content?.[0]?.text;
  const parsedResult = JSON.parse(result) as { question: string, A: string, B: string, C: string, D: string, correct_answers: string[] };

  setLoading(false);
  setCurrentQuestion(parsedResult.question ?? 'No response');
  setCorrectAnswers(parsedResult.correct_answers ?? []);
  const answers: Record<string, string> = {
  A: parsedResult.A ?? '',
  B: parsedResult.B ?? '',
  C: parsedResult.C ?? '',
  D: parsedResult.D ?? ''
  };
  setAnswers(answers);
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Set<string>>(new Set());
  const user = useUserStore((state) => state.user);
  const navigator = useNavigate();
  const createSnackBar = useSnackBarStore((state) => state.createSnackBar);
  const addQuestion = useQuestionsStore((state) => state.addQuestion)
  const updateQuestion = useQuestionsStore((state) => state.updateQuestion)
  const questionIndex = useQuestionsStore((state) => state.currentQuestion)
  const setQuestion = useQuestionsStore((state) => state.setCurrentQuestion)
  const getCurrentQuestion = useQuestionsStore((state) => state.getCurrentQuestion)

  useEffect(() => {
    const prepareGroups = () => {
      const slidesJson = localStorage.getItem('slides');
      if (!slidesJson) {
        console.error('No slides found in localStorage');
        createSnackBar('No file found, please upload a file from which to create the quiz', 'error');
        return;
      }
      const slides = JSON.parse(slidesJson) as string[];
      const fileType = localStorage.getItem('fileType');
      let sequentialGroups = null;
      if (fileType === 'pptx')
        sequentialGroups = groupByTriplets(slides);
      else
        sequentialGroups = groupRandomChunks(slides, 1);
      setAllGroups(sequentialGroups);
    };
    console.log("Preparing groups");
    prepareGroups();
  }, []);

  useEffect(() => {
    if (allGroups.length === 0) return;
    if (currentIndex >= allGroups.length && allGroups.length > 0) {
    // Regenerate a new random group of questions
      const slidesJson = localStorage.getItem('slides');
      if (slidesJson) {
        const slides = JSON.parse(slidesJson) as string[];
        let newRandomGroups = null;
        const fileType = localStorage.getItem('fileType');
        if (fileType === 'pptx')
          newRandomGroups = groupRandomChunks(slides);
        else
          newRandomGroups = groupRandomChunks(slides, 1);
        setAllGroups(newRandomGroups);
        setCurrentIndex(0);
      }
  } else {
      setChecked(false);
      setSelectedAnswers(new Set());
      console.log("Generating first question");
      const group = allGroups[currentIndex];
      setChecked(false);
      setSelectedAnswers(new Set());
      generateMCQ(group, setCurrentQuestion, setLoading, setCorrectAnswers, setAnswers, user, createSnackBar, addQuestion);
  }
      // const group = allGroups[currentIndex];
      
      // generateMCQ(group, setCurrentQuestion, setLoading, setCorrectAnswers, setAnswers, user, createSnackBar, addQuestion)
      // .then(async () => {
      //   console.log("Generating second question");
      //   await generateMCQFuture(group, addQuestion, user)
      //   .then(async () => {
      //     console.log("Generating third question");
      //     await generateMCQFuture(group, addQuestion, user)
      //   })
      // }
      // );
  // } else {
    
  }, [currentIndex, allGroups, user, createSnackBar]);


  const toggleAnswer = (option: string) => {
    const newSet = new Set(selectedAnswers);
    if (newSet.has(option)) {
      newSet.delete(option);
    } else {
      newSet.add(option);
    }
    setSelectedAnswers(newSet);
  };

  const handleCheckAnswers = () => {
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
    <div className="p-6 max-w-3xl mx-auto">
      {loading ? (
        <p>Loading question...</p>
      ) : (
        <div className="mb-4 p-4 border rounded shadow">
          <p className="mb-4 whitespace-pre-line">{currentQuestion}</p>
          <div className='answer_container'>
            
          {Object.entries(answers).map(([option, text]) => {
            const isSelected = selectedAnswers.has(option);
            const correct = isCorrect(option);
            const incorrect = isIncorrect(option);
            return (
              <div className='answer_wrapper'>
                <button
                  key={option}
                  onClick={() => toggleAnswer(option)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg font-medium border 
                    transition-all duration-200 mb-3 answer_button
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
                  <strong>{option}:</strong> {text}
                </button>
              </div>
            );
          })}
          {checked && (
            <p>You picked: {[...selectedAnswers].join(', ')}</p>
          )}
          </div>  
          <div className="mt-4 flex gap-4">
            {!checked && (
              <button
                onClick={handleCheckAnswers}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
                disabled={selectedAnswers.size === 0}
              >
                Check Answers
              </button>
            )}
            {checked && (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Next Question
              </button>
            )}
          </div>
        </div>
      )}
      <button onClick={() => navigator('/allQuestions')}>
        See All Questions
      </button>
      <button onClick={exitQuiz}>
        Exit Quiz
      </button>
    </div>
  );
};

export default SlideMCQGenerator;
