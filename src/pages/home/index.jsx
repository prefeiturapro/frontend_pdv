import React from "react";
import { useState, useEffect } from "react";

function Home() {
  const [encomendas, setEncomendas] = useState([]);
  const [empregados, setEmpregados] = useState([]);
  const [cores, setCores] = useState({});

const BASE_URL = import.meta.env.VITE_API_URL || "";
  
  // PALETA DE CORES FIXA (Tons um pouco mais escuros para o texto branco aparecer bem)
const CORES_PALETA = [
  "#2563eb", // Azul (Blue 600)
  "#dc2626", // Vermelho (Red 600)
  "#16a34a", // Verde (Green 600)
  "#d97706", // Amarelo Queimado/Ouro (Yellow 600) - Para dar leitura com texto branco
 ];

  useEffect(() => {
    carregarEncomendas();
    carregarEmpregados();
  }, []);

  const API_URL = "http://localhost:3001";

  async function carregarEncomendas() {
    try {
      const res = await fetch(`${API_URL}/encomendas`);
      if (!res.ok) throw new Error("Erro ao carregar encomendas");
      const data = await res.json();
      setEncomendas(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function carregarEmpregados() {
    try {
      const res = await fetch(`${API_URL}/empregados`);
      if (!res.ok) throw new Error("Erro ao carregar empregados");
      const data = await res.json();
      
      // Ordena por nome ou ID para garantir que a ordem seja sempre a mesma
      const empregadosOrdenados = data.sort((a, b) => a.id_empregados - b.id_empregados);
      
      setEmpregados(empregadosOrdenados);

      // --- LOGICA DAS CORES FIXAS ---
      const mapaCores = {};
      
      empregadosOrdenados.forEach((emp, index) => {
        // O operador % faz o loop: 0, 1, 2, 3, 0, 1, 2...
        const corEscolhida = CORES_PALETA[index % CORES_PALETA.length];
        mapaCores[emp.id_empregados] = corEscolhida;
      });
      
      setCores(mapaCores);

    } catch (err) {
      console.error(err);
      alert("Erro ao carregar empregados.");
    }
  }

  // ... (Mantenha a função agruparPorId igualzinha estava) ...
  function agruparPorId() {
    const grupos = {};
    empregados.forEach(emp => {
      grupos[emp.id_empregados] = {
        nome: emp.nm_nomefantasia,
        lista: []
      };
    });
    encomendas.forEach(enc => {
      const idFuncionario = enc.id_empregado; 
      if (grupos[idFuncionario]) {
        grupos[idFuncionario].lista.push(enc);
      }
    });
    return grupos;
  }

  const grupos = agruparPorId();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
        PAINEL DE ENCOMENDAS - {new Date().toLocaleDateString()}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(grupos).map(([id, dadosDoGrupo]) => (
          <div key={id} className="border rounded-lg shadow-md bg-white overflow-hidden flex flex-col">
            
            {/* CABEÇALHO COM COR FIXA */}
            <div 
              className="p-3 text-white font-bold text-center text-lg uppercase tracking-wider shadow-sm"
              style={{
                backgroundColor: cores[id] || '#9ca3af', // Usa a cor do mapa
                textShadow: '0px 1px 2px rgba(0,0,0,0.3)' // Sombra no texto para leitura melhor no amarelo
              }}
            >
              {dadosDoGrupo.nome} 
            </div>

            {/* TABELA */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 border-b">Hora</th>
                    <th className="px-4 py-3 border-b">Cliente</th>
                    <th className="px-4 py-3 border-b">Produto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dadosDoGrupo.lista.map((enc, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-r font-bold text-red-600 text-center">
                         {enc.hora}
                      </td>
                      <td className="px-4 py-3 border-r text-gray-700 truncate max-w-[150px]" title={enc.cliente}>
                        {enc.cliente}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-medium">
                        {enc.produto_nome || enc.ds_grupo} 
                      </td>
                    </tr>
                  ))}
                  {dadosDoGrupo.lista.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-gray-400 text-center italic">
                        Nenhuma encomenda hoje
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;