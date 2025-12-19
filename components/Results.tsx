import React from 'react';
import { FeedbackData } from '../types';
import Flashcard from './Flashcard';
import { RotateCw, Home } from 'lucide-react';

interface ResultsProps {
  score: number;
  total: number;
  data: FeedbackData;
  onRestart: () => void;
  userName: string;
}

const Results: React.FC<ResultsProps> = ({ score, total, data, onRestart, userName }) => {
  const percentage = Math.round((score / total) * 100);
  
  let scoreColor = 'text-green-500';
  if (percentage < 50) scoreColor = 'text-netflix-red';
  else if (percentage < 80) scoreColor = 'text-yellow-500';

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-12">
      {/* Hero / Score Section */}
      <div className="relative w-full bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl p-8 md:p-12 text-center">
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-netflix-red via-transparent to-netflix-red opacity-50"></div>
         
         <h1 className="text-4xl md:text-5xl font-bold mb-4">Le Verdict</h1>
         <div className={`text-8xl md:text-9xl font-black mb-6 ${scoreColor} tracking-tighter`}>
            {score}<span className="text-4xl text-gray-500">/{total}</span>
         </div>

         <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 max-w-2xl mx-auto relative">
            <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-netflix-red text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-widest">
                Note du Coach
            </span>
            <p className="text-lg md:text-xl italic text-gray-300">"{data.feedback}"</p>
         </div>

         <div className="mt-8 flex justify-center gap-4">
            <button 
                onClick={onRestart}
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-bold hover:bg-gray-200 transition-colors"
            >
                <RotateCw className="w-5 h-5" /> Rejouer
            </button>
         </div>
      </div>

      {/* Remediation Section */}
      {data.flashcards.length > 0 && (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-1 h-8 bg-netflix-red block"></span>
                Deck de Révision
                <span className="text-sm font-normal text-gray-400 ml-auto">
                    {data.flashcards.length} Cartes Générées
                </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.flashcards.map((card, idx) => (
                    <Flashcard key={idx} index={idx} front={card.front} back={card.back} />
                ))}
            </div>
        </div>
      )}
      
      {data.flashcards.length === 0 && (
          <div className="text-center py-12 text-gray-500">
              <p>Aucune révision nécessaire. Tu es une machine ! (Ou tu as triché.)</p>
          </div>
      )}
    </div>
  );
};

export default Results;