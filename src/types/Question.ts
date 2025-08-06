export type Question = {
    question: string,
    answers: Record<string, string>,
    correctAnswers: string[],
    selectedAnswers: string[]
}
