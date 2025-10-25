// components/Pricing.tsx
import React from "react";
import "../css_files/Subscriptions.css";
import axios from "axios";
import { useUserStore } from "../stores/userStore";
import { useSnackBarStore } from "../stores/snackBarStore";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../auth/googleLogin";
const backendURL = import.meta.env.VITE_BACKEND

const Subscriptions: React.FC = () => {

  const user = useUserStore((state) => state.user);
  const navigator = useNavigate();
  const createSnackBar = useSnackBarStore((state) => state.createSnackBar);
  const subscribe = async () => {
    if(!user) {
        createSnackBar("You need to be logged in to subscribe", "error");
        return;
    }
    axios.post(`${backendURL}/subscribe`, {}, {
        headers: {
            Authorization: `Bearer ${await user!.getIdToken()}`
        }
    })
    .then((res) => {
        createSnackBar("You will be redirected to the payment page", "success");
        setTimeout(() => {
            window.location.href = res.data.message.url;
        }, 2000)
    })
    .catch((error) => {
        if(error.response.status === 401) {
            createSnackBar("Please make sure you are logged in", "error");
            return;
        }
        if(error.response.status === 404) {
            createSnackBar("No customer associated with your account", "error");
            return;
        }
        if(error.response.status === 400) {
            createSnackBar("You already have a subscription", "error");
            return;
        }
        if(error.response.status === 500) {
            createSnackBar("Something went wrong. Please try again", "error");
            return;
        }
        createSnackBar("Something went wrong. Make sure you are properly logged in", "error");
    })
  };

  const unsubscribe = async () => {
    if(!user) {
        createSnackBar("You need to be logged in to unsubscribe", "error");
        return;
    }
    axios.post(`${backendURL}/unsubscribe`, {}, {
        headers: {
            Authorization: `Bearer ${await user!.getIdToken()}`
        }
    })
    .then(() => {
        createSnackBar("Successfully unsubscribed. Until the end of your subscription you will still be able to use Triviabara", "success");
    })
    .catch((err) => {
        if(err.response.status === 401) {
            createSnackBar("Please make sure you are logged in", "error");
            return;
        }
        if(err.response.status === 404) {
            createSnackBar("There isn't a subscription associated with your account", "error");
            return;
        }
        if(err.response.status === 400) {
            createSnackBar("No customer associated with your account", "error");
            return;
        }
        if(err.response.status === 500) {
            createSnackBar("Something went wrong. Please try again", "error");
            return;
        }
        createSnackBar("Something went wrong. Make sure you are properly logged in", "error");
    })
  };

  return (
    <div className="main-container">
        <div className="subscriptions-container">
            <div className="subscription-tier">
                <h3>Free</h3>
                <h2>$0</h2>
                <p className="price-subtext">For trying out the app</p>
                <p className="list-subtext">
                    One Time Access
                </p>
                <ul className="features-list">
                    <li>Quiz Creation</li>
                    <li>Custom Prompt</li>
                    <li>PDF Export</li>
                </ul>
                <button onClick={async () => {
                    if(!user) await loginWithGoogle();
                    navigator('/upload');
                }} className="tier-button">Get Started</button>
            </div>
            <div className="subscription-tier" id="premium-tier">
                <h3>Premium</h3>
                <h2>$5</h2>
                <p className="price-subtext">Per user, billed monthly</p>
                <p className="list-subtext">
                    Unlimited Access
                </p>
                <ul className="features-list">
                    <li>Quiz Creation</li>
                    <li>Custom Prompt</li>
                    <li>PDF Export</li>
                    <li>Future Updates</li>
                </ul>
                <button id="preferred-subscription" className="tier-button" onClick={subscribe}>Subscribe</button>
            </div>
        </div>
        <button className="tier-button cancel-button" onClick={unsubscribe}>Cancel Subscription</button>
    </div>
  );
};

export default Subscriptions;
