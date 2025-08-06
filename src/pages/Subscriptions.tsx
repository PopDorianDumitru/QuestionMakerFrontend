// components/Pricing.tsx
import React from "react";
import "../css_files/Subscriptions.css";
import axios from "axios";
import { useUserStore } from "../stores/userStore";
import { useSnackBarStore } from "../stores/snackBarStore";
const backendURL = import.meta.env.VITE_BACKEND

const Subscriptions: React.FC = () => {

  const user = useUserStore((state) => state.user);
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
        <h1>Subscriptions</h1>
        <div className="subscriptions-container">
            <div>
                <h3>Free Tier</h3>
                <ul>
                    <li>Allows creation of one quizz</li>
                </ul>
            </div>
            <div>
                <h3>Paid Tier</h3>
                <ul>
                    <li>Allows unlimited quizz creations</li>
                </ul>
                <p><strong>Price: 5$ (25 lei) per month</strong></p>
                <button onClick={subscribe}>Subscribe</button>
            </div>
        </div>
        <button onClick={unsubscribe}>Cancel Subscription</button>
    </div>
  );
};

export default Subscriptions;
