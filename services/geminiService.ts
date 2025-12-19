import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizData, FeedbackData, Difficulty, QuizQuestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          text: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correct: { 
            type: Type.INTEGER, 
            description: "Zero-based index of the correct option (0, 1, 2, or 3)" 
          }
        },
        required: ["id", "text", "options", "correct"],
        propertyOrdering: ["id", "text", "options", "correct"]
      }
    }
  },
  required: ["questions"]
};

const feedbackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    feedback: { type: Type.STRING, description: "Humorous, sarcastic, coach-style feedback based on score" },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          front: { type: Type.STRING, description: "The concept or question missed" },
          back: { type: Type.STRING, description: "Clear, concise explanation/remediation" }
        },
        required: ["front", "back"],
        propertyOrdering: ["front", "back"]
      }
    }
  },
  required: ["feedback", "flashcards"]
};

export const generateQuiz = async (content: string, difficulty: Difficulty): Promise<QuizData> => {
  const modelId = 'gemini-2.5-flash';
  
  let promptNuance = "";
  switch (difficulty) {
    case Difficulty.Bachelor:
      promptNuance = "Niveau Bachelor : Questions fondamentales, définitions. Timer 45s. Reste accessible.";
      break;
    case Difficulty.Master:
      promptNuance = "Niveau Master : Questions d'analyse et de synthèse. Timer 30s. Demande de la réflexion.";
      break;
    case Difficulty.Fougnies:
      promptNuance = "MODE MONSIEUR FOUGNIES (EXPERT) : Questions pièges, détails obscurs, exceptions. Timer 20s. Sois impitoyable.";
      break;
  }

  const prompt = `
    Tu es un créateur de jeux télévisés éducatifs expert. Analyse le contenu de cours suivant :
    "${content.substring(0, 800000)}..."

    TA MISSION : Générer un quiz captivant de 20 questions à choix multiples (4 options par question) en FRANÇAIS.
    DIFFICULTÉ : ${difficulty}. ${promptNuance}
    
    IMPORTANT : VARIE LES FORMATS DE QUESTIONS (Gamification). Ne fais pas que des questions standard "Quelle est...".
    Utilise ce mix de formats :
    1. Standard (Quelle est la définition de...)
    2. Vrai ou Faux (Formulé en QCM : "L'affirmation suivante est VRAIE...")
    3. L'Intrus (Parmi ces 4 propositions, laquelle est fausse/n'a pas sa place ?)
    4. Phrase à trous (Complétez : "Le concept de X implique Y et...")
    5. Mise en situation (Cas pratique court)

    Assure-toi que la structure JSON correspond exactement au schéma fourni.
    Le champ 'correct' doit être l'index (0-3) de la bonne réponse.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.7 
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizData;
    }
    throw new Error("Pas de réponse texte de Gemini");
  } catch (error) {
    console.error("Échec de la génération du quiz", error);
    throw error;
  }
};

export const generateFeedback = async (
  name: string, 
  score: number, 
  total: number, 
  wrongAnswers: { question: QuizQuestion, selectedIndex: number }[],
  difficulty: Difficulty
): Promise<FeedbackData> => {
  const modelId = 'gemini-2.5-flash';

  const wrongAnswersContext = wrongAnswers.map(w => 
    `Question : "${w.question.text}". \nBonne réponse : "${w.question.options[w.question.correct]}". \nRéponse de l'élève : "${w.selectedIndex >= 0 ? w.question.options[w.selectedIndex] : 'Temps écoulé'}".`
  ).join("\n---\n");

  const prompt = `
    Tu es une IA éducative avec la personnalité d'un "Coach Sportif un peu fou" et sarcastique.
    Élève : ${name}
    Score : ${score}/${total}
    Niveau : ${difficulty}
    Langue : FRANÇAIS.
    
    Génère un feedback COURT (max 2 phrases) et percutant.
    - <10/20 : "C'est la catastrophe. [Nom], tu dors ?"
    - >16/20 : "Pas mal du tout. Mais je t'ai vu hésiter."
    
    RÈGLE SPÉCIALE MONSIEUR FOUGNIES (<16/20) :
    - "DÉSHONNEUR ! C'est nul. Recommence immédiatement avant que je m'énerve."

    Génère aussi les Flashcards correctives pour les erreurs ci-dessous (Recto: Question, Verso: Explication simple).
    
    Erreurs :
    ${wrongAnswersContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: feedbackSchema,
        temperature: 0.8
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FeedbackData;
    }
    throw new Error("Pas de réponse texte de Gemini");
  } catch (error) {
    return {
      feedback: `Hey ${name}, l'IA est fatiguée. Score : ${score}.`,
      flashcards: []
    };
  }
};