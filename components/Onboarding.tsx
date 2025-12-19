import React, { useState } from 'react';
import { Difficulty, UserProfile, AppActions } from '../types';
import { parseHtmlFiles } from '../utils/fileHelpers';
import { NATIVE_COURSES } from '../utils/preloadedContent';
import { Upload, FileText, Play, Layers, BookOpen, User } from 'lucide-react';

interface OnboardingProps {
  onStart: (profile: UserProfile) => void;
  actions: AppActions;
}

const Onboarding: React.FC<OnboardingProps> = ({ onStart, actions }) => {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Bachelor);
  
  // Gestion du contenu (Soit upload, soit sélection native)
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loadingFile, setLoadingFile] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const [animateOut, setAnimateOut] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLoadingFile(true);
      setSelectedCourse(null); // Reset native selection
      const files: File[] = Array.from(e.target.files);
      try {
        const content = await parseHtmlFiles(files);
        setFileContent(content);
        setFileNames(files.map(f => f.name));
      } catch (err) {
        alert("Erreur lors de la lecture des fichiers.");
      } finally {
        setLoadingFile(false);
      }
    }
  };

  const handleSelectNativeCourse = (courseName: string) => {
    setSelectedCourse(courseName);
    setFileContent(NATIVE_COURSES[courseName]);
    setFileNames([]); // Reset file upload
  };

  const handleStart = () => {
    if (name && fileContent) {
      setAnimateOut(true);
      setTimeout(() => {
          onStart({ name, difficulty, content: fileContent });
      }, 800);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto px-4 transition-all duration-700 ${animateOut ? 'scale-150 opacity-0 filter blur-xl' : 'animate-fade-in'}`}>
      
      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-8xl font-display tracking-wide text-white drop-shadow-2xl animate-tudum mb-2 text-shadow-glow">
           WHO'S WATCHING?
        </h1>
        <p className="text-gray-400 text-xl font-light tracking-wide">Configure ton profil pour streamer la connaissance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        
        {/* Colonne Gauche : Profil */}
        <div className="space-y-6 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <User className="w-4 h-4" /> Prénom du spectateur
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ton prénom..."
                    className="w-full bg-black border border-zinc-700 rounded p-4 text-white text-lg focus:outline-none focus:border-netflix-red transition-all placeholder:text-zinc-700"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Niveau de Difficulté</label>
                <div className="space-y-2">
                    {Object.values(Difficulty).map((level) => (
                    <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`w-full p-3 rounded text-sm font-bold border transition-all duration-200 text-left flex items-center justify-between
                        ${difficulty === level 
                            ? 'border-netflix-red bg-netflix-red text-white' 
                            : 'border-zinc-700 bg-black text-gray-500 hover:border-gray-400'
                        }`}
                    >
                        <span>{level}</span>
                        {level === Difficulty.Fougnies && <span className="text-[10px] bg-black/30 px-2 py-1 rounded">HARDCORE</span>}
                    </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Colonne Droite : Contenu */}
        <div className="space-y-6 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 flex flex-col">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Sélection du Programme
            </label>

            {/* Option 1: Cours Pré-chargés */}
            <div className="flex-1">
                <p className="text-xs text-gray-500 mb-2">Séries Originales (Cours Inclus)</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {Object.keys(NATIVE_COURSES).map((courseName) => (
                        <button
                            key={courseName}
                            onClick={() => handleSelectNativeCourse(courseName)}
                            className={`aspect-square flex flex-col items-center justify-center p-2 rounded border transition-all
                            ${selectedCourse === courseName 
                                ? 'border-white bg-zinc-800 scale-105 shadow-lg' 
                                : 'border-zinc-800 bg-black hover:border-zinc-600 opacity-60 hover:opacity-100'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-netflix-red to-black mb-2"></div>
                            <span className="text-xs text-center font-bold leading-tight">{courseName}</span>
                        </button>
                    ))}
                </div>

                {/* Option 2: Upload */}
                <p className="text-xs text-gray-500 mb-2">Ou importez vos propres fichiers</p>
                <div className="relative group">
                    <input
                        type="file"
                        accept=".html,.txt"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full p-4 border-2 border-dashed rounded flex items-center justify-center gap-3 transition-all
                        ${fileNames.length > 0 
                        ? 'border-green-600 bg-green-900/20 text-green-500' 
                        : 'border-zinc-700 bg-black text-zinc-500 group-hover:border-white group-hover:text-white'}`}>
                        
                        {loadingFile ? (
                            <div className="animate-spin h-5 w-5 border-2 border-netflix-red border-t-transparent rounded-full" />
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                <span className="text-sm font-bold">
                                    {fileNames.length > 0 ? `${fileNames.length} fichiers prêts` : "Upload HTML/TXT"}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="mt-10 w-full max-w-md">
        <button
          onClick={handleStart}
          disabled={!name || !fileContent || loadingFile}
          className={`w-full py-4 rounded font-bold text-2xl tracking-widest uppercase transition-all transform active:scale-95 shadow-xl
            ${(!name || !fileContent) 
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
              : 'bg-white text-black hover:bg-netflix-red hover:text-white'}`}
        >
          {loadingFile ? 'Chargement...' : 'Lancer le Quiz'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;