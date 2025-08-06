import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { useUserStore } from '../stores/userStore';
import axios from 'axios';
const backendURL = import.meta.env.VITE_BACKEND

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    useUserStore.getState().setUser(user);
    axios.post(`${backendURL}/login`, {} , {
      headers: {
        Authorization: `Bearer ${await user.getIdToken()}`,
    }});
    console.log('✅ Logged in user:', user);

    return user;
  } catch (error) {
    console.error('❌ Google Sign-In Error:', error);
    throw error;
  }
};
