import { create } from 'zustand';

type SnackBarState = {
    message: string;
    open: boolean;
    severity: string;
    setOpen: (open: boolean) => void;
    setMessage: (message: string) => void;
    setColor: (color: string) => void;
    createSnackBar: (message: string, severity: string) => void;
};

export const useSnackBarStore = create<SnackBarState>((set) => ({
    message: '',
    open: false,
    severity: 'success',
    setOpen: (open: boolean) => set({ open }),
    setMessage: (message: string) => set({ message }),
    setColor: (severity: string) => set({ severity }),
    createSnackBar: (message: string, severity: string) => {
        set({ message, open: true, severity: severity });
    },
}));