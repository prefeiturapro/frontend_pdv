import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";

const API_URL   = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";

// Estados do fluxo
const ESTADO = {
  INICIAL:      "inicial",      // botão REGISTRAR PONTO
  CARREGANDO:   "carregando",   // carregando modelos (primeira vez)
  CAMERA:       "camera",       // câmera aberta, procurando rosto
  CONFIRMACAO:  "confirmacao",  // rosto encontrado, pergunta SIM/NÃO
  REGISTRANDO:  "registrando",  // gravando no banco
  SUCESSO:      "sucesso",      // ponto registrado
  ERRO:         "erro",         // algum erro
};

function Relogio() {
  const [agora, setAgora] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-center">
      <div className="text-5xl font-black text-white tracking-widest tabular-nums">
        {agora.toLocaleTimeString("pt-BR")}
      </div>
      <div className="text-blue-200 text-sm font-medium mt-1">
        {agora.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
      </div>
    </div>
  );
}

export default function RegistroPonto() {
  const navigate    = useNavigate();
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const intervalRef = useRef(null);
  const streamRef   = useRef(null);

  const [estado, setEstado]         = useState(ESTADO.INICIAL);
  const [matcher, setMatcher]       = useState(null);
  const [empregados, setEmpregados] = useState([]);
  const [modelosOk, setModelosOk]   = useState(false);
  const [msgCamera, setMsgCamera]   = useState("");

  const [reconhecido, setReconhecido] = useState(null); // { id, nome }
  const [registrado, setRegistrado]   = useState(null); // { nome, hora }
  const [msgErro, setMsgErro]         = useState("");

  // ── Pré-carrega modelos + empregados na montagem ─────────────────────────────
  useEffect(() => {
    async function preCarregar() {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        const res  = await fetch(`${API_URL}/cartao-ponto/empregados-faces`);
        const rows = await res.json();

        if (Array.isArray(rows) && rows.length > 0) {
          const labeled = rows
            .filter(r => r.ds_face_descriptor)
            .map(r => {
              const desc = new Float32Array(Object.values(JSON.parse(r.ds_face_descriptor)));
              return new faceapi.LabeledFaceDescriptors(String(r.id_empregados), [desc]);
            });
          if (labeled.length > 0) setMatcher(new faceapi.FaceMatcher(labeled, 0.6));
        }

        const resAll = await fetch(`${API_URL}/cartao-ponto/empregados`);
        setEmpregados(await resAll.json());
        setModelosOk(true);
      } catch (err) {
        console.error(err);
        setMsgErro("Erro ao carregar modelos. Verifique a conexão.");
        setEstado(ESTADO.ERRO);
      }
    }
    preCarregar();
    return () => pararCamera();
  }, []);

  // ── Câmera ───────────────────────────────────────────────────────────────────
  const iniciarCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      streamRef.current = stream;
      // aguarda o elemento de vídeo estar disponível
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current.play();
        }
      }, 100);
    } catch {
      setMsgErro("Câmera não disponível. Verifique as permissões do navegador.");
      setEstado(ESTADO.ERRO);
    }
  }, []);

  const pararCamera = () => {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (canvasRef.current) {
      canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // ── Reconhecimento contínuo (só quando estado === CAMERA) ────────────────────
  useEffect(() => {
    if (estado !== ESTADO.CAMERA) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !matcher) return;
      try {
        const det = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!det) {
          setMsgCamera("Nenhum rosto detectado. Aproxime-se da câmera...");
          return;
        }

        // Desenha box
        if (canvasRef.current && videoRef.current) {
          const dims   = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
          const resized = faceapi.resizeResults(det, dims);
          const ctx    = canvasRef.current.getContext("2d");
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, [resized]);
        }

        const match = matcher.findBestMatch(det.descriptor);
        if (match.label !== "unknown") {
          clearInterval(intervalRef.current);
          const emp = empregados.find(e => String(e.id_empregados) === match.label);
          setReconhecido({ id: match.label, nome: emp?.nm_nomefantasia || match.label });
          setEstado(ESTADO.CONFIRMACAO);
        } else {
          setMsgCamera("Rosto detectado, mas não reconhecido.");
        }
      } catch { /* silencioso */ }
    }, 600);

    return () => clearInterval(intervalRef.current);
  }, [estado, matcher, empregados]);

  // ── Abrir câmera ao clicar em REGISTRAR PONTO ────────────────────────────────
  const handleAbrirCamera = async () => {
    setMsgCamera("Aproxime seu rosto da câmera...");
    setReconhecido(null);

    if (!modelosOk) {
      setEstado(ESTADO.CARREGANDO);
      return;
    }

    setEstado(ESTADO.CAMERA);
    await iniciarCamera();
  };

  // ── Confirmação SIM ──────────────────────────────────────────────────────────
  const handleSim = async () => {
    setEstado(ESTADO.REGISTRANDO);
    pararCamera();
    try {
      const res = await fetch(`${API_URL}/cartao-ponto/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_empregados: reconhecido.id }),
      });
      if (!res.ok) throw new Error("Falha ao registrar");
      const hora = new Date().toLocaleTimeString("pt-BR");
      setRegistrado({ nome: reconhecido.nome, hora });
      setEstado(ESTADO.SUCESSO);
    } catch (err) {
      setMsgErro("Erro ao registrar ponto: " + err.message);
      setEstado(ESTADO.ERRO);
    }
  };

  // ── Confirmação NÃO / Voltar ao início ───────────────────────────────────────
  const handleNao = () => {
    pararCamera();
    setReconhecido(null);
    setRegistrado(null);
    setMsgErro("");
    setEstado(ESTADO.INICIAL);
  };

  // ── Após sucesso: abre câmera direto ─────────────────────────────────────────
  const handleOutroPonto = async () => {
    setReconhecido(null);
    setRegistrado(null);
    setMsgErro("");
    setMsgCamera("Aproxime seu rosto da câmera...");
    setEstado(ESTADO.CAMERA);
    await iniciarCamera();
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-between py-8 px-4 font-sans">

      {/* Topo */}
      <div className="w-full max-w-2xl flex items-start justify-between">
        <button
          onClick={() => { pararCamera(); navigate("/admin/cartao-ponto"); }}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-semibold transition-colors"
        >
          ← Admin
        </button>
        <Relogio />
        <div className="w-20" />
      </div>

      {/* Card central */}
      <div className="w-full max-w-lg">

        {/* ── INICIAL ── */}
        {estado === ESTADO.INICIAL && (
          <div className="bg-gray-800 rounded-2xl p-12 flex flex-col items-center gap-6 shadow-2xl">
            <div className="text-7xl">👤</div>
            <p className="text-gray-300 text-lg font-semibold text-center">
              Clique no botão abaixo para registrar seu ponto
            </p>
            <button
              onClick={handleAbrirCamera}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-2xl rounded-2xl transition-colors shadow-lg uppercase tracking-wide"
            >
              Registrar Ponto
            </button>
          </div>
        )}

        {/* ── CARREGANDO MODELOS ── */}
        {estado === ESTADO.CARREGANDO && (
          <div className="bg-gray-800 rounded-2xl p-12 flex flex-col items-center gap-4 shadow-2xl">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-400" />
            <p className="text-blue-300 font-semibold text-center">Carregando modelos de reconhecimento facial...</p>
            <p className="text-gray-500 text-xs text-center">Aguarde, isso ocorre apenas uma vez.</p>
          </div>
        )}

        {/* ── CÂMERA ABERTA ── */}
        {estado === ESTADO.CAMERA && (
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center gap-4 p-6">
            <div className="relative w-full">
              <video ref={videoRef} autoPlay muted playsInline
                className="w-full rounded-xl bg-black"
                style={{ transform: "scaleX(-1)" }} />
              <canvas ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full rounded-xl"
                style={{ transform: "scaleX(-1)" }} />
            </div>
            <p className="text-gray-400 text-sm text-center animate-pulse">{msgCamera}</p>
            <button
              onClick={handleNao}
              className="px-8 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-semibold text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* ── CONFIRMAÇÃO ── */}
        {estado === ESTADO.CONFIRMACAO && reconhecido && (
          <div className="bg-gray-800 rounded-2xl p-10 flex flex-col items-center gap-6 shadow-2xl">
            <div className="text-6xl">👤</div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white uppercase tracking-wide">{reconhecido.nome}</p>
              <p className="text-gray-400 text-sm mt-1">Funcionário identificado</p>
            </div>
            <div className="w-full border-t border-gray-700 pt-6">
              <p className="text-white text-xl font-bold text-center mb-6">
                Deseja registrar o seu ponto?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleNao}
                  className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-white font-extrabold text-xl rounded-2xl transition-colors"
                >
                  NÃO
                </button>
                <button
                  onClick={handleSim}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white font-extrabold text-xl rounded-2xl transition-colors"
                >
                  SIM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── REGISTRANDO ── */}
        {estado === ESTADO.REGISTRANDO && (
          <div className="bg-gray-800 rounded-2xl p-12 flex flex-col items-center gap-4 shadow-2xl">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-green-400" />
            <p className="text-green-300 font-semibold">Registrando ponto...</p>
          </div>
        )}

        {/* ── SUCESSO ── */}
        {estado === ESTADO.SUCESSO && registrado && (
          <div className="bg-green-600 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl">
            <div className="text-6xl">✅</div>
            <h2 className="text-3xl font-extrabold text-white text-center uppercase tracking-wide">
              Ponto Registrado!
            </h2>
            <p className="text-xl text-green-100 font-bold">{registrado.nome}</p>
            <p className="text-green-200 text-sm">{registrado.hora}</p>
            <button
              onClick={handleOutroPonto}
              className="mt-4 w-full py-4 bg-white text-green-700 font-extrabold text-xl rounded-2xl hover:bg-green-50 transition-colors shadow"
            >
              Registrar Outro Ponto
            </button>
          </div>
        )}

        {/* ── ERRO ── */}
        {estado === ESTADO.ERRO && (
          <div className="bg-gray-800 rounded-2xl p-10 flex flex-col items-center gap-6 shadow-2xl">
            <div className="text-6xl">❌</div>
            <p className="text-red-400 font-semibold text-center">{msgErro}</p>
            <button
              onClick={handleNao}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

      </div>

      {/* Rodapé */}
      <p className="text-gray-600 text-xs">Café Francesa — Sistema de Ponto</p>
    </div>
  );
}
