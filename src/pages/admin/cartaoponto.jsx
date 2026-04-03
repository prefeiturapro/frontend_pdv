import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";

const API_URL   = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";

function hoje() { return new Date().toISOString().split("T")[0]; }
function primeiroDiaMes() { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; }

export default function CartaoPontoAdmin() {
  const navigate = useNavigate();

  const [pontos,      setPontos]      = useState([]);
  const [empregados,  setEmpregados]  = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [dtIni,       setDtIni]       = useState(primeiroDiaMes());
  const [dtFim,       setDtFim]       = useState(hoje());
  const [filtroEmp,   setFiltroEmp]   = useState("");

  // Cadastro de face
  const [modalFace,       setModalFace]       = useState(null); // empregado selecionado
  const [modelosCarreg,   setModelosCarreg]   = useState(false);
  const [carregModelos,   setCarregModelos]   = useState(false);
  const [cameraAtiva,     setCameraAtiva]     = useState(false);
  const [capturando,      setCapturando]      = useState(false);
  const [msgFace,         setMsgFace]         = useState("");
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    carregarEmpregados();
    carregarPontos();
  }, []);

  const carregarEmpregados = async () => {
    const res = await fetch(`${API_URL}/cartao-ponto/empregados`);
    setEmpregados(await res.json());
  };

  const carregarPontos = async () => {
    setLoading(true);
    const params = new URLSearchParams({ dt_ini: dtIni, dt_fim: dtFim });
    if (filtroEmp) params.append("id_empregados", filtroEmp);
    const res = await fetch(`${API_URL}/cartao-ponto/listar?${params}`);
    setPontos(await res.json());
    setLoading(false);
  };

  const excluirPonto = async (id) => {
    if (!window.confirm("Excluir este registro de ponto?")) return;
    await fetch(`${API_URL}/cartao-ponto/excluir/${id}`, { method: "DELETE" });
    carregarPontos();
  };

  // ── Cadastro de face ─────────────────────────────────────────────────────────
  const abrirModalFace = async (emp) => {
    setModalFace(emp);
    setMsgFace("");
    setCameraAtiva(false);
    if (!modelosCarreg) {
      setCarregModelos(true);
      setMsgFace("Carregando modelos de IA...");
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelosCarreg(true);
      } catch {
        setMsgFace("Erro ao carregar modelos.");
      }
      setCarregModelos(false);
    }
    iniciarCameraFace();
  };

  const iniciarCameraFace = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 480, height: 360 } });
      streamRef.current = stream;
      setCameraAtiva(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
      setMsgFace("Posicione seu rosto no centro e clique em Capturar.");
    } catch {
      setMsgFace("Câmera não disponível.");
    }
  };

  const pararCameraFace = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraAtiva(false);
  };

  const fecharModalFace = () => {
    pararCameraFace();
    setModalFace(null);
  };

  const capturarFace = async () => {
    if (!videoRef.current) return;
    setCapturando(true);
    setMsgFace("Detectando rosto...");
    try {
      const det = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!det) {
        setMsgFace("❌ Nenhum rosto detectado. Tente novamente.");
        setCapturando(false);
        return;
      }

      setMsgFace("✅ Rosto detectado! Salvando...");
      const descriptor = Array.from(det.descriptor);
      const res = await fetch(`${API_URL}/cartao-ponto/face-enrollar/${modalFace.id_empregados}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor }),
      });

      if (res.ok) {
        setMsgFace("✅ Face cadastrada com sucesso!");
        carregarEmpregados();
        setTimeout(fecharModalFace, 1500);
      } else {
        setMsgFace("❌ Erro ao salvar face.");
      }
    } catch (err) {
      setMsgFace("❌ Erro: " + err.message);
    }
    setCapturando(false);
  };

  // ── Agrupamento por funcionário/dia ──────────────────────────────────────────
  const porEmpregado = {};
  pontos.forEach(p => {
    const k = p.id_empregados;
    if (!porEmpregado[k]) porEmpregado[k] = { nome: p.nm_nomefantasia, registros: [] };
    porEmpregado[k].registros.push(p);
  });

  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800">⏱ Cartão de Ponto</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gestão de registros e cadastro de faces</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/ponto")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
            📷 Tela de Registro
          </button>
          <button onClick={() => navigate("/menu")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
            ← Menu
          </button>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* ── Cadastro de faces ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">👤 Cadastro de Reconhecimento Facial</h2>
          </div>
          <div className="p-5">
            <p className="text-xs text-gray-500 mb-4">Clique em um funcionário para cadastrar ou atualizar seu rosto para reconhecimento automático.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {empregados.map(emp => (
                <button key={emp.id_empregados} onClick={() => abrirModalFace(emp)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors
                    ${emp.tem_face
                      ? "border-green-300 bg-green-50 hover:bg-green-100"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}>
                  <span className="text-lg">{emp.tem_face ? "✅" : "📷"}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-700 leading-tight">{emp.nm_nomefantasia}</p>
                    <p className={`text-[10px] ${emp.tem_face ? "text-green-600" : "text-gray-400"}`}>
                      {emp.tem_face ? "Face cadastrada" : "Sem face"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filtros ─────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Inicial</label>
              <input type="date" value={dtIni} onChange={e => setDtIni(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Final</label>
              <input type="date" value={dtFim} onChange={e => setDtFim(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Funcionário</label>
              <select value={filtroEmp} onChange={e => setFiltroEmp(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Todos</option>
                {empregados.map(e => <option key={e.id_empregados} value={e.id_empregados}>{e.nm_nomefantasia}</option>)}
              </select>
            </div>
            <button onClick={carregarPontos}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">
              {loading ? "..." : "🔍 Pesquisar"}
            </button>
          </div>
        </div>

        {/* ── Registros ───────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">📋 Registros de Ponto</h2>
            <span className="text-xs text-gray-400">{pontos.length} registros</span>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : pontos.length === 0 ? (
            <p className="text-center text-gray-400 italic py-10">Nenhum registro encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Funcionário</th>
                    <th className="px-4 py-3 text-center">Data</th>
                    <th className="px-4 py-3 text-center">Hora</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pontos.map(p => (
                    <tr key={p.id_cartaoponto} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-800">{p.nm_nomefantasia}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{p.dt_formatada}</td>
                      <td className="px-4 py-3 text-center font-mono text-blue-700 font-bold">
                        {String(p.hr_hora).slice(0, 5)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => excluirPonto(p.id_cartaoponto)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Cadastro Face ─────────────────────────────────────────────────── */}
      {modalFace && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-800 px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-lg">Cadastrar Face</h3>
                <p className="text-gray-300 text-xs">{modalFace.nm_nomefantasia}</p>
              </div>
              <button onClick={fecharModalFace} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-5 flex flex-col items-center gap-4">
              {carregModelos && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  Carregando modelos...
                </div>
              )}

              {cameraAtiva && (
                <video ref={videoRef} autoPlay muted playsInline
                  className="w-full rounded-xl bg-black"
                  style={{ transform: "scaleX(-1)", maxHeight: 300 }} />
              )}

              {msgFace && (
                <p className={`text-sm font-semibold text-center
                  ${msgFace.startsWith("✅") ? "text-green-600" : msgFace.startsWith("❌") ? "text-red-500" : "text-gray-500"}`}>
                  {msgFace}
                </p>
              )}

              <div className="flex gap-3 w-full">
                <button onClick={fecharModalFace}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-semibold hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={capturarFace} disabled={capturando || !cameraAtiva}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors">
                  {capturando ? "Capturando..." : "📸 Capturar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
