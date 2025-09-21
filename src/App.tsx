import { useState, useEffect } from 'react';
import './App.css';

import playImg from "./assets/play.png";
import resetImg from "./assets/reset.png";
import workBtnClicked from "./assets/work-clicked.png";
import workBtn from "./assets/work.png";
import breakBtnClicked from "./assets/break-clicked.png";
import breakBtn from "./assets/break.png";
import idleGif from "./assets/idle.gif";
import workGif from "./assets/work.gif";
import breakGif from "./assets/break.gif";
import meowSound from "./assets/meow.mp3";
import closeBtn from "./assets/close.png";

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [breakButtonImage, setBreakButtonImage] = useState(breakBtn);
  const [workButtonImage, setWorkButtonImage] = useState(workBtn);
  const [gifImage, setGifImage] = useState(idleGif);
  const [isBreak, setIsBreak] = useState(false);
  const [encouragement, setEncouragement] = useState("");
  const [image, setImage] = useState(playImg);
  const meowAudio = new Audio(meowSound);

  // pesan default selama timer jalan
  const cheerMessages = [
    "You Can Do It!",
    "I believe in you!",
    "You're amazing!",
    "Keep going!",
    "Stay focused!"
  ];

  const breakMessages = [
    "Stay hydrated!",
    "Snacks, maybe?",
    "Text me!",
    "I love you <3",
    "Stretch your legs!"
  ];

  // 🔹 Fungsi fetch Granite AI
  async function fetchGraniteReplicate(isBreakMode: boolean): Promise<string> {
    try {
      const prompt = isBreakMode
        ? "Give me exactly one short motivational phrase under 5 words"
        : "Give me a very short, fun 2-3 words break reminder. Example: 'Take a sip!'";

      const res = await fetch("http://localhost:3000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      console.log("Granite API result:", data);

      if (data.status === "succeeded" && data.output) {
        return data.output[0]; // ambil hasil AI
      } else {
        return "⚠️ Tidak ada hasil dari Granite";
      }
    } catch (err) {
      console.error("Error fetchGraniteReplicate:", err);
      return "❌ Gagal ambil pesan Granite";
    }
  }

  // 🔹 Update encouragement tiap beberapa detik (manual message)
  useEffect(() => {
    let messageInterval: NodeJS.Timeout;

    if (isRunning) {
      const messages = isBreak ? breakMessages : cheerMessages;
      setEncouragement(messages[0]); // set awal
      let index = 1;

      messageInterval = setInterval(() => {
        setEncouragement(messages[index]);
        index = (index + 1) % messages.length;
      }, 4000); // ganti tiap 4 detik
    } else {
      setEncouragement("");
    }

    return () => clearInterval(messageInterval);
  }, [isRunning, isBreak]);

  // 🔹 Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // 🔹 Set awal mode
  useEffect(() => {
    switchMode(false);
  }, []);

  // 🔹 Saat timer habis
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      meowAudio.play().catch(err => {
        console.error("Audio play failed:", err);
      });

      // Ambil pesan Granite AI
      fetchGraniteReplicate(isBreak).then(msg => {
        setEncouragement(msg);
      });

      setIsRunning(false); // stop timer
      setImage(playImg);   // reset button
      setGifImage(idleGif);
      setTimeLeft(isBreak ? 10 : 10); // reset waktu
    }
  }, [timeLeft]);

  // 🔹 Format menit:detik
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 🔹 Ganti mode
  const switchMode = (breakMode: boolean) => {
    setIsBreak(breakMode);
    setIsRunning(false);
    setBreakButtonImage(breakMode ? breakBtnClicked : breakBtn);
    setWorkButtonImage(breakMode ? workBtn : workBtnClicked);
    setTimeLeft(breakMode ? 10 : 10);
    setGifImage(idleGif);
  };

  // 🔹 Start/Stop tombol
  const handleClick = () => {
    if (!isRunning) {
      setIsRunning(true);
      setGifImage(isBreak ? breakGif : workGif);
      setImage(resetImg);
    } else {
      setIsRunning(false);
      setTimeLeft(isBreak ? 10 : 10);
      setGifImage(idleGif);
      setImage(playImg);
    }
  };

  // 🔹 Tombol close (Electron)
  const handleCloseClick = () => {
    if (window.electronAPI?.closeApp) {
      window.electronAPI.closeApp();
    } else {
      console.warn("Electron API not available");
    }
  };

  const containerClass = `home-container ${isRunning ? "background-blue" : ""}`;

  return (
    <div className={containerClass} style={{ position: 'relative' }}>
      <div>
        <button className="close-button" onClick={handleCloseClick}>
          <img src={closeBtn} alt="Close" />
        </button>
      </div>

      <div className="home-content">
        <div className="home-controls">
          <button className="image-button" onClick={() => switchMode(false)}>
            <img src={workButtonImage} alt="Work" />
          </button>
          <button className="image-button" onClick={() => switchMode(true)}>
            <img src={breakButtonImage} alt="Break" />
          </button>
        </div>

        <p className={`encouragement-text ${encouragement ? "" : "hidden"}`}>
            {encouragement}
        </p>

        <h1 className="home-timer">{formatTime(timeLeft)}</h1>
        <img src={gifImage} alt="Timer Status" className="gif-image" />
        <button className="home-button" onClick={handleClick}>
          <img src={image} alt="Button Icon" />
        </button>
      </div>
    </div>
  );
}

export default App;
