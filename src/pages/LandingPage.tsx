import { useEffect, useRef, useState } from "react";
import "../css_files/LandingPage.css"
import { Tooltip } from "@mui/material";
import { loginWithGoogle } from "../auth/googleLogin";
import { useNavigate } from 'react-router-dom';
import { useUserStore } from "../stores/userStore";

const LandingPage: React.FC = () => {

    const elementRef = useRef<HTMLHeadingElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const navigator = useNavigate();
    const user = useUserStore((state) => state.user);

     useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    // Cleanup function to unobserve when the component unmounts
    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

    return (
        <div className="container">
            <div className="title-container">
                <h1>Learn Smarter with <br /> <span className="animated-background-text">AI-Generated Quizzes</span></h1>
                <p>Generate multiple choice questions and test your knowledge</p>
            </div>
            <div className="button-container">
                <button onClick={async () => {
                    if(!user) 
                        await loginWithGoogle();
                    navigator("/upload");
                }} className="start-button">Start Learning Now</button>
            </div>
            <div className="offer-container">
                <div className="offer-content">
                    <div className="row-content" style={{display: "flex", flexDirection: "row", gap: "1rem"}}>
                        <div>
                            <h3>Upload Your Document</h3>
                            <p>
                                We processes your file, extracting key information and organizing it into a format that is ready for learning and question generation.
                            </p>
                        </div>
                        <div>
                            <h3>Customize Your AI Prompt</h3>
                            <p>
                                Tailor your learning experience. Specify a custom prompt to guide the AI and receive questions that are perfectly aligned with your study goals.
                            </p>
                        </div>
                        <div>
                            <h3>Generate Your Questions</h3>
                            <p>
                                 The AI analyzes your material to create high-quality, thought-provoking multiple-choice questions that test your comprehension and critical thinking.
                            </p>
                        </div>
                    </div>
                    <div className="row-content" style={{display: "flex", flexDirection: "row", gap: "1rem"}}>

                        <div>
                            <h3>Test your knowledge</h3>
                            <p>
                                Learn as you go. Instantly check your answers after each question and gain immediate feedback to reinforce your understanding.
                            </p>
                        </div>
                        <div>
                            <h3>Keep Going</h3>
                            <p>
                                Continue your progress with seamless transitions. Quickly move on to new questions and maintain a steady learning rhythm.
                            </p>
                        </div>
                        <div>
                            <h3>Download Study Sheets</h3>
                            <p>
                                 Create custom study materials. Generate and download PDF files of your questions and answers to review offline at your convenience.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
            <div  className="more-container">
                <h2 ref={elementRef} className={`fade-in ${isVisible ? 'visible' : ''}`}>Even More <br /> On The <span className="animated-background-text">Horizon</span></h2>
                <div className="circle-container">
                    <Tooltip title=" Get a full breakdown of the reasoning behind each correct answer, so you can truly understand the material and not just memorize it." placement="bottom">

                    <div className="timeline-item">
                        <div className="timeline-text top">Detailed Explanations</div>
                        <div className="timeline-circle"></div>
                    </div>
                    </Tooltip>

                    <Tooltip title="Take full control of your test. Choose the number of questions, specify the number of answer choices, and define how many of them are correct." placement="top">

                    <div className="timeline-item">
                        <div className="timeline-text bottom">Advanced Customization</div>
                        <div className="timeline-circle"></div>
                    </div>
                    </Tooltip>
                    <Tooltip title="The AI will more accurately follow your instructions, ensuring the questions it generates are perfectly aligned with your unique study needs." placement="bottom">
                        <div className="timeline-item">
                            <div className="timeline-text top">Pinpoint Prompts</div>
                            <div className="timeline-circle"></div>
                        </div>
                    </Tooltip>
                    <Tooltip title="We run each question through multiple AI checks to drastically reduce errors and ensure the highest level of correctness for every answer." placement="top">
                    <div className="timeline-item">
                        <div className="timeline-text bottom">Fact-Checked Answers</div>
                        <div className="timeline-circle"></div>
                    </div>
                    </Tooltip>
                    <Tooltip title="Discover, share, and use quizzes created by other users. Find curated tests for specific topics like the driving exam and more." placement="bottom">
                    <div className="timeline-item">
                        <div className="timeline-text top">Community Library</div>
                        <div className="timeline-circle"></div>
                    </div>
                    </Tooltip>
                    <hr></hr>
                    </div>
                </div>
            </div> 
    )
}

export default LandingPage;