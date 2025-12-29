import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- ÍCONES ---
const IconSearch = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconPlus = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;
const IconCalendar = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconClock = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconUser = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconPhone = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IconFilter = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;

// Componente do Menu Lateral (Reutilizado para manter o padrão)
const Sidebar = () => (
  <aside className="w-64 bg-white shadow-xl flex flex-col z-10 border-r border-gray-200 hidden md:flex">
    <div className="p-8 flex flex-col items-center justify-center border-b border-gray-100 bg-gray-50/50">
       <img src="/logo-cafe-francesa.png" alt="Logo" className="w-20 h-20 mb-3 object-contain rounded-full bg-white p-1 border border-gray-100 shadow-sm" onError={(e) => {e.target.style.display='none'}} />
       <div className="text-center"><span className="block text-red-700 font-extrabold text-xl tracking-wider">CAFÉ</span><span className="block text-gray-600 font-semibold tracking-wide text-sm">FRANCESA</span></div>
    </div>
    {/* Você pode adicionar os itens do menu aqui se quiser navegar */}
  </aside>
);

function ConsultaEncomenda() {
  const navigate = useNavigate();
  const API_URL = "http://127.0.0.1:3001";

  // 1. Pegamos a data de hoje no formato YYYY-MM-DD (padrão do input date)
  const dataHoje = new Date().toISOString().split('T')[0];

  // 2. Inicializamos o estado JÁ com a data preenchida
  const [filtros, setFiltros] = useState({
    nm_nomefantasia: "",
    nr_telefone: "",
    dt_abertura: dataHoje, // <--- AQUI A MUDANÇA: Começa com hoje em vez de vazio ""
    hr_horaenc: ""
  });

  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  // 3. O useEffect executa ao abrir a tela. 
  // Como 'filtros.dt_abertura' já tem valor, ele vai buscar as de hoje.
  useEffect(() => {
    handlePesquisar();
  }, []);

  // ... (resto do código igual) ...
  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const mascaraTelefone = (valor) => {
    // Mesma lógica de máscara do cadastro
    valor = valor.replace(/\D/g, "").substring(0, 11);
    if (valor.length <= 10) {
        valor = valor.replace(/^(\d{2})(\d)/, "$1-$2").replace(/-(\d{4})(\d)/, "-$1-$2");
    } else {
        valor = valor.replace(/^(\d{2})(\d)/, "$1-$2").replace(/-(\d{5})(\d)/, "-$1-$2");
    }
    return valor;
  };

  const handlePhoneChange = (e) => {
    setFiltros({ ...filtros, nr_telefone: mascaraTelefone(e.target.value) });
  };

  const handlePesquisar = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setBuscaRealizada(true);

    try {
      // Usamos a rota /filtrar que criamos no backend (POST)
      const response = await fetch(`${API_URL}/encomendas/filtrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtros)
      });

      if (response.ok) {
        const data = await response.json();
        setResultados(data);
      } else {
        alert("Erro ao buscar encomendas.");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (encomenda) => {
    // Navega para a tela de cadastro PASSANDO os dados da encomenda
    // Isso requer ajuste na tela de cadastro para ler 'state'
    navigate('/cadastro-encomendas', { state: { encomendaParaEditar: encomenda } });
  };

  const handleNovaEncomenda = () => {
    navigate('/cadastro-encomendas'); // Vai para a tela vazia
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* CABEÇALHO */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-red-600 bg-red-50 p-2 rounded-lg"><IconSearch /></span>
              Consulta de Encomendas
            </h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie e localize pedidos rapidamente.</p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={() => navigate('/menu')} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                Voltar Menu
             </button>
             <button onClick={handleNovaEncomenda} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                <IconPlus /> Nova Encomenda
             </button>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO */}
        <div className="flex-1 p-8 overflow-y-auto">
          
          {/* FILTROS */}
          <form onSubmit={handlePesquisar} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 animate-fadeIn">
            <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold border-b border-gray-100 pb-2">
                <IconFilter /> Filtros de Pesquisa
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
                <input type="text" name="nm_nomefantasia" value={filtros.nm_nomefantasia} onChange={handleChange} placeholder="Nome do cliente..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" />
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                <input type="text" name="nr_telefone" value={filtros.nr_telefone} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                <input type="date" name="dt_abertura" value={filtros.dt_abertura} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label>
                <input type="time" name="hr_horaenc" value={filtros.hr_horaenc} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" />
              </div>

              <div className="md:col-span-1 flex items-end">
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-sm flex justify-center items-center">
                  {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : <IconSearch />}
                </button>
              </div>
            </div>
          </form>

          {/* LISTAGEM DE RESULTADOS */}
          <div className="space-y-4">
            {resultados.length > 0 ? (
              resultados.map((item, index) => (
                <div 
                  key={item.id_ordemservicos || index} 
                  onClick={() => handleEditar(item)}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-red-300 cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div className="flex gap-6 items-center">
                    {/* Data e Hora Box */}
                    <div className="bg-red-50 px-4 py-2 rounded-lg text-center min-w-[90px] border border-red-100 group-hover:bg-red-100 transition-colors">
                        <div className="text-xs text-red-600 font-bold uppercase tracking-wider">Entrega</div>
                        <div className="text-lg font-extrabold text-gray-800">{item.dt_formatada || item.dt_abertura}</div>
                        <div className="text-sm font-semibold text-gray-600 flex items-center justify-center gap-1">
                            <IconClock /> {item.hr_horaenc}
                        </div>
                    </div>

                    {/* Dados do Cliente */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 group-hover:text-red-600 transition-colors">
                            {item.nm_nomefantasia || "Cliente sem nome"}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><IconPhone /> {item.nr_telefone || "Sem telefone"}</span>
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                                ID: {item.id_ordemservicos}
                            </span>
                        </div>
                    </div>
                  </div>

                  {/* Seta e Status */}
                  <div className="flex items-center gap-4">
                     {/* Badge de Status (Exemplo) */}
                     <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.st_status === '2' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                        {item.st_status === '2' ? 'Entrega' : 'Retirada'}
                     </span>
                     <svg className="w-6 h-6 text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                     </svg>
                  </div>
                </div>
              ))
            ) : (
              buscaRealizada && !loading && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="inline-block p-4 bg-gray-50 rounded-full mb-3 text-gray-400">
                        <IconSearch />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">Nenhuma encomenda encontrada</h3>
                    <p className="text-gray-400 text-sm mt-1">Tente mudar os filtros ou cadastre um novo pedido.</p>
                </div>
              )
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default ConsultaEncomenda;