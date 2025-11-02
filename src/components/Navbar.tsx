import React from 'react';
import { useUserStore } from '../stores/userStore'; // adjust path
import { signOut, getAuth } from 'firebase/auth';
import '../css_files/Navbar.css';
import { loginWithGoogle } from '../auth/googleLogin';
import { useNavigate } from 'react-router-dom';
import { useSnackBarStore } from '../stores/snackBarStore';

const Navbar: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const auth = getAuth();
  const clearUser = useUserStore((state) => state.clearUser);
  const navigator = useNavigate();
  const createSnackBar = useSnackBarStore((state) => state.createSnackBar);
  
  const logOut = () => {
    if(!window.confirm('Are you sure you want to log out?')) return
    
    signOut(auth)
      .then(() => {
        createSnackBar('Signed out successfully', 'success');
        clearUser();
      })
      .catch((error) => {
        console.error("Sign out error", error);
        createSnackBar('Sign out error, please try again', 'error');
      });

  };

  const goToSubscription = () => {
    navigator('/subscriptions');
  };

  const goToHome = () => {
    navigator('/');
  }

  // const goToLegend = () => {
  //   navigator('/legend');
  // }

  const goToUpload = () => {
    navigator('/upload');
  }

  return (
    <nav className={`navbar`}>

      <h2 className="navbar__title">Triviabara</h2>
      <button className="navbar__item" onClick={goToHome}>Home</button>
      {/* <button className="navbar__item" onClick={goToLegend}>Legend</button> */}
      <button className="navbar__item" onClick={goToUpload}>Generate</button>
      <button className="navbar__item" onClick={goToSubscription}>Subscriptions</button>

      {user && <ul className="navbar__list">
        <button className="navbar__item" onClick={logOut}>Log out</button>
      </ul>}
      {!user && <ul style={{flexGrow: "1", marginLeft: "auto", display: "flex", justifyContent: "flex-end", flexDirection: "row"}} className="navbar__list">
        <button className="navbar__item" onClick={loginWithGoogle}>Sign in</button>
        <button onClick={async () => {
          await loginWithGoogle();
          navigator("/upload");
        }} className="navbar__item" id='getStarted'>Get Started</button>
      </ul>}
      {user && (
        <div className="navbar__user-info">
          {(user.photoURL &&<img
            src={user.photoURL || undefined}
            alt="Profile"
            className="navbar__avatar"
          />)}
          <p style={{ margin: 0 }}>{user.displayName}</p>
        </div>
        ) 
      }
    </nav>
  );
};

export default Navbar;
