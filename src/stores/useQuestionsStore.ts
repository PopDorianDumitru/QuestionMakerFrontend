import { create } from 'zustand';
import type { Question } from '../types/Question';

type QuestionsStore = {
    questions: Question[];
    cachedQuestions: Question[];
    currentQuestion: number;

    setQuestions: (questions: Question[]) => void;
    addQuestion: (question: Question) => void;
    setCurrentQuestion: (currentQuestion: number) => void;
    getCurrentQuestion: () => Question;
    nextQuestion: () => void;
    previousQuestion: () => void;
    updateQuestion: (index: number, newQuestion: Partial<Question>) => void;
    hasPreviousQuestion: () => boolean;
    hasNextQuestion: () => boolean;
    getNumberOfQuestions: () => number;
    getQuestion: (index: number) => Question;
    cacheQuestions: () => void;
    reset: () => void;
    resetCache: () => void;
};

export const useQuestionsStore = create<QuestionsStore>((set, get) => ({
  questions: [],
  currentQuestion: 0,
  cachedQuestions: [],

  setQuestions: (questions) => set({ questions }),

  addQuestion: (question) =>
    set((state) => ({ questions: [...state.questions, question] })),

  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),

  getCurrentQuestion: () => {
    const { questions, currentQuestion } = get();
    return questions[currentQuestion];
  },

  nextQuestion: () =>
    set((state) => {
      if (state.currentQuestion < state.questions.length - 1) {
        return { currentQuestion: state.currentQuestion + 1 };
      }
      return {};
    }),

  previousQuestion: () =>
    set((state) => {
      if (state.currentQuestion > 0) {
        return { currentQuestion: state.currentQuestion - 1 };
      }
      return {};
    }),
  updateQuestion: (index, updates: Partial<Question>) =>
  set((state) => ({
    questions: state.questions.map((q, i) =>
      i === index ? { ...q, ...updates } : q
    ),
  })),

  hasPreviousQuestion: () => get().currentQuestion > 0,
  hasNextQuestion: () => get().currentQuestion < get().questions.length - 1,

  getNumberOfQuestions: () => get().questions.length,

  getQuestion: (index) => get().questions[index],

  cacheQuestions: () => set({ cachedQuestions: [ ...get().cachedQuestions,...get().questions] }),

  reset: () => set({ questions: [], currentQuestion: 0 }),
  resetCache: () => set({ cachedQuestions: [] }),
}));
