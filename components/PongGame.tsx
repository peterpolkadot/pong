"use client";
import { useEffect, useRef, useState } from "react";

const PongGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);

  // Difficulty selector
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

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
    const paddleSpeed = 6;

    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    const ballRadius = 8;
    let ballSpeedX = 5;
    let ballSpeedY = 4;

    const keys: Record<string, boolean> = {};

    const resetBall = (scorer: "left" | "right") => {
      if (scorer === "left") setLeftScore((s) => s + 1);
      if (scorer === "right") setRightScore((s) => s + 1);

      beepSound.current?.play();

      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      ballSpeedX *= -1; // send ball toward other player
      ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
    };

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

    const update = () => {
      // 🎮 AI controls left paddle
      let aiSpeed = 2;
      let errorMargin = 25;

      if (difficulty === "medium") {
        aiSpeed = 3;
        errorMargin = 15;
      } else if (difficulty === "hard") {
        aiSpeed = 5;
        errorMargin = 5;
      }

      const leftPaddleCenter = leftPaddleY + paddleHeight / 2;

      if (Math.abs(ballX - canvas.width / 2) < 200) {
        // react only when ball is past midcourt
        if (ballY < leftPaddleCenter - errorMargin) leftPaddleY -= aiSpeed;
        else if (ballY > leftPaddleCenter + errorMargin) leftPaddleY += aiSpeed;
      } else {
        // idle wiggle for realism
        if (Math.random() > 0.98) leftPaddleY += Math.random() > 0.5 ? 4 : -4;
      }

      // ✅ Human controls right paddle
      if (keys["ArrowUp"] && rightPaddleY > 0) rightPaddleY -= paddleSpeed;
      if (keys["ArrowDown"] && rightPaddleY < canvas.height - paddleHeight)
        rightPaddleY += paddleSpeed;

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
  }, [difficulty]); // ✅ re-run effect when difficulty changes

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

      {/* Difficulty Selector */}
      <div className="flex space-x-2">
        {["easy", "medium", "hard"].map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level as "easy" | "medium" | "hard")}
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              difficulty === level
                ? "bg-green-600 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-gray-200"
            }`}
          >
            {level.toUpperCase()}
          </button>
        ))}
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

      {/* Beep Sound */}
      <audio ref={beepSound} src="beep.mp3" preload="auto" />
    </div>
  );
};

export default PongGame;
