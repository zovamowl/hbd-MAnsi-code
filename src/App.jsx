// src/App.jsx

import React, { useEffect, useState, useRef } from "react";
import bgMusic from "./assets/peaceful.mp3";
import doorSound from "./assets/door.mp3";
import barkSound from "./assets/bark.mp3";


// Character and dog directional sprites
import girlUp from "./assets/SorceressUpRun-ezgif.com-apng-to-gif-converter.gif";
import girlDown from "./assets/SorceressDownRun-ezgif.com-crop.png";
import girlLeft from "./assets/SorceressLeftRun-ezgif.com-crop.png";
import girlRight from "./assets/SorceressRightRun-ezgif.com-crop.png";

import dogUp from "./assets/dog-up.png";
import dogDown from "./assets/dog-down.png";
import dogLeft from "./assets/dog-left.png";
import dogRight from "./assets/dog-right.png";

import "../index.css";

// QUIZ, GUESS, JUMBLE setup
const quizQuestions = [
  { q: "What’s the smallest prime number?", a: "2" },
  { q: "Which planet is known as the Red Planet?", a: "mars" },
  { q: "What animal is often associated with wisdom?", a: "owl" }, // 🦉 Owl question
  { q: "What’s the square root of 144?", a: "12" },
  { q: "Which country has Tokyo as its capital?", a: "japan" }
];

const drawGuesses = ["owl", "oven", "astronaut", "bedroom", "mansi", "doy toys"];
const drawGuessImages = Object.entries(
  import.meta.glob("./assets/guesses/*.{png,jpg,jpeg}", { eager: true })
)
  .filter(([path, mod]) => mod && mod.default)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, mod]) => mod.default);

const jumbledWords = [
  { jumble: "YDNAC", word: "candy" },
  { jumble: "ZAPIZ", word: "pizza" },
  { jumble: "RACLOO", word: "color" },
  { jumble: "NRNCIOU", word: "unicorn" }
];

const levelMessages = [
  "Use your brain to unlock the door of wisdom! 🧠🔓",
  "Time for a draw guess game!",
  "Grab those sparkling diamonds before they vanish! 💎✨",
  "Twist, shuffle, solve! Let’s untangle the mystery words! 🔤🧩",
  "Whispers float through the garden breeze… maybe it’s calling you. 🌬️🌸"
];

const slideshows = {
  1: import.meta.glob('./assets/level1/*.{png,jpg,jpeg}', { eager: true }),
  2: import.meta.glob('./assets/level2/*.{png,jpg,jpeg}', { eager: true }),
  3: import.meta.glob('./assets/level3/*.{png,jpg,jpeg}', { eager: true }),
  4: import.meta.glob('./assets/level4/*.{png,jpg,jpeg}', { eager: true }),
  5: import.meta.glob('./assets/level5/*.{png,jpg,jpeg}', { eager: true })
};

export default function App() {
  const [level, setLevel] = useState(0);
  const [gamePhase, setGamePhase] = useState("intro");
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideshowImages, setSlideshowImages] = useState([]);
  const [showLevelMessage, setShowLevelMessage] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [answers, setAnswers] = useState(Array(quizQuestions.length).fill(""));
  const [guessInput, setGuessInput] = useState("");
  const [currentGuess, setCurrentGuess] = useState(0);
  const [jumbleInput, setJumbleInput] = useState("");
  const [jumbleIndex, setJumbleIndex] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [falling, setFalling] = useState([]);
  const [trees, setTrees] = useState([]);

  const [characterPos, setCharacterPos] = useState({ x: 150, y: 300 });
  const [characterDir, setCharacterDir] = useState("down");
  const [dogPos, setDogPos] = useState({ x: 120, y: 330 });
  const [dogDir, setDogDir] = useState("down");
  const [brotherPos, setBrotherPos] = useState({ x: 800, y: 100 });
  const [sisterPos, setSisterPos] = useState({ x: 200, y: 400 });
  const [gardenMessage, setGardenMessage] = useState("");

  const characterRef = useRef();
  const doorRef = useRef();
  const audioRef = useRef(null);
  const barkRef = useRef(new Audio(barkSound));

  const directionMap = {
    up: girlUp,
    down: girlDown,
    left: girlLeft,
    right: girlRight
  };

  const dogSpriteMap = {
    up: dogUp,
    down: dogDown,
    left: dogLeft,
    right: dogRight
  };

  const loadSlideshow = (nextLevel) => {
    const context = slideshows[nextLevel] || {};
    const images = Object.values(context).map((mod) => mod.default);
    setSlideshowImages(images);
    setSlideIndex(0);
    setGamePhase("slideshow");
    setLevel(nextLevel);
  };

  useEffect(() => {
    const audio = new Audio(bgMusic);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
  }, []);

  useEffect(() => {
    const startMusic = () => {
      if (!audioRef.current || musicPlaying) return;
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
      window.removeEventListener("click", startMusic);
      window.removeEventListener("keydown", startMusic);
    };
    window.addEventListener("click", startMusic);
    window.addEventListener("keydown", startMusic);
    return () => {
      window.removeEventListener("click", startMusic);
      window.removeEventListener("keydown", startMusic);
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    musicPlaying ? audio.pause() : audio.play();
    setMusicPlaying(!musicPlaying);
  };

  useEffect(() => {
    if (gamePhase === "slideshow" && slideIndex >= slideshowImages.length) {
      setShowLevelMessage(true);
      setGamePhase("levelMessage");
      setTimeout(() => {
        setShowLevelMessage(false);
        setGamePhase("playing");
      }, 2000);
    }
  }, [slideIndex, slideshowImages.length, gamePhase]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      setCharacterPos((prev) => {
        const step = 10;
        let { x, y } = prev;
        let dir = characterDir;
        if (e.key === "ArrowLeft") { x -= step; dir = "left"; }
        else if (e.key === "ArrowRight") { x += step; dir = "right"; }
        else if (e.key === "ArrowUp") { y -= step; dir = "up"; }
        else if (e.key === "ArrowDown") { y += step; dir = "down"; }
        setCharacterDir(dir);
        return { x, y };
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [characterDir]);

  useEffect(() => {
    if (level === 0 && gamePhase === "intro" && characterRef.current && doorRef.current) {
      const char = characterRef.current.getBoundingClientRect();
      const door = doorRef.current.getBoundingClientRect();
      const overlap =
        char.x < door.x + door.width &&
        char.x + char.width > door.x &&
        char.y < door.y + door.height &&
        char.y + char.height > door.y;
      if (overlap) {
        new Audio(doorSound).play();
        setTimeout(() => loadSlideshow(1), 1000);
      }
    }
  }, [characterPos, level, gamePhase]);

  useEffect(() => {
    if (level === 3 && gamePhase === "playing") {
      const dropInterval = setInterval(() => {
        setFalling((prev) => [...prev, { id: Date.now(), top: 0, left: Math.random() * 90 }]);
      }, 1000);
      const moveInterval = setInterval(() => {
        setFalling((prev) =>
          prev.map((d) => ({ ...d, top: d.top + 5 })).filter((d) => d.top < 100)
        );
      }, 200);
      return () => {
        clearInterval(dropInterval);
        clearInterval(moveInterval);
      };
    }
  }, [level, gamePhase]);

  useEffect(() => {
    if (level === 5 && gamePhase === "playing") {
      const interval = setInterval(() => {
        setDogPos((dog) => {
          const dx = characterPos.x - dog.x;
          const dy = characterPos.y - dog.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 10) return dog;
          const speed = 5;
          const nextX = dog.x + (dx / distance) * speed;
          const nextY = dog.y + (dy / distance) * speed;
          const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
          setDogDir(dir);
          return { x: nextX, y: nextY };
        });

        const distToBrother = Math.hypot(characterPos.x - brotherPos.x, characterPos.y - brotherPos.y);
        const distToSister = Math.hypot(characterPos.x - sisterPos.x, characterPos.y - sisterPos.y);

        if (distToBrother < 100) {
          setGardenMessage("Hrishi: You cant catch me try 🤣");
          setBrotherPos(pos => ({
            x: pos.x + Math.random() * 60 - 30,
            y: pos.y + Math.random() * 40 - 20
          }));
          barkRef.current.play();
        } else if (distToSister < 100) {
          setGardenMessage("JESSY: 🎉 HAPPY BIRTHDAY MANSI 💖\n👧🏽 Always remember you have a *Dii* who's here to listen, support, and love you unconditionally. 💌\nNever hesitate to share your thoughts, fears, or dreams with me. 🌈\nKeep smiling always 😄 and know that you're deeply loved. ❤️✨");
          barkRef.current.play();
        } else {
          setGardenMessage("");
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [characterPos, level, gamePhase]);

  const handleQuizSubmit = () => {
    const allCorrect = answers.every((ans, i) => ans.trim().toLowerCase() === quizQuestions[i].a);
    allCorrect ? loadSlideshow(2) : alert("Some answers are wrong!");
  };

  const handleGuessSubmit = () => {
    if (guessInput.trim().toLowerCase() === drawGuesses[currentGuess]) {
      if (currentGuess + 1 >= drawGuesses.length) loadSlideshow(3);
      else setCurrentGuess((i) => i + 1);
      setGuessInput("");
    } else alert("Wrong guess!");
  };

  const handleDiamondClick = (id) => {
    setDiamonds((prev) => prev + 1);
    setFalling((prev) => prev.filter((d) => d.id !== id));
    if (diamonds + 1 >= 20) loadSlideshow(4);
  };

  const handleJumbleSubmit = () => {
    if (jumbleInput.trim().toLowerCase() === jumbledWords[jumbleIndex].word) {
      if (jumbleIndex + 1 >= jumbledWords.length) loadSlideshow(5);
      else setJumbleIndex((i) => i + 1);
      setJumbleInput("");
    } else alert("Try again!");
  };

  const handlePlantTree = () => {
    if (diamonds > 0) {
      setDiamonds((d) => d - 1);
      setTrees((t) => [...t, { x: Math.random() * 800, y: Math.random() * 400 }]);
    }
  };

  return (
    <div className={`scene ${level === 5 ? "garden-bg" : ""}`}>
      <button onClick={toggleMusic}>{musicPlaying ? "🔊 Music On" : "🔇 Music Off"}</button>

      {gamePhase === "intro" && (
        <>
          <h1>🎉 Welcome to the HAGO World!</h1>
          <img ref={characterRef} src={directionMap[characterDir]} className="character" style={{ left: characterPos.x, top: characterPos.y }} />
          <div ref={doorRef} className="door">🚪</div>
        </>
      )}

      {gamePhase === "slideshow" && (
        <div className="slideshow">
          <img src={slideshowImages[slideIndex]} onClick={() => setSlideIndex((i) => i + 1)} />
        </div>
      )}

      {showLevelMessage && <div className="level-msg">{levelMessages[level - 1]}</div>}

      {gamePhase === "playing" && level === 1 && (
        <div className="quiz">
          {quizQuestions.map((q, i) => (
            <div key={i}>
              <p>{q.q}</p>
              <input value={answers[i]} onChange={(e) => {
                const updated = [...answers];
                updated[i] = e.target.value;
                setAnswers(updated);
              }} />
            </div>
          ))}
          <button onClick={handleQuizSubmit}>Submit Answers</button>
        </div>
      )}

      {gamePhase === "playing" && level === 2 && (
        <div className="guess">
          <p>Guess this drawing: {currentGuess + 1} of {drawGuesses.length}</p>
          <img src={drawGuessImages[currentGuess]} className="guess-image" alt="Hint" />
          <input value={guessInput} onChange={(e) => setGuessInput(e.target.value)} />
          <button onClick={handleGuessSubmit}>Guess</button>
        </div>
      )}

      {gamePhase === "playing" && level === 3 && (
        <div className="diamonds">
          {falling.map((d) => (
            <div key={d.id} className="diamond" style={{ left: `${d.left}%`, top: `${d.top}%` }} onClick={() => handleDiamondClick(d.id)}>💎</div>
          ))}
          <p>Collected: {diamonds} / 20</p>
        </div>
      )}

      {gamePhase === "playing" && level === 4 && (
        <div className="jumble">
          <p>Unscramble: {jumbledWords[jumbleIndex].jumble}</p>
          <input value={jumbleInput} onChange={(e) => setJumbleInput(e.target.value)} />
          <button onClick={handleJumbleSubmit}>Submit</button>
        </div>
      )}

      {gamePhase === "playing" && level === 5 && (
        <>
          <img src={directionMap[characterDir]} className="character" style={{ left: characterPos.x, top: characterPos.y }} />
          <img src={dogSpriteMap[dogDir]} className="dog" style={{ left: dogPos.x, top: dogPos.y }} />
          <div className="npc brother" style={{ left: brotherPos.x, top: brotherPos.y }}>🕺</div>
          <div className="npc sister" style={{ left: sisterPos.x, top: sisterPos.y }}>💃</div>
          {trees.map((tree, i) => (
            <div key={i} className="tree" style={{ left: tree.x, top: tree.y }}>🌳</div>
          ))}
          <p className="garden-msg">{gardenMessage}</p>
          <button onClick={handlePlantTree}>Plant Tree</button>
        </>
      )}
    </div>
  );
}
