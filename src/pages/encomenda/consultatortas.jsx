import React, { useState, useEffect, useRef } from "react";
import { DetalhesTortas } from "../../components/DetalhesTortas";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
const NM_PRODUTO = "torta";

const ST_PRODUCAO = { EM_PRODUCAO: 1, PRONTO: 2, CANCELADO: 3 };

function hojeISO() {
  return new Date().toISOString().split("T")[0];
}

function ConsultaTortas() {
  const [encomendas, setEncomendas]           = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [encomendaSelecionada, setEncomendaSelecionada] = useState(null);
  const [loadingModal, setLoadingModal]       = useState(false);
  const [confirmando, setConfirmando]         = useState(null);

  // Filtro de data
  const [dataSelecionada, setDataSelecionada] = useState(hojeISO());
  const dataRef = useRef(hojeISO());

  // Responsáveis do dia: { id_ordemservicos: { id_empregado, nm_nomefantasia } }
  const [responsaveisDia, setResponsaveisDia] = useState({});
  const [atribuindo, setAtribuindo]           = useState(null); // id sendo atribuído/removido

  // Controle de acesso
  const [acessoVerificado, setAcessoVerificado] = useState(false);
  const [acessoPermitido, setAcessoPermitido]   = useState(false);
  const [motivoBloqueio, setMotivoBloqueio]     = useState("");
  const [nomeEmpregado, setNomeEmpregado]       = useState("");

  const usuarioLogado = (() => {
    try { return JSON.parse(sessionStorage.getItem("usuario_logado")); }
    catch { return null; }
  })();

  // ── Verificação de acesso ──────────────────────────────────────────────────

  useEffect(() => { verificarAcesso(); }, []);

  async function verificarAcesso() {
    if (!usuarioLogado?.id_empregados) {
      setMotivoBloqueio("Seu usuário não está vinculado a um empregado. Solicite ao administrador que configure seu cadastro.");
      setAcessoVerificado(true);
      return;
    }
    try {
      const resPerms = await fetch(`${API_URL}/forms-usuarios/usuario/${usuarioLogado.id_usuarios}`);
      const perms    = await resPerms.json();
      const temPermissao = Array.isArray(perms) && perms.some(p =>
        p.nm_form?.toLowerCase() === "consultatortas" && p.acessar?.trim() === "S"
      );
      if (!temPermissao) {
        setMotivoBloqueio("Você não tem permissão de acesso à tela Consulta de Tortas. Solicite ao administrador.");
        setAcessoVerificado(true);
        return;
      }
      const resResp   = await fetch(`${API_URL}/responsavel/listar`);
      const responsaveis = await resResp.json();
      const responsavelTorta = Array.isArray(responsaveis) && responsaveis.find(r =>
        r.id_empregados === usuarioLogado.id_empregados &&
        (r.nm_produto || "").toLowerCase().includes(NM_PRODUTO)
      );
      if (!responsavelTorta) {
        setMotivoBloqueio("Você não está configurado como responsável por tortas no sistema. Solicite ao administrador.");
        setAcessoVerificado(true);
        return;
      }
      setNomeEmpregado(responsavelTorta.nm_nomefantasia || usuarioLogado.nome || "");
      setAcessoPermitido(true);
      setAcessoVerificado(true);
    } catch (err) {
      setMotivoBloqueio("Erro ao verificar permissões. Tente novamente.");
      setAcessoVerificado(true);
    }
  }

  // ── Carregar dados ao mudar data ou ao liberar acesso ─────────────────────

  useEffect(() => {
    if (!acessoPermitido) return;
    dataRef.current = dataSelecionada;
    setLoading(true);
    Promise.all([
      carregarEncomendas(dataSelecionada),
      carregarResponsaveisDia(dataSelecionada)
    ]);
  }, [acessoPermitido, dataSelecionada]);

  // Auto-refresh a cada 15s
  useEffect(() => {
    if (!acessoPermitido) return;
    const interval = setInterval(() => {
      carregarEncomendas(dataRef.current);
      carregarResponsaveisDia(dataRef.current);
    }, 15000);
    return () => clearInterval(interval);
  }, [acessoPermitido]);

  // ── Funções de dados ───────────────────────────────────────────────────────

  async function carregarEncomendas(data) {
    try {
      const response = await fetch(`${API_URL}/encomendas/filtrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dt_abertura: data, nm_nomefantasia: "", nr_telefone: "", trazerFoto: false
        })
      });
      if (!response.ok) throw new Error("Erro ao carregar encomendas");
      const rawData = await response.json();

      const filtradas = rawData.filter(enc => {
        const naoEntregue  = enc.st_status != 2;
        const temTamanho   = enc.vl_tamanho   && parseFloat(enc.vl_tamanho) > 0;
        const temRecheio   = enc.ds_recheio   && enc.ds_recheio.trim().length > 0;
        const temDecoracao = enc.ds_decoracao && enc.ds_decoracao.trim().length > 0;
        const temObsTorta  = enc.ds_obstortas && enc.ds_obstortas.trim().length > 0;
        return naoEntregue && (temTamanho || temRecheio || temDecoracao || temObsTorta);
      });

      setEncomendas(prev => {
        const prontoLocal = prev.filter(p =>
          p.st_producao === ST_PRODUCAO.PRONTO &&
          !filtradas.find(o => idItem(o) === idItem(p))
        );
        return ordenar([...filtradas, ...prontoLocal], responsaveisDia);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function carregarResponsaveisDia(data) {
    try {
      const res  = await fetch(`${API_URL}/responsavel-dia-enc/listar?dt_encomenda=${data}&nm_produto=${NM_PRODUTO}`);
      const rows = await res.json();
      const mapa = {};
      if (Array.isArray(rows)) {
        rows.forEach(r => { mapa[r.id_ordemservicos] = r; });
      }
      setResponsaveisDia(mapa);
      // re-ordenar com o novo mapa
      setEncomendas(prev => ordenar([...prev], mapa));
    } catch (err) {
      console.error("Erro ao carregar responsáveis do dia:", err);
    }
  }

  function idItem(enc) {
    return enc.id_encomendas || enc.id_ordemservicos;
  }

  function ordenar(lista, mapa) {
    return lista.sort((a, b) => {
      const idA = idItem(a);
      const idB = idItem(b);
      const euA = mapa[idA]?.id_empregado === usuarioLogado?.id_empregados ? 0 : 1;
      const euB = mapa[idB]?.id_empregado === usuarioLogado?.id_empregados ? 0 : 1;
      if (euA !== euB) return euA - euB;
      const sA = a.st_producao || 1;
      const sB = b.st_producao || 1;
      if (sA !== sB) return sA - sB;
      return (a.hr_horaenc || "").localeCompare(b.hr_horaenc || "");
    });
  }

  // ── Assumir / remover responsabilidade ────────────────────────────────────

  async function assumirResponsabilidade(enc) {
    const id = idItem(enc);
    setAtribuindo(id);
    try {
      await fetch(`${API_URL}/responsavel-dia-enc/atribuir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_empregado:    usuarioLogado.id_empregados,
          nm_produto:      NM_PRODUTO,
          id_ordemservicos: id,
          hr_horaenc:      enc.hr_horaenc || null,
          dt_encomenda:    dataSelecionada
        })
      });
      await carregarResponsaveisDia(dataSelecionada);
    } catch (err) {
      console.error("Erro ao assumir responsabilidade:", err);
    } finally {
      setAtribuindo(null);
    }
  }

  async function removerResponsabilidade(enc) {
    const id = idItem(enc);
    setAtribuindo(id);
    try {
      await fetch(`${API_URL}/responsavel-dia-enc/remover/${id}?nm_produto=${NM_PRODUTO}`, {
        method: "DELETE"
      });
      await carregarResponsaveisDia(dataSelecionada);
    } catch (err) {
      console.error("Erro ao remover responsabilidade:", err);
    } finally {
      setAtribuindo(null);
    }
  }

  // ── Abrir detalhes ─────────────────────────────────────────────────────────

  const handleAbrirDetalhes = async (encomendaLeve) => {
    if (encomendaLeve.st_status == 3) return;
    if (confirmando) return;
    setLoadingModal(true);
    try {
      const id = idItem(encomendaLeve);
      const response = await fetch(`${API_URL}/encomendas/filtrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_ordemservicos: id, trazerFoto: true })
      });
      const dadosCompletos = await response.json();
      setEncomendaSelecionada(dadosCompletos?.length > 0 ? dadosCompletos[0] : encomendaLeve);
    } catch (err) {
      setEncomendaSelecionada(encomendaLeve);
    } finally {
      setLoadingModal(false);
    }
  };

  // ── Alterar status produção ────────────────────────────────────────────────

  async function alterarStatusProducao(idEncomenda, novoStatus) {
    setConfirmando(null);
    setEncomendas(prev => {
      const atualizados = prev.map(item =>
        idItem(item) === idEncomenda ? { ...item, st_producao: novoStatus } : item
      );
      return ordenar(atualizados, responsaveisDia);
    });
    try {
      await fetch(`${API_URL}/encomendas/${idEncomenda}/producao`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ st_producao: novoStatus })
      });
    } catch (err) {
      console.error("Erro ao salvar status", err);
    }
  }

  const formatarData = (dataIso) => {
    if (!dataIso) return "";
    try { const [a, m, d] = dataIso.split("T")[0].split("-"); return `${d}/${m}/${a}`; }
    catch { return dataIso; }
  };

  // ── Telas de estado ────────────────────────────────────────────────────────

  if (!acessoVerificado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800"></div>
          <p className="text-sm text-gray-500 font-medium">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (acessoVerificado && !acessoPermitido) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="bg-red-800 p-4 text-white shadow-lg sticky top-0 z-20 border-b-4 border-red-900">
          <h1 className="text-xl font-black uppercase">🔒 Acesso Bloqueado</h1>
          <p className="text-xs text-red-200">PAINEL DE TORTAS</p>
        </div>
        <div className="max-w-2xl mx-auto p-4 mt-8 w-full">
          <div className="bg-white rounded-xl shadow-sm border-l-8 border-red-500 p-6 flex items-start gap-4">
            <div className="text-4xl shrink-0">🚫</div>
            <div>
              <h2 className="text-lg font-bold text-red-800 mb-2">Acesso não autorizado</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{motivoBloqueio}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render principal ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">

      {loadingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mb-2"></div>
            <span className="text-sm font-bold text-gray-700">Baixando Foto...</span>
          </div>
        </div>
      )}

      {encomendaSelecionada && (
        <DetalhesTortas encomenda={encomendaSelecionada} onClose={() => setEncomendaSelecionada(null)} />
      )}

      {/* HEADER */}
      <div className="bg-blue-800 p-4 text-white shadow-lg sticky top-0 z-20 border-b-4 border-blue-900">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider">
                👩‍🍳 {nomeEmpregado || "Cozinha"}
              </h1>
              <p className="text-xs text-blue-200 font-medium tracking-wide">PAINEL DE TORTAS</p>
            </div>
            <button
              onClick={() => { carregarEncomendas(dataSelecionada); carregarResponsaveisDia(dataSelecionada); }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-bold text-sm border border-white/20"
            >
              ↻ Atualizar
            </button>
          </div>

          {/* Seletor de data */}
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 w-fit">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wide">Data:</span>
            <input
              type="date"
              value={dataSelecionada}
              onChange={e => setDataSelecionada(e.target.value)}
              className="bg-transparent text-white font-bold text-sm border-none outline-none cursor-pointer"
              style={{ colorScheme: "dark" }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {loading && (
          <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800"></div>
          </div>
        )}

        {!loading && encomendas.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300 mt-4 opacity-70">
            <p className="text-2xl font-bold text-gray-300 mb-2">Tudo limpo!</p>
            <p className="text-gray-400">Nenhuma torta pendente para {formatarData(dataSelecionada)}.</p>
          </div>
        )}

        {encomendas.map((enc) => {
          const id               = idItem(enc);
          const statusProducao   = enc.st_producao || ST_PRODUCAO.EM_PRODUCAO;
          const isPronto         = statusProducao === ST_PRODUCAO.PRONTO;
          const isCancelado      = enc.st_status == 3 || statusProducao === ST_PRODUCAO.CANCELADO;
          const estaConfirmando  = confirmando === id;

          const respDia          = responsaveisDia[id];
          const euSouResponsavel = respDia?.id_empregado === usuarioLogado?.id_empregados;
          const outroResponsavel = respDia && !euSouResponsavel;
          const estaAtribuindo   = atribuindo === id;

          // Estilo do card
          let cardBorderColor = "border-l-blue-600";
          let cardBg          = "bg-white";
          if (euSouResponsavel) { cardBorderColor = "border-l-amber-500"; cardBg = "bg-amber-50"; }
          if (isPronto)         { cardBorderColor = "border-l-green-500"; cardBg = "bg-green-50"; }
          if (isCancelado)      { cardBorderColor = "border-l-gray-400";  cardBg = "bg-gray-100"; }

          const nomeCliente = enc.nm_nomefantasia || "Consumidor Final";
          const dataEntrega = enc.dt_formatada    || formatarData(enc.dt_abertura);
          const horaEntrega = enc.hr_horaenc      || "??:??";

          return (
            <div
              key={id}
              className={`relative border-l-[10px] rounded-lg flex flex-col transition-all duration-300 overflow-hidden shadow-sm
                ${cardBg} ${cardBorderColor}
                ${!isCancelado && !estaConfirmando ? "cursor-pointer hover:shadow-md hover:translate-x-1" : ""}
                ${isCancelado ? "opacity-60 grayscale cursor-default" : ""}`}
              onClick={() => !estaConfirmando && handleAbrirDetalhes(enc)}
            >
              {/* Badge "Minha responsabilidade" */}
              {euSouResponsavel && (
                <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 text-center">
                  ★ Você é responsável por esta torta
                </div>
              )}

              <div className="p-5 flex gap-4">
                {/* Coluna de hora/data */}
                <div className="flex flex-col items-center justify-start min-w-[80px] border-r border-gray-100 pr-4">
                  <span className={`text-3xl font-black tracking-tighter ${isPronto ? "text-green-700" : euSouResponsavel ? "text-amber-700" : "text-gray-800"}`}>
                    {horaEntrega}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase mt-1 text-center leading-tight">
                    {dataEntrega}
                  </span>
                  {isPronto && (
                    <div className="mt-2 bg-green-100 text-green-700 p-1 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CLIENTE / DESTINO</span>
                    <h3 className={`text-xl font-bold leading-tight uppercase
                      ${isPronto ? "text-green-900" : euSouResponsavel ? "text-amber-900" : "text-blue-900"}`}>
                      {nomeCliente}
                    </h3>
                  </div>

                  <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${euSouResponsavel ? "bg-amber-400" : "bg-blue-400"}`}></span>
                        <p className="text-sm font-semibold text-gray-600 leading-snug">
                          {enc.vl_tamanho ? `${enc.vl_tamanho} kg` : enc.produto_nome || "Ver Detalhes"}
                        </p>
                      </div>
                      {!estaConfirmando && (
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                    {enc.ds_observacao && (
                      <p className="text-xs text-red-500 mt-1 ml-4 italic truncate">⚠ {enc.ds_observacao}</p>
                    )}
                    {enc.ds_recheio && (
                      <p className="text-xs text-gray-500 mt-1 ml-4 truncate">+ {enc.ds_recheio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Faixa de responsabilidade do dia */}
              {!isCancelado && (
                <div
                  className="mx-4 mb-3"
                  onClick={e => e.stopPropagation()}
                >
                  {euSouResponsavel ? (
                    <div className="flex items-center justify-between bg-amber-100 border border-amber-300 rounded-lg px-3 py-2">
                      <span className="text-xs font-bold text-amber-800">✓ Responsável: Você</span>
                      <button
                        onClick={() => removerResponsabilidade(enc)}
                        disabled={estaAtribuindo}
                        className="text-xs text-amber-600 hover:text-red-600 font-semibold underline transition-colors disabled:opacity-50"
                      >
                        {estaAtribuindo ? "Removendo..." : "Remover"}
                      </button>
                    </div>
                  ) : outroResponsavel ? (
                    <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-500">
                        Responsável: <strong>{respDia.nm_nomefantasia || "Outro empregado"}</strong>
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => assumirResponsabilidade(enc)}
                      disabled={estaAtribuindo}
                      className="w-full py-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
                    >
                      {estaAtribuindo ? "Assumindo..." : "＋ Assumir responsabilidade por esta torta"}
                    </button>
                  )}
                </div>
              )}

              {/* Confirmação inline */}
              {estaConfirmando && (
                <div className="mx-4 mb-3 bg-amber-50 border border-amber-300 rounded-lg p-3 flex flex-col gap-2"
                  onClick={e => e.stopPropagation()}>
                  <p className="text-sm font-bold text-amber-800 text-center">⚠️ Confirmar como pronto?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmando(null); }}
                      className="flex-1 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 font-bold text-sm hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); alterarStatusProducao(id, ST_PRODUCAO.PRONTO); }}
                      className="flex-1 py-2 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700"
                    >
                      ✓ Confirmar
                    </button>
                  </div>
                </div>
              )}

              {/* Botão Marcar como Pronto / Voltar */}
              {!isCancelado && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (isPronto) alterarStatusProducao(id, ST_PRODUCAO.EM_PRODUCAO);
                    else setConfirmando(estaConfirmando ? null : id);
                  }}
                  className={`w-full py-3 font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                    ${isPronto
                      ? "bg-gray-200 text-gray-500 hover:bg-gray-300"
                      : estaConfirmando
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
                    }`}
                >
                  {isPronto ? <>↩ Voltar para Produção</> : estaConfirmando ? <>✕ Cancelar</> : <>✓ Marcar como Pronto</>}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConsultaTortas;
