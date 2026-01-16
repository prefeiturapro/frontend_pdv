import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CupomEncomenda } from "../../components/CupomEncomenda"; 

// --- ÍCONES ---
const IconSearch = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconPlus = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;
const IconClock = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconPhone = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IconFilter = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const IconCheck = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconX = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconPrinter = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" /></svg>;

const Sidebar = () => (
  <aside className="w-64 bg-white shadow-xl flex flex-col z-10 border-r border-gray-200 hidden md:flex">
    <div className="p-8 flex flex-col items-center justify-center border-b border-gray-100 bg-gray-50/50">
       <img src="/logo-cafe-francesa.png" alt="Logo" className="w-20 h-20 mb-3 object-contain rounded-full bg-white p-1 border border-gray-100 shadow-sm" onError={(e) => {e.target.style.display='none'}} />
       <div className="text-center"><span className="block text-red-700 font-extrabold text-xl tracking-wider">CAFÉ</span><span className="block text-gray-600 font-semibold tracking-wide text-sm">FRANCESA</span></div>
    </div>
  </aside>
);

function ConsultaEncomenda() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
  const dataHoje = new Date().toISOString().split('T')[0];

  const [filtros, setFiltros] = useState({ nm_nomefantasia: "", nr_telefone: "", dt_abertura: dataHoje, hr_horaenc: "" });
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const [dadosParaImpressao, setDadosParaImpressao] = useState(null); 

  // --- FUNÇÃO DE IMPRESSÃO ---
  const handlePrint = () => {
      setTimeout(() => {
          window.print();
      }, 100);
  };

  const abrirModalImpressao = (item) => {
      setDadosParaImpressao(item); 
  };

  const fecharModalImpressao = () => {
      setDadosParaImpressao(null);
  };

  useEffect(() => { handlePesquisar(); }, []);
  
  const handleChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });
  
  const mascaraTelefone = (valor) => {
    valor = valor.replace(/\D/g, "").substring(0, 11);
    if (valor.length <= 10) valor = valor.replace(/^(\d{2})(\d)/, "$1-$2").replace(/-(\d{4})(\d)/, "-$1-$2");
    else valor = valor.replace(/^(\d{2})(\d)/, "$1-$2").replace(/-(\d{5})(\d)/, "-$1-$2");
    return valor;
  };
  
  const handlePhoneChange = (e) => setFiltros({ ...filtros, nr_telefone: mascaraTelefone(e.target.value) });

  const handlePesquisar = async (e) => {
    if(e) e.preventDefault();
    setLoading(true); 
    setBuscaRealizada(true);
    
    try {
      const response = await fetch(`${API_URL}/encomendas/filtrar`, { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          // OTIMIZAÇÃO: Trazemos a lista LEVE (sem a foto pesada)
          body: JSON.stringify({ ...filtros, trazerFoto: false }) 
      });
      
      if (response.ok) setResultados(await response.json());
      else alert("Erro ao buscar.");
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // --- MUDANÇA IMPORTANTE: PREPARAÇÃO PARA EDIÇÃO ---
  const handleEditar = async (enc) => {
    if (enc.st_status == 2 || enc.st_status == 3) {
       alert("Não é possível editar um pedido que já foi Entregue ou Cancelado.");
       return; 
    }

    // 1. Ativa o loading para o usuário saber que estamos buscando os dados
    setLoading(true);

    try {
        // 2. Buscamos a encomenda novamente, dessa vez pedindo a FOTO (trazerFoto: true)
        // Isso garante que a tela de cadastro receba a imagem para exibir no preview.
        const response = await fetch(`${API_URL}/encomendas/filtrar`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ 
                id_ordemservicos: enc.id_ordemservicos, // Busca pelo ID exato
                trazerFoto: true // Pede a foto pesada apenas agora!
            }) 
        });

        const dadosCompletos = await response.json();

        if (dadosCompletos && dadosCompletos.length > 0) {
             // 3. Navega passando o objeto COMPLETO (com foto)
             navigate('/cadastro-encomendas', { state: { encomendaParaEditar: dadosCompletos[0] } });
        } else {
             // Fallback: se der erro, tenta ir com o que tem (sem foto)
             navigate('/cadastro-encomendas', { state: { encomendaParaEditar: enc } });
        }

    } catch (error) {
        console.error("Erro ao preparar edição:", error);
        alert("Erro de conexão ao abrir edição.");
    } finally {
        setLoading(false);
    }
  }

  const handleStatusChange = async (e, id, novoStatus) => {
    e.stopPropagation();
    
    if (!id) {
        alert("ERRO GRAVE: O ID da encomenda está vazio. Contate o suporte.");
        return;
    }

    const msgstatus = novoStatus === 2 ? "Deseja alterar o status para Entregue?" : "Deseja cancelar o pedido?";
    if (!window.confirm(msgstatus)) return;

    try {
        const response = await fetch(`${API_URL}/encomendas/${id}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ st_status: novoStatus }) 
        });

        if (response.ok) {
            setResultados(prev => prev.map(item => {
                if (item.id_ordemservicos == id) return { ...item, st_status: novoStatus };
                return item;
            }));
        } else {
            console.error("Erro do Servidor:", response.status);
            alert("Erro ao alterar status.");
        }
    } catch (error) { 
        console.error("Erro de rede:", error);
        alert("Erro de conexão."); 
    }
  };
    
  const handleNovaEncomenda = () => navigate('/cadastro-encomendas');

  return (
    <div>
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; position: absolute; top: 0; left: 0; width: 100%; background: white; z-index: 9999; }
            @page { margin: 0; }
            body { margin: 0; padding: 0; background: white; }
          }
        `}
      </style>

      <div className="flex min-h-screen bg-gray-100 font-sans no-print">
        
        {/* MODAL IMPRESSÃO */}
        {dadosParaImpressao && (
            <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="bg-white p-4 rounded-lg shadow-2xl flex flex-col items-center">
                    <p className="text-gray-500 text-sm font-bold mb-2">Visualização</p>
                    <div style={{ border: "1px solid #ddd", marginBottom: "10px", maxHeight: "60vh", overflowY: "auto" }}>
                        <CupomEncomenda dados={dadosParaImpressao} />
                    </div>
                    <div className="flex gap-2 w-full mt-2">
                        <button onClick={fecharModalImpressao} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold">Fechar</button>
                        <button onClick={handlePrint} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold flex items-center justify-center gap-2">
                            <IconPrinter /> Imprimir
                        </button>
                    </div>
                </div>
            </div>
        )}

        <Sidebar />

        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
            <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
                <div><h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><span className="text-red-600 bg-red-50 p-2 rounded-lg"><IconSearch /></span>Consulta de Encomendas</h1><p className="text-sm text-gray-500 mt-1">Gerencie e localize pedidos rapidamente.</p></div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/menu')} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Voltar Menu</button>
                    <button onClick={handleNovaEncomenda} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"><IconPlus /> Nova Encomenda</button>
                </div>
            </header>

            <div className="flex-1 p-8 overflow-y-auto">
                <form onSubmit={handlePesquisar} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold border-b border-gray-100 pb-2"><IconFilter /> Filtros de Pesquisa</div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label><input type="text" name="nm_nomefantasia" value={filtros.nm_nomefantasia} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-gray-50" /></div>
                        <div className="md:col-span-3"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label><input type="text" name="nr_telefone" value={filtros.nr_telefone} onChange={handlePhoneChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-gray-50" /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label><input type="date" name="dt_abertura" value={filtros.dt_abertura} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-gray-50" /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label><input type="time" name="hr_horaenc" value={filtros.hr_horaenc} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-gray-50" /></div>
                        <div className="md:col-span-1 flex items-end"><button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm flex justify-center items-center">{loading ? "..." : <IconSearch />}</button></div>
                    </div>
                </form>

                <div className="space-y-4">
                    {resultados.length > 0 ? (
                        resultados.map((item, index) => {
                            const status = item.st_status;
                            let badgeClass = status == 1 ? "bg-yellow-100 text-yellow-800" : status == 2 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
                            let statusText = status == 1 ? "🕒 Aguardando retirada" : status == 2 ? "✅ Entregue" : "🚫 Cancelado";
                            return (
                                <div key={item.id_ordemservicos || index} onClick={() => handleEditar(item)} className="p-5 rounded-xl border border-gray-200 hover:shadow-md cursor-pointer bg-white flex justify-between items-center group">
                                    <div className="flex gap-6 items-center">
                                        <div className="px-4 py-2 rounded-lg text-center border bg-gray-50">
                                            <div className="text-lg font-extrabold text-gray-800">{item.dt_formatada || item.dt_abertura}</div>
                                            <div className="text-sm font-semibold text-gray-600 flex justify-center gap-1"><IconClock /> {item.hr_horaenc}</div>
                                        </div>
                                        <div><h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600">{item.nm_nomefantasia || "Cliente"}</h3><div className="flex items-center gap-4 mt-1 text-sm text-gray-500"><span className="flex items-center gap-1"><IconPhone /> {item.nr_telefone}</span></div></div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>{statusText}</span>
                                        <button onClick={(e) => { e.stopPropagation(); abrirModalImpressao(item); }} className="p-2 text-gray-500 border rounded-lg hover:bg-gray-100"><IconPrinter /></button>
                                        {status == 1 && (<div className="flex gap-2 pl-2 border-l"><button onClick={(e) => handleStatusChange(e, item.id_ordemservicos, 2)} className="p-2 bg-green-100 text-green-600 rounded-full hover:scale-110"><IconCheck /></button><button onClick={(e) => handleStatusChange(e, item.id_ordemservicos, 3)} className="p-2 bg-red-100 text-red-600 rounded-full hover:scale-110"><IconX /></button></div>)}
                                    </div>
                                </div>
                            );
                        })
                    ) : ( buscaRealizada && !loading && <div className="text-center py-12 bg-white rounded-2xl border border-dashed"><h3 className="text-gray-600">Nenhum pedido encontrado</h3></div> )}
                </div>
            </div>
        </main>
      </div>

      <div className="print-only hidden">
          <CupomEncomenda dados={dadosParaImpressao || {}} />
      </div>

    </div>
  );
}

export default ConsultaEncomenda;