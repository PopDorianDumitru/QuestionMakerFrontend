import { create } from 'zustand'

type SlideGroup = string[];

type InformationState = {
    information: string,
    structuredInformation: SlideGroup[],
    currentInformation: number,
    setCurrentInformation: (currentInformation: number) => void,
    setStructuredInformation: (structuredInformation: SlideGroup[]) => void,
    setInformation: (information: string) => void,
    getCurrentInformation: () => SlideGroup,
    getIndex: () => number,
    setIndex: (index: number) => void,
    getStructuredInformation: () => SlideGroup[],
    hasInformation: () => boolean,
    reset: () => void
}

export const useInformationStore = create<InformationState>((set, get) => ({
    information: '',
    structuredInformation: [],
    currentInformation: 0,
    setCurrentInformation: (currentInformation: number) => set({currentInformation: currentInformation}),
    setStructuredInformation: (structuredInformation: SlideGroup[]) => set({structuredInformation: structuredInformation}),
    setInformation: (information: string) => set({information: information}),
    getCurrentInformation: () => get().structuredInformation[get().currentInformation],
    getStructuredInformation: () => get().structuredInformation,
    hasInformation: () => get().structuredInformation.length > 0,
    getIndex: () => get().currentInformation,
    setIndex: (index: number) => set({currentInformation: index}),
    reset: () => set({information: '', structuredInformation: [], currentInformation: 0})
}))