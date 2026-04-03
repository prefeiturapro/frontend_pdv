import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

function hoje() { return new Date().toISOString().split("T")[0]; }
function primeiroDiaMes() {
  const d = new Date(); d.setDate(1);
  return d.toISOString().split("T")[0];
}

// ── Barra horizontal CSS ───────────────────────────────────────────────────
function BarraH({ label, valor, max, cor = "bg-blue-500", sufixo = "" }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xs text-gray-600 w-40 shrink-0 truncate" title={label}>{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div className={`h-5 rounded-full ${cor} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-14 text-right shrink-0">{valor}{sufixo}</span>
    </div>
  );
}

// ── Barra vertical CSS ─────────────────────────────────────────────────────
function BarraV({ label, valor, max, cor = "bg-blue-500" }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <span className="text-xs font-bold text-gray-700">{valor}</span>
      <div className="w-full bg-gray-100 rounded-t" style={{ height: 80, display: "flex", alignItems: "flex-end" }}>
        <div className={`w-full rounded-t ${cor} transition-all duration-500`} style={{ height: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Card KPI ───────────────────────────────────────────────────────────────
function KpiCard({ titulo, valor, sub, cor = "border-blue-500", corTexto = "text-blue-600" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border-t-4 ${cor} p-4`}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{titulo}</p>
      <p className={`text-3xl font-extrabold ${corTexto}`}>{valor ?? "—"}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Card container ─────────────────────────────────────────────────────────
function Card({ titulo, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{titulo}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Nomes e cores dos status ───────────────────────────────────────────────
const STATUS_MAP = {
  "1": { label: "Aguardando",  cor: "bg-yellow-400" },
  "2": { label: "Entregue",    cor: "bg-green-500"  },
  "3": { label: "Cancelado",   cor: "bg-red-500"    },
};

export default function BiDashboard() {
  const navigate = useNavigate();
  const [dtIni, setDtIni] = useState(primeiroDiaMes());
  const [dtFim, setDtFim] = useState(hoje());
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bi/dashboard?dt_ini=${dtIni}&dt_fim=${dtFim}`);
      setDados(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  // ── Derivações ────────────────────────────────────────────────────────────
  const r = dados?.resumo || {};
  const clientes   = dados?.clientes   || [];
  const porMes     = dados?.porMes     || [];
  const porStatus  = dados?.porStatus  || [];
  const horarios   = dados?.horarios   || [];
  const produtos   = dados?.produtos   || [];
  const tortasMes  = dados?.tortasMes  || [];
  const recheios   = dados?.recheios   || [];

  const maxClientes  = clientes[0]?.total  || 1;
  const maxProdutos  = produtos[0]?.total  || 1;
  const maxRecheios  = recheios[0]?.total  || 1;
  const maxMes       = Math.max(...porMes.map(m => Number(m.total)), 1);
  const maxTortasMes = Math.max(...tortasMes.map(m => Number(m.total)), 1);
  const maxHorario   = Math.max(...horarios.map(h => Number(h.total)), 1);
  const totalStatus  = porStatus.reduce((s, x) => s + Number(x.total), 0) || 1;

  const mesMaisMovimentado     = porMes.reduce((a, b) => Number(a.total) >= Number(b.total) ? a : b, {});
  const mesMaisMovTortas       = tortasMes.reduce((a, b) => Number(a.total) >= Number(b.total) ? a : b, {});
  const totalTortas            = tortasMes.reduce((s, m) => s + Number(m.total), 0);

  const COR_PRODUTO = ["bg-red-500","bg-orange-500","bg-amber-500","bg-yellow-500","bg-lime-500",
    "bg-green-500","bg-emerald-500","bg-teal-500","bg-cyan-500","bg-blue-500",
    "bg-indigo-500","bg-violet-500","bg-purple-500","bg-pink-500","bg-rose-500"];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      {/* HEADER */}
      <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-widest">📊 Painel de Indicadores</h1>
          <p className="text-xs text-gray-400 mt-0.5">Business Intelligence — Café Francesa</p>
        </div>
        <button onClick={() => navigate("/menu")}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors border border-white/20">
          ← Menu
        </button>
      </header>

      {/* FILTRO DE DATA */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-end gap-4 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Inicial</label>
          <input type="date" value={dtIni} onChange={e => setDtIni(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Final</label>
          <input type="date" value={dtFim} onChange={e => setDtFim(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={carregar}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm">
          {loading ? "Carregando..." : "Atualizar"}
        </button>
        <div className="ml-auto text-xs text-gray-400 self-center">
          Período de análise: <strong className="text-gray-600">{dtIni.split("-").reverse().join("/")} → {dtFim.split("-").reverse().join("/")}</strong>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
        </div>
      ) : (
        <div className="p-6 space-y-6 max-w-screen-xl mx-auto">

          {/* ── KPIs ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard titulo="Total Encomendas" valor={r.total_encomendas} cor="border-blue-500"   corTexto="text-blue-600" />
            <KpiCard titulo="Entregues"        valor={r.total_entregues}  sub={`${Math.round((r.total_entregues/r.total_encomendas)*100)||0}% do total`} cor="border-green-500"  corTexto="text-green-600" />
            <KpiCard titulo="Pendentes"        valor={r.total_pendentes}  cor="border-yellow-500" corTexto="text-yellow-600" />
            <KpiCard titulo="Cancelados"       valor={r.total_cancelados} sub={`${Math.round((r.total_cancelados/r.total_encomendas)*100)||0}% do total`} cor="border-red-500"    corTexto="text-red-600" />
          </div>

          {/* ── Linha 1: Clientes + Mês ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <Card titulo="🏆 Clientes que Mais Compram">
              {clientes.length === 0
                ? <p className="text-sm text-gray-400 italic">Sem dados no período.</p>
                : clientes.map((c, i) => (
                    <BarraH key={i} label={c.nome || "Desconhecido"} valor={Number(c.total)}
                      max={maxClientes}
                      cor={i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-orange-400" : "bg-blue-400"} />
                  ))
              }
            </Card>

            <Card titulo="📅 Encomendas por Mês (últimos 14 meses)">
              {porMes.length === 0
                ? <p className="text-sm text-gray-400 italic">Sem dados.</p>
                : (
                  <div className="flex items-end gap-1 h-32">
                    {porMes.map((m, i) => (
                      <BarraV key={i} label={m.mes_label} valor={Number(m.total)} max={maxMes}
                        cor={m.mes_iso === mesMaisMovimentado.mes_iso ? "bg-blue-600" : "bg-blue-300"} />
                    ))}
                  </div>
                )
              }
              {mesMaisMovimentado.mes_label && (
                <p className="text-xs text-blue-700 font-semibold mt-3">
                  📌 Mês mais movimentado: <strong>{mesMaisMovimentado.mes_label}</strong> ({mesMaisMovimentado.total} encomendas)
                </p>
              )}
            </Card>
          </div>

          {/* ── Linha 2: Tortas por Mês + Top Recheios ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <Card titulo="🎂 Tortas por Mês (últimos 14 meses)">
              {tortasMes.length === 0
                ? <p className="text-sm text-gray-400 italic">Sem dados.</p>
                : (
                  <>
                    <div className="flex items-end gap-1 h-32">
                      {tortasMes.map((m, i) => (
                        <BarraV key={i} label={m.mes_label} valor={Number(m.total)} max={maxTortasMes}
                          cor={m.mes_iso === mesMaisMovTortas.mes_iso ? "bg-orange-500" : "bg-orange-300"} />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      {mesMaisMovTortas.mes_label && (
                        <p className="text-orange-700 font-semibold">
                          📌 Mês mais movimentado: <strong>{mesMaisMovTortas.mes_label}</strong> ({mesMaisMovTortas.total} tortas)
                        </p>
                      )}
                      <p className="font-semibold text-gray-600">Total 14 meses: <strong>{totalTortas}</strong></p>
                    </div>
                  </>
                )
              }
            </Card>

            <Card titulo="🍰 Top 15 Recheios Mais Pedidos">
              {recheios.length === 0
                ? <p className="text-sm text-gray-400 italic">Sem dados no período.</p>
                : (() => {
                    const totalTop15 = recheios.reduce((s, r) => s + Number(r.total), 0);
                    const totalPeriodo = tortasMes
                      .filter(m => {
                        if (!dtIni && !dtFim) return true;
                        return (!dtIni || m.mes_iso >= dtIni.slice(0,7)) &&
                               (!dtFim  || m.mes_iso <= dtFim.slice(0,7));
                      })
                      .reduce((s, m) => s + Number(m.total), 0);
                    const fora = totalPeriodo - totalTop15;
                    return (
                      <>
                        {recheios.map((rec, i) => (
                          <BarraH key={i} label={rec.recheio} valor={Number(rec.total)}
                            max={maxRecheios}
                            cor={i === 0 ? "bg-orange-500" : i < 3 ? "bg-amber-400" : "bg-amber-300"}
                            sufixo=" tortas" />
                        ))}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                          <span>Top 15 somam: <strong className="text-orange-600">{totalTop15} tortas</strong></span>
                          {fora > 0 && <span>Outros sabores: <strong className="text-gray-400">{fora} tortas</strong></span>}
                          <span>Total período: <strong className="text-gray-700">{totalPeriodo} tortas</strong></span>
                        </div>
                      </>
                    );
                  })()
              }
            </Card>
          </div>

          {/* ── Linha 3: Produtos + Status + Horários ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <Card titulo="🥇 Produtos Mais Vendidos (Top 15)" className="lg:col-span-2">
              {produtos.length === 0
                ? <p className="text-sm text-gray-400 italic">Sem dados no período.</p>
                : produtos.map((p, i) => (
                    <BarraH key={i} label={p.produto} valor={Number(p.total)}
                      max={maxProdutos} sufixo=" un."
                      cor={COR_PRODUTO[i % COR_PRODUTO.length]} />
                  ))
              }
            </Card>

            <div className="flex flex-col gap-6">

              <Card titulo="📊 Status das Encomendas">
                {porStatus.length === 0
                  ? <p className="text-sm text-gray-400 italic">Sem dados.</p>
                  : porStatus.map((s, i) => {
                      const info = STATUS_MAP[String(s.st_status)] || { label: `Status ${s.st_status}`, cor: "bg-gray-400" };
                      const pct = Math.round((Number(s.total) / totalStatus) * 100);
                      return (
                        <div key={i} className="mb-3">
                          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                            <span>{info.label}</span>
                            <span>{s.total} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div className={`h-4 rounded-full ${info.cor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                }
              </Card>

              <Card titulo="⏰ Horários de Pico">
                {horarios.length === 0
                  ? <p className="text-sm text-gray-400 italic">Sem dados.</p>
                  : (
                    <div className="flex items-end gap-1 h-28">
                      {horarios.map((h, i) => (
                        <BarraV key={i} label={h.hora} valor={Number(h.total)} max={maxHorario}
                          cor="bg-orange-400" />
                      ))}
                    </div>
                  )
                }
              </Card>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
