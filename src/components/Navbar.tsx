import React, { useState } from 'react';
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
  
  const [isOpen, setIsOpen] = useState(true);

  const toggleNavbar = () => {
    setIsOpen((prev) => !prev);
  };

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

  return (
    <nav className={`navbar ${isOpen ? '' : 'closed'}`}>
      <button className="toggle-button" onClick={toggleNavbar} aria-label="Toggle sidebar">
        {isOpen ? '←' : '→'}
      </button>

      <h2 className="navbar__title">Triviabara</h2>
      <button className="navbar__item" onClick={goToHome}>Home</button>
      {/* <button className="navbar__item" onClick={goToLegend}>Legend</button> */}
      <button className="navbar__item" onClick={goToSubscription}>Subscriptions</button>
      {user && <ul className="navbar__list">
        <button className="navbar__item" onClick={logOut}>Log out</button>
      </ul>}
      {!user && <ul className="navbar__list">
        <button className="navbar__item" onClick={loginWithGoogle}>Log in</button>
      </ul>}
      {user ? (
        <div className="navbar__user-info">
          <img
            src={user.photoURL || undefined}
            alt="Profile"
            className="navbar__avatar"
          />
          <p style={{ margin: 0 }}>{user.displayName}</p>
        </div>
      ) : isOpen && (
        <p style={{ marginTop: 'auto', color: '#ccc', textWrap: 'nowrap' }}>Not logged in</p>
      )}
    </nav>
  );
};

export default Navbar;
