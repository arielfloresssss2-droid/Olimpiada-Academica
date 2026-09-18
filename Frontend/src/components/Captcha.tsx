import { useEffect, useRef, useState } from "react";
import { RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";
import "../styles/Captcha.css";

interface CaptchaProps {
  onVerify: (verified: boolean) => void;
  title?: string;
}

export default function Captcha({
  onVerify,
  title = "Verificación de Seguridad Humana",
}: CaptchaProps) {
  const [captchaCode, setCaptchaCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generar código aleatorio alfanumérico sin caracteres ambiguos (0, O, I, 1)
  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Dibujar el captcha visual con distorsión, líneas y ruido para evitar bots OCR
  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo degradado suave
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#f8fafc");
    gradient.addColorStop(1, "#e2e8f0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Líneas de ruido protectoras
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = i % 2 === 0 ? "rgba(185, 28, 28, 0.35)" : "rgba(100, 116, 139, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      ctx.stroke();
    }

    // Puntos de ruido
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = "rgba(71, 85, 105, 0.3)";
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dibujar cada letra con rotación y color único
    const colors = ["#991b1b", "#1e293b", "#0f766e", "#831843", "#1d4ed8"];
    const startX = 16;
    const step = 26;

    ctx.textBaseline = "middle";
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const angle = (Math.random() - 0.5) * 0.4;
      const x = startX + i * step;
      const y = canvas.height / 2 + (Math.random() - 0.5) * 6;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = "bold 24px 'Courier New', monospace";
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  };

  const handleRefresh = () => {
    const newCode = generateRandomCode();
    setCaptchaCode(newCode);
    setUserInput("");
    setIsVerified(false);
    setErrorMsg("");
    onVerify(false);
    setTimeout(() => drawCaptcha(newCode), 50);
  };

  useEffect(() => {
    const initialCode = generateRandomCode();
    setCaptchaCode(initialCode);
    setTimeout(() => drawCaptcha(initialCode), 50);
  }, []);

  const handleValidate = () => {
    if (userInput.trim().toUpperCase() === captchaCode.toUpperCase()) {
      setIsVerified(true);
      setErrorMsg("");
      onVerify(true);
    } else {
      setErrorMsg("El código no coincide. Intentá de nuevo.");
      setIsVerified(false);
      onVerify(false);
      handleRefresh();
    }
  };

  if (isVerified) {
    return (
      <div className="captcha-container">
        <div className="captcha-verified-box">
          <ShieldCheck size={20} color="#166534" />
          <span>Verificación humana completada con éxito</span>
        </div>
      </div>
    );
  }

  return (
    <div className="captcha-container">
      <div className="captcha-header">
        <span className="captcha-badge">
          <ShieldAlert size={14} />
          {title}
        </span>
        <span>Protección anti-spam</span>
      </div>

      <div className="captcha-challenge-row">
        <div className="captcha-canvas-wrap">
          <canvas ref={canvasRef} width={150} height={42} />
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="captcha-refresh-btn"
          title="Generar nuevo código"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="captcha-input-wrap">
        <input
          type="text"
          placeholder="Código aquí"
          maxLength={5}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleValidate();
            }
          }}
          className="captcha-input"
        />
        <button
          type="button"
          onClick={handleValidate}
          disabled={userInput.trim().length < 4}
          className="captcha-verify-btn"
        >
          Verificar
        </button>
      </div>

      {errorMsg && <p className="captcha-error-text">{errorMsg}</p>}
    </div>
  );
}
