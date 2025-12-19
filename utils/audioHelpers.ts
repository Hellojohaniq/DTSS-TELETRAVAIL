// Un synthétiseur audio simple utilisant l'API Web Audio
// Cela évite les problèmes de chargement de fichiers MP3 externes ou de CORS

let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playSound = (type: 'intro' | 'correct' | 'wrong' | 'win' | 'click') => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'intro':
        // Effet "Tudum" (Grave et percutant)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.8, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        osc.start(now);
        osc.stop(now + 1.5);
        break;

      case 'correct':
        // Tling positif (Tierce majeure)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // Do
        osc.frequency.setValueAtTime(659.25, now + 0.1); // Mi
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'wrong':
        // Buzzer grave
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'win':
        // Arpège de victoire
        const notes = [523.25, 659.25, 783.99, 1046.50]; // Do Majeur
        notes.forEach((note, i) => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(note, now + i * 0.1);
          gain2.gain.setValueAtTime(0, now + i * 0.1);
          gain2.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.05);
          gain2.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 1);
          
          osc2.start(now + i * 0.1);
          osc2.stop(now + i * 0.1 + 1);
        });
        break;

      case 'click':
        // Petit click UI
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
    }
  } catch (e) {
    console.error("Erreur audio:", e);
  }
};