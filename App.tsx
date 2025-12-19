import React, { useState } from 'react';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Quiz from './components/Quiz';
import Results from './components/Results';
import { AppState, UserProfile, QuizData, FeedbackData, UserAnswers } from './types';
import { generateQuiz, generateFeedback } from './services/geminiService';
import { Loader2 } from 'lucide-react';
import { playSound } from './utils/audioHelpers';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Onboarding);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const handlePlayAudio = (type: 'intro' | 'correct' | 'wrong' | 'win' | 'click') => {
    if (!isMuted) {
      playSound(type);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handleStart = async (profile: UserProfile) => {
    handlePlayAudio('intro');
    setUserProfile(profile);
    setAppState(AppState.GeneratingQuiz);
    
    try {
      const quiz = await generateQuiz(profile.content, profile.difficulty);
      setQuizData(quiz);
      setAppState(AppState.Quiz);
    } catch (error) {
      alert("Échec de la génération du quiz. Veuillez réessayer.");
      setAppState(AppState.Onboarding);
    }
  };

  const handleQuizComplete = async (answers: UserAnswers) => {
    if (!quizData || !userProfile) return;
    
    setAppState(AppState.AnalyzingResults);

    // Calculate Score Locally
    let score = 0;
    const wrongAnswers: { question: any, selectedIndex: number }[] = [];

    quizData.questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        score++;
      } else {
        wrongAnswers.push({
          question: q,
          selectedIndex: answers[q.id] !== undefined ? answers[q.id] : -1
        });
      }
    });
    setFinalScore(score);

    // Play Win sound if score is decent
    if (score > quizData.questions.length / 2) {
      setTimeout(() => handlePlayAudio('win'), 500);
    }

    // Generate Feedback
    try {
      const feedback = await generateFeedback(
        userProfile.name,
        score,
        quizData.questions.length,
        wrongAnswers,
        userProfile.difficulty
      );
      setFeedbackData(feedback);
      setAppState(AppState.Results);
    } catch (error) {
      console.error("Feedback error", error);
      setAppState(AppState.Results);
      setFeedbackData({
        feedback: "Le Coach est parti prendre un café (Erreur API). Mais bravo pour l'effort !",
        flashcards: []
      });
    }
  };

  const handleRestart = () => {
    setAppState(AppState.Onboarding);
    setUserProfile(null);
    setQuizData(null);
    setFeedbackData(null);
    setFinalScore(0);
  };

  const appActions = { playAudio: handlePlayAudio, toggleMute, isMuted };

  const renderContent = () => {
    switch (appState) {
      case AppState.Onboarding:
        return <Onboarding onStart={handleStart} actions={appActions} />;
      
      case AppState.GeneratingQuiz:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fade-in">
            <div className="relative">
                <div className="absolute inset-0 bg-netflix-red blur-2xl opacity-40 rounded-full animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-netflix-red animate-spin relative z-10" />
            </div>
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Production de la Saison 1...</h2>
                <p className="text-gray-400 mt-2">Les scénaristes (IA) analysent vos notes.</p>
            </div>
          </div>
        );

      case AppState.Quiz:
        return quizData && userProfile ? (
          <Quiz 
            data={quizData} 
            difficulty={userProfile.difficulty} 
            onComplete={handleQuizComplete} 
            onExit={handleRestart}
            actions={appActions} 
          />
        ) : null;

      case AppState.AnalyzingResults:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fade-in">
             <div className="relative">
                <div className="absolute inset-0 bg-netflix-red blur-2xl opacity-40 rounded-full animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-netflix-red animate-spin relative z-10" />
            </div>
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Le Coach visionne les rushs...</h2>
                <p className="text-gray-400 mt-2">Analyse de ta performance en cours.</p>
            </div>
          </div>
        );

      case AppState.Results:
        return feedbackData && userProfile ? (
          <Results 
            score={finalScore} 
            total={quizData?.questions.length || 20} 
            data={feedbackData} 
            onRestart={handleRestart}
            userName={userProfile.name}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Layout showNav={appState !== AppState.GeneratingQuiz && appState !== AppState.AnalyzingResults} actions={appActions}>
      {renderContent()}
    </Layout>
  );
};

export default App;