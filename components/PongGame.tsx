"use client";
import { useEffect, useRef, useState } from "react";

const PongGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // State for score
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);

  // Sound effect
  const beepSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;

    const paddleHeight = 80;
    const paddleWidth = 10;

    let leftPaddleY = (canvas.height - paddleHeight) / 2;
    let rightPaddleY = (canvas.height - paddleHeight) / 2;
    const paddleSpeed = 5;

    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballRadius = 8;
    let ballSpeedX = 4;
    let ballSpeedY = 4;

    const keys: Record<string, boolean> = {};

    const draw = () => {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Paddles
      ctx.fillStyle = "white";
      ctx.fillRect(20, leftPaddleY, paddleWidth, paddleHeight);
      ctx.fillRect(canvas.width - 30, rightPaddleY, paddleWidth, paddleHeight);

      // Ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    const resetBall = (scorer: "left" | "right") => {
      if (scorer === "left") setLeftScore((s) => s + 1);
      if (scorer === "right") setRightScore((s) => s + 1);

      beepSound.current?.play();

      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      ballSpeedX *= -1;
      ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
    };

    const update = () => {
      // 🎮 Computer-controlled left paddle (follows the ball)
      const aiSpeed = 3;
      const leftPaddleCenter = leftPaddleY + paddleHeight / 2;
      if (ballY < leftPaddleCenter - 10) leftPaddleY -= aiSpeed;
      else if (ballY > leftPaddleCenter + 10) leftPaddleY += aiSpeed;

      // ✅ Human player controls right paddle
      if (keys["ArrowUp"] && rightPaddleY > 0) rightPaddleY -= paddleSpeed;
      if (keys["ArrowDown"] && rightPaddleY < canvas.height - paddleHeight) rightPaddleY += paddleSpeed;

      // Ball movement
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // Collisions with top/bottom
      if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY *= -1;
        beepSound.current?.play();
      }

      // Collisions with paddles
      if (
        ballX - ballRadius < 30 &&
        ballY > leftPaddleY &&
        ballY < leftPaddleY + paddleHeight
      ) {
        ballSpeedX *= -1;
        beepSound.current?.play();
      }

      if (
        ballX + ballRadius > canvas.width - 30 &&
        ballY > rightPaddleY &&
        ballY < rightPaddleY + paddleHeight
      ) {
        ballSpeedX *= -1;
        beepSound.current?.play();
      }

      // Out of bounds (score)
      if (ballX < 0) resetBall("right");
      if (ballX > canvas.width) resetBall("left");
    };

    const loop = () => {
      update();
      draw();
      requestAnimationFrame(loop);
    };

    loop();

    const handleKeyDown = (e: KeyboardEvent) => (keys[e.key] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys[e.key] = false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const restartGame = () => {
    setLeftScore(0);
    setRightScore(0);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Scoreboard */}
      <div className="flex space-x-8 text-2xl font-bold">
        <span>🤖 {leftScore}</span>
        <span>👤 {rightScore}</span>
      </div>

      {/* Game Canvas */}
      <canvas ref={canvasRef} className="border border-white rounded-lg" />

      {/* Restart Button */}
      <button
        onClick={restartGame}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
      >
        Restart
      </button>

      {/* One Beep Sound */}
      <audio ref={beepSound} src="beep.mp3" preload="auto" />
    </div>
  );
};

export default PongGame;
