import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface FlashcardProps {
  front: string;
  back: string;
  index: number;
}

const Flashcard: React.FC<FlashcardProps> = ({ front, back, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group relative w-full h-64 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-zinc-800 rounded-lg p-6 flex flex-col justify-between border border-zinc-700 shadow-xl group-hover:border-netflix-red transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Concept #{index + 1}</span>
            <RotateCcw className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-lg font-medium text-center text-white">{front}</p>
          <div className="w-full text-center text-xs text-gray-500">Clique pour voir l'explication</div>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-netflix-red rounded-lg p-6 flex flex-col justify-center items-center shadow-xl text-white">
          <p className="text-base text-center font-medium leading-relaxed">{back}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;