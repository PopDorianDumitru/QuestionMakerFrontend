import { create } from 'zustand';
import type { Question } from '../types/Question';

type QuestionsStore = {
    questions: Question[];
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
    reset: () => void;
};

export const useQuestionsStore = create<QuestionsStore>((set, get) => ({
  questions: [],
  currentQuestion: 0,

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

  reset: () => set({ questions: [], currentQuestion: 0 }),
}));
