import './App.css'
import AppRoutes from './routes/Router'
import { BrowserRouter } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useUserStore } from './stores/userStore';
import Navbar from './components/Navbar';
import { Snackbar } from '@mui/material';
import { useSnackBarStore } from './stores/snackBarStore';
// import triviabara from "../public/triviabara.svg";

onAuthStateChanged(auth, (user) => {
  useUserStore.getState().setUser(user);
});

function App() {

  const snackbarOpen = useSnackBarStore((state) => state.open);
  const snackbarMessage = useSnackBarStore((state) => state.message);
  const snackbarSeverity = useSnackBarStore((state) => state.severity);
  const setSnackbarOpen = useSnackBarStore((state) => state.setOpen);

  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes />
      <img src="/triviabara.svg" alt='triviabara' className='triviabara' />
      <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
              onClose={() => setSnackbarOpen(false)}
              message={snackbarMessage}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              slotProps={{
                content: {
                  style: {
                    backgroundColor: snackbarSeverity === 'error' ? '#d32f2f' : '#2e7d32',
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                },
              }}
            />
    </BrowserRouter>
  )
}

export default App
