import React from "react";
import { useState, useEffect } from "react";

function Home() {
  const [encomendas, setEncomendas] = useState([]);
  const [empregados, setEmpregados] = useState([]);
  const [cores, setCores] = useState({});

  const BASE_URL = import.meta.env.VITE_API_URL || "";
  
  // PALETA DE CORES FIXA
  const CORES_PALETA = [
    "#2563eb", // Azul (Blue 600)
    "#dc2626", // Vermelho (Red 600)
    "#16a34a", // Verde (Green 600)
    "#d97706", // Amarelo Queimado/Ouro (Yellow 600)
  ];

  useEffect(() => {
    carregarEncomendas();
    carregarEmpregados();
  }, []);

  
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

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
      
      const empregadosOrdenados = data.sort((a, b) => a.id_empregados - b.id_empregados);
      setEmpregados(empregadosOrdenados);

      // --- LOGICA DAS CORES FIXAS ---
      const mapaCores = {};
      empregadosOrdenados.forEach((emp, index) => {
        const corEscolhida = CORES_PALETA[index % CORES_PALETA.length];
        mapaCores[emp.id_empregados] = corEscolhida;
      });
      setCores(mapaCores);

    } catch (err) {
      console.error(err);
      alert("Erro ao carregar empregados.");
    }
  }

  function agruparPorId() {
    const grupos = {};
    empregados.forEach(emp => {
      grupos[emp.id_empregados] = {
        nome: emp.nm_nomefantasia,
        lista: []
      };
    });
    encomendas.forEach(enc => {
      // ATENÇÃO: Confirme se o campo que vem do backend é 'id_empregado' ou 'id_usuarios'
      // Ajuste aqui conforme o retorno do seu SELECT *
      const idFuncionario = enc.id_empregado || enc.id_usuarios; 
      
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
                backgroundColor: cores[id] || '#9ca3af',
                textShadow: '0px 1px 2px rgba(0,0,0,0.3)'
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
                  {dadosDoGrupo.lista.map((enc, i) => {
                    

                    // ADICIONE ESTA LINHA TEMPORARIAMENTE
                    console.log(`Encomenda: ${enc.nm_nomefantasia}, Status:`, enc.st_status);

                    // --- LÓGICA VISUAL DO STATUS ---
                    // 1 = Pendente | 2 = Entregue | 3 = Cancelado
                    const isPendente = enc.st_status == 1;
                    const isEntregue = enc.st_status == 2;
                    const isCancelado = enc.st_status == 3;

                    let rowClass = "hover:bg-gray-50 transition-colors";
                    let textStyle = "text-gray-700";
                    let horaStyle = "font-bold text-red-600";

                    if (isEntregue) {
                        rowClass = "bg-green-50 hover:bg-green-100 opacity-70"; 
                        textStyle = "text-green-800 line-through decoration-green-600 font-medium";
                        horaStyle = "text-green-800 line-through decoration-green-600";
                    } else if (isCancelado) {
                        rowClass = "bg-red-50 hover:bg-red-100 opacity-70";
                        textStyle = "text-red-800 line-through decoration-red-600 font-medium";
                        horaStyle = "text-red-800 line-through decoration-red-600";
                    }

                    return (
                      <tr key={i} className={rowClass}>
                        <td className={`px-4 py-3 border-r text-center ${horaStyle}`}>
                            {/* Usa hr_horaenc se vier do banco, ou hora se vier tratado */}
                            {enc.hr_horaenc || enc.hora}
                        </td>
                        <td className={`px-4 py-3 border-r truncate max-w-[150px] ${textStyle}`} title={enc.nm_nomefantasia || enc.cliente}>
                          {enc.nm_nomefantasia || enc.cliente}
                        </td>
                        <td className={`px-4 py-3 ${textStyle}`}>
                          {enc.produto_nome || enc.ds_grupo || "Encomenda"} 
                        </td>
                      </tr>
                    );
                  })}
                  
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