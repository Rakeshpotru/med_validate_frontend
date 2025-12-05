
// import React, { useRef, useState, useEffect } from 'react';
import { useEffect, useRef, useState } from 'react';
import './captcha.css';

interface CaptchaProps {
  onChange?: (captchaText: string) => void;
  onValidChange?: (valid: boolean) => void;
}

const generateCaptchaText = (length = 6): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$&*!?';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const Captcha: React.FC<CaptchaProps> = ({ onChange, onValidChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const drawCaptcha = (text: string) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear + background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background static noise (grain)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const noise = Math.random() * 255;
    pixels[i] = noise;      // R
    pixels[i + 1] = noise;  // G
    pixels[i + 2] = noise;  // B
    pixels[i + 3] = 20;     // Alpha (low opacity)
  }
  ctx.putImageData(imageData, 0, 0);

  // Random dots
  for (let i = 0; i < 150; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Background dummy characters
  for (let i = 0; i < 10; i++) {
    ctx.font = `${12 + Math.random() * 10}px Courier`;
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
    const ch = String.fromCharCode(33 + Math.floor(Math.random() * 94));
    ctx.fillText(ch, Math.random() * canvas.width, Math.random() * canvas.height);
  }

  // Wavy distortion lines
  for (let i = 0; i < 2; i++) {
    ctx.strokeStyle = `rgba(50,50,50,0.3)`;
    ctx.beginPath();
    ctx.moveTo(0, Math.random() * canvas.height);
    for (let x = 0; x < canvas.width; x += 5) {
      const y = Math.sin(x * 0.05 + i * 10) * 5 + canvas.height / 2;
      ctx.lineTo(x, y + (Math.random() * 4 - 2));
    }
    ctx.stroke();
  }

  // Draw actual CAPTCHA characters
  let x = 10;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const fontSize = 24 + Math.random() * 6;
    const angle = (Math.random() - 0.5) * 0.4;
    const yOffset = Math.random() * 10 - 5;

    ctx.save();
    ctx.translate(x, 30 + yOffset);
    ctx.rotate(angle);
    ctx.font = `${fontSize}px 'Courier New'`;
    ctx.fillStyle = `rgb(${100 + Math.random() * 150}, ${Math.random() * 80}, ${Math.random() * 80})`;
    ctx.fillText(char, 0, 0);
    ctx.restore();

    x += 25 + Math.random() * 5;
  }

  // Final strike-through lines
  for (let i = 0; i < 2; i++) {
    const y = 10 + Math.random() * 30;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.strokeStyle = `rgba(0,0,0,${0.2 + Math.random() * 0.2})`;
    ctx.lineWidth = 1.5 + Math.random() * 1;
    ctx.stroke();
  }
};


  const regenerateCaptcha = () => {
    const newText = generateCaptchaText();
    setCaptchaText(newText);
    drawCaptcha(newText);
    setUserInput('');
    setResult(null);
    onChange?.(newText);
    onValidChange?.(false);
  };

  // const handleVerify = () => {
  //   const matched = userInput.trim() === captchaText;
  //   setResult(matched ? 'Captcha matched!' : ' Captcha did not match');
  //   onValidChange?.(matched);
  // };
  const handleVerify = () => {
  const matched = userInput.trim() === captchaText;
  if (matched) {
    setResult('Captcha matched!');
    onValidChange?.(true);
  } else {
    setResult('Captcha did not match');
    onValidChange?.(false);
    // Regenerate captcha on mismatch
    setTimeout(() => {
      regenerateCaptcha();
    }, 500); // slight delay for user to see the message
  }
};

  useEffect(() => {
    regenerateCaptcha();
  }, []);

  return (
    <div className="captchaContainer">
      <canvas ref={canvasRef} width={200} height={60} className="canvas" />

      <button type="button" onClick={regenerateCaptcha} className="button">
      ↻ Refresh Captcha
      </button>

      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter captcha"
        className="input"
      />

      <button type="button" onClick={handleVerify} className="button">
      Verify
      </button>

      {result && <p className="result">{result}</p>}
    </div>
  );
};

export default Captcha;