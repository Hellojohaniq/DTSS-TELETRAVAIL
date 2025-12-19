import React, { useState, useEffect } from 'react';
import { QuizData, UserAnswers, AppActions, Difficulty } from '../types';
import { CheckCircle2, XCircle, ChevronRight, Clock, HelpCircle, Power } from 'lucide-react';

interface QuizProps {
  data: QuizData;
  difficulty: Difficulty;
  onComplete: (answers: UserAnswers) => void;
  onExit: () => void;
  actions: AppActions;
}

const getTimerForDifficulty = (diff: Difficulty): number => {
  switch (diff) {
    case Difficulty.Bachelor: return 45;
    case Difficulty.Master: return 30;
    case Difficulty.Fougnies: return 20;
    default: return 30;
  }
};

const Quiz: React.FC<QuizProps> = ({ data, difficulty, onComplete, onExit, actions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const TIMER_DURATION = getTimerForDifficulty(difficulty);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  
  const currentQuestion = data.questions[currentIndex];
  const progress = ((currentIndex) / data.questions.length) * 100;
  
  // Timer Logic
  useEffect(() => {
    setTimeLeft(TIMER_DURATION);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, TIMER_DURATION]);

  const handleOptionSelect = (optionIndex: number) => {
    if (answers[currentQuestion.id] !== undefined || timeLeft === 0) return; // Prevent changing answer
    
    // NOTE: Sons désactivés pendant le quiz selon la demande utilisateur
    // if (optionIndex === currentQuestion.correct) actions.playAudio('correct');
    // else actions.playAudio('wrong');

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const handleNext = () => {
    actions.playAudio('click');
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const isAnswered = answers[currentQuestion.id] !== undefined;
  const isTimeUp = timeLeft === 0 && !isAnswered;

  return (
    <div className="animate-slide-up max-w-4xl mx-auto w-full pb-10">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-zinc-800 fixed top-0 left-0 z-50">
        <div 
          className="h-full bg-netflix-red transition-all duration-300 ease-out shadow-[0_0_10px_rgba(229,9,20,0.7)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header Info */}
      <div className="mb-6 mt-4 flex items-center justify-between px-2">
        <div className="flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Progression
            </span>
            <span className="text-xl font-black text-white">
                {currentIndex + 1} <span className="text-zinc-600">/ {data.questions.length}</span>
            </span>
        </div>
        
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded border transition-colors
            ${timeLeft < 10 ? 'border-netflix-red bg-red-900/20 text-netflix-red animate-pulse' : 'border-zinc-700 bg-zinc-800 text-white'}`}>
            <Clock className="w-5 h-5" /> 
            <span>00:{timeLeft.toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative">
        {/* Cinematic top bar */}
        <div className="h-2 w-full bg-gradient-to-r from-zinc-800 via-netflix-red to-zinc-800 opacity-20"></div>

        <div className="p-6 md:p-10">
            <div className="flex items-start gap-4 mb-8">
                <div className="mt-1 hidden md:block">
                     <HelpCircle className="w-8 h-8 text-netflix-red opacity-80" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white">
                    {currentQuestion.text}
                </h2>
            </div>

            <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                const isCorrect = currentQuestion.correct === idx;
                
                // Styles dynamiques pour le feedback immédiat
                let containerClass = "border-zinc-700 bg-zinc-800/50 text-gray-300 hover:border-gray-500 hover:bg-zinc-800";
                let icon = <span className="text-zinc-500 text-xs font-bold">OPTION {String.fromCharCode(65 + idx)}</span>;

                if (isAnswered || isTimeUp) {
                    // État après réponse ou temps écoulé
                    if (isCorrect) {
                        // C'est la bonne réponse (qu'elle soit choisie ou non, on la montre en vert)
                        containerClass = "border-green-500 bg-green-900/20 text-white ring-1 ring-green-500/50";
                        icon = <CheckCircle2 className="w-6 h-6 text-green-500" />;
                    } else if (isSelected) {
                        // Mauvaise réponse sélectionnée
                        containerClass = "border-netflix-red bg-red-900/20 text-white ring-1 ring-netflix-red/50";
                        icon = <XCircle className="w-6 h-6 text-netflix-red" />;
                    } else {
                        // Autres options non choisies
                        containerClass = "border-zinc-800 bg-zinc-900/50 text-zinc-600 opacity-50";
                    }
                }

                return (
                <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={isAnswered || isTimeUp}
                    className={`w-full text-left p-4 md:p-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden
                    ${containerClass} 
                    ${(!isAnswered && !isTimeUp) && 'hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]'}`}
                >
                    <div className="flex items-center gap-4 relative z-10 w-full pr-8">
                        <span className="text-base md:text-lg font-medium">{option}</span>
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {icon}
                    </div>
                </button>
                );
            })}
            </div>
            
            {/* Message Temps Écoulé */}
            {isTimeUp && !isAnswered && (
                <div className="mt-4 p-3 bg-red-900/30 border border-netflix-red/50 rounded text-center text-netflix-red font-bold animate-pulse">
                    TROP LENT ! TEMPS ÉCOULÉ.
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="bg-black/20 p-6 flex justify-between items-center border-t border-zinc-800 backdrop-blur-sm">
             <div className="text-xs text-zinc-600 uppercase tracking-wider font-bold hidden md:block">
                 Série Originale EduFlix • {difficulty}
             </div>
             <button
                onClick={handleNext}
                disabled={(!isAnswered && !isTimeUp)}
                className={`ml-auto flex items-center gap-2 px-8 py-3 rounded font-bold text-lg transition-all duration-300 uppercase tracking-wide shadow-lg
                ${(isAnswered || isTimeUp)
                    ? 'bg-white text-black hover:bg-gray-200 hover:scale-105 hover:shadow-white/20' 
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'}`}
            >
                {currentIndex === data.questions.length - 1 ? 'Voir le verdict' : 'Suivant'}
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Emergency Stop Button - Below the Test */}
      <div className="mt-12 flex justify-center">
        <button 
          onClick={onExit}
          className="group flex items-center gap-2 px-6 py-2 rounded-full bg-transparent border border-zinc-700 text-zinc-500 hover:border-netflix-red hover:text-netflix-red transition-all duration-300"
        >
            <Power className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-widest uppercase">Arrêt d'urgence</span>
        </button>
      </div>
    </div>
  );
};

export default Quiz;