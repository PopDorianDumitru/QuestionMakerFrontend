import { Routes, Route } from 'react-router-dom';
import Home from "../pages/Home";
import SlideMCQGenerator from '../pages/SlideMCQGenerator';
import Subscriptions from '../pages/Subscriptions';
import SubscribeFail from '../pages/SubscribeFail';
import SubscribeSuccess from '../pages/SubscribeSuccess';
import AllQuestionsPage from '../pages/AllQuestionsPage';
import GeneratedQuestion from '../pages/GeneratedQuestion';
import LandingPage from '../pages/LandingPage';
// import ExamLegend from '../pages/ExamLegend';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/question" element={<SlideMCQGenerator />} />
    <Route path="/subscriptions" element={<Subscriptions />} />
    <Route path="/subscribe/success" element={<SubscribeSuccess />} />
    <Route path="/subscribe/cancel" element={<SubscribeFail />}/>
    <Route path="/allQuestions" element={<AllQuestionsPage />} />
    <Route path="/generatedQuestion" element={<GeneratedQuestion />} />
    <Route path="/upload" element={<Home />} />
  </Routes>
);

export default AppRoutes;
