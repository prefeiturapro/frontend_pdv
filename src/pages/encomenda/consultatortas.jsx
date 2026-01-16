import React, { useState, useEffect } from "react";
import { DetalhesTortas } from "../../components/DetalhesTortas"; 

function ConsultaTortas() {
  const [encomendas, setEncomendas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [encomendaSelecionada, setEncomendaSelecionada] = useState(null);
  
  // State para carregando do modal (para não abrir modal vazio enquanto baixa a foto)
  const [loadingModal, setLoadingModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

  const ST_PRODUCAO = {
    EM_PRODUCAO: 1,
    PRONTO: 2,
    CANCELADO: 3
  };

  useEffect(() => {
    carregarEncomendas();
    const interval = setInterval(carregarEncomendas, 15000);
    return () => clearInterval(interval);
  }, []);

  async function carregarEncomendas() {
    try {
      const dataHoje = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`${API_URL}/encomendas/filtrar`, { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ 
              dt_abertura: dataHoje, 
              nm_nomefantasia: "", 
              nr_telefone: "",
              // TRUQUE DE ECONOMIA: Não traz a foto no loop automático!
              trazerFoto: false 
          }) 
      });

      if (!response.ok) throw new Error("Erro ao carregar encomendas");
      const data = await response.json();

      const minhasEncomendas = data.filter(enc => {
        const naoEntregue = enc.st_status != 2;

        const temTamanho = enc.vl_tamanho && parseFloat(enc.vl_tamanho) > 0;
        const temRecheio = enc.ds_recheio && enc.ds_recheio.trim().length > 0;
        const temDecoracao = enc.ds_decoracao && enc.ds_decoracao.trim().length > 0;
        const temObsTorta = enc.ds_obstortas && enc.ds_obstortas.trim().length > 0;

        const ehTorta = temTamanho || temRecheio || temDecoracao || temObsTorta;

        return naoEntregue && ehTorta; 
      });

      const ordenadas = minhasEncomendas.sort((a, b) => {
        const statusA = a.st_producao || 1;
        const statusB = b.st_producao || 1;
        if (statusA !== statusB) return statusA - statusB;
        
        const horaA = a.hr_horaenc || a.hora || "";
        const horaB = b.hr_horaenc || b.hora || "";
        return horaA.localeCompare(horaB);
      });

      setEncomendas(ordenadas);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // --- FUNÇÃO PARA ABRIR DETALHES COM FOTO ---
  const handleAbrirDetalhes = async (encomendaLeve) => {
    if (encomendaLeve.st_status == 3) return; // Se cancelado, não abre

    setLoadingModal(true);
    try {
        // Busca APENAS essa encomenda, mas agora pedindo a FOTO (trazerFoto: true)
        const idItem = encomendaLeve.id_encomendas || encomendaLeve.id_ordemservicos;
        
        const response = await fetch(`${API_URL}/encomendas/filtrar`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ 
                id_ordemservicos: idItem,
                trazerFoto: true // <--- AQUI PEDIMOS A FOTO PESADA
            }) 
        });

        const dadosCompletos = await response.json();
        
        if (dadosCompletos && dadosCompletos.length > 0) {
            setEncomendaSelecionada(dadosCompletos[0]);
        } else {
            // Fallback: se der erro, abre a versão sem foto mesmo
            setEncomendaSelecionada(encomendaLeve);
        }

    } catch (err) {
        console.error("Erro ao baixar foto da torta", err);
        setEncomendaSelecionada(encomendaLeve);
    } finally {
        setLoadingModal(false);
    }
  };


  async function alterarStatusProducao(idEncomenda, novoStatus) {
    setEncomendas(prev => prev.map(item => 
      item.id_encomendas === idEncomenda || item.id_ordemservicos === idEncomenda
        ? { ...item, st_producao: novoStatus } 
        : item
    ));

    try {
      const idReal = idEncomenda; 
      await fetch(`${API_URL}/encomendas/${idReal}/producao`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ st_producao: novoStatus })
      });
      carregarEncomendas();
    } catch (error) {
      console.error("Erro ao salvar status", error);
    }
  }

  const formatarData = (dataIso) => {
    if (!dataIso) return "";
    try {
        const datePart = dataIso.split('T')[0];
        const [ano, mes, dia] = datePart.split('-');
        return `${dia}/${mes}/${ano}`;
    } catch (e) {
        return dataIso; 
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
      
      {/* Loading simples enquanto baixa a foto do modal */}
      {loadingModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mb-2"></div>
                <span className="text-sm font-bold text-gray-700">Baixando Foto...</span>
            </div>
         </div>
      )}

      {encomendaSelecionada && (
        <DetalhesTortas 
            encomenda={encomendaSelecionada} 
            onClose={() => setEncomendaSelecionada(null)} 
        />
      )}

      {/* HEADER */}
      <div className="bg-blue-800 p-4 text-white shadow-lg sticky top-0 z-20 border-b-4 border-blue-900">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
                👩‍🍳 Cozinha: Camila
            </h1>
            <p className="text-xs text-blue-200 font-medium tracking-wide">PAINEL DE TORTAS</p>
          </div>
          <button onClick={carregarEncomendas} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-bold text-sm border border-white/20">
            ↻ Atualizar
          </button>
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
             <p className="text-gray-400">Nenhuma torta pendente para hoje.</p>
           </div>
        )}

        {encomendas.map((enc) => {
          const idItem = enc.id_encomendas || enc.id_ordemservicos;
          const statusProducao = enc.st_producao || ST_PRODUCAO.EM_PRODUCAO;
          const isPronto = statusProducao == ST_PRODUCAO.PRONTO;
          const isCancelado = enc.st_status == 3 || statusProducao == ST_PRODUCAO.CANCELADO;

          let cardClass = "bg-white border-l-blue-600 shadow-sm cursor-pointer hover:shadow-md hover:translate-x-1"; 
          if (isPronto) cardClass = "bg-green-50 border-l-green-500 shadow-none opacity-90";
          if (isCancelado) cardClass = "bg-gray-100 border-l-gray-400 opacity-60 grayscale cursor-default";

          const nomeCliente = enc.nm_nomefantasia || "Consumidor Final";
          const dataEntrega = enc.dt_formatada || formatarData(enc.dt_abertura);
          const horaEntrega = enc.hr_horaenc || "??:??";

          return (
            <div 
                key={idItem} 
                className={`relative border-l-[10px] rounded-lg flex flex-col transition-all duration-300 overflow-hidden ${cardClass}`}
                // MUDANÇA: Agora chamamos handleAbrirDetalhes em vez de setEncomendaSelecionada direto
                onClick={() => handleAbrirDetalhes(enc)}
            >
              
              <div className="p-5 flex gap-4">
                <div className="flex flex-col items-center justify-start min-w-[80px] border-r border-gray-100 pr-4">
                    <span className={`text-3xl font-black tracking-tighter ${isPronto ? 'text-green-700' : 'text-gray-800'}`}>
                        {horaEntrega}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mt-1 text-center leading-tight">
                        {dataEntrega}
                    </span>
                    {isPronto && (
                        <div className="mt-2 bg-green-100 text-green-700 p-1 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CLIENTE / DESTINO</span>
                        <h3 className={`text-xl font-bold leading-tight uppercase ${isPronto ? 'text-green-900' : 'text-blue-900'}`}>
                            {nomeCliente}
                        </h3>
                    </div>

                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-2">
                                <span className="mt-1 w-2 h-2 rounded-full bg-blue-400"></span>
                                <p className="text-sm font-semibold text-gray-600 leading-snug">
                                    {enc.vl_tamanho ? `${enc.vl_tamanho} kg` : enc.produto_nome || "Ver Detalhes"}
                                </p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                        {enc.ds_observacao && (
                            <p className="text-xs text-red-500 mt-1 ml-4 italic truncate">
                                ⚠ {enc.ds_observacao}
                            </p>
                        )}
                        {enc.ds_recheio && (
                             <p className="text-xs text-gray-500 mt-1 ml-4 truncate">
                                + {enc.ds_recheio}
                            </p>
                        )}
                    </div>
                </div>
              </div>

              {!isCancelado && (
                <button
                  onClick={(e) => {
                      e.stopPropagation();
                      alterarStatusProducao(idItem, isPronto ? ST_PRODUCAO.EM_PRODUCAO : ST_PRODUCAO.PRONTO);
                  }}
                  className={`w-full py-3 font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                    ${isPronto 
                        ? 'bg-gray-200 text-gray-500 hover:bg-gray-300' 
                        : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                    }`}
                >
                  {isPronto ? <>↩ Voltar para Produção</> : <>✓ Marcar como Pronto</>}
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