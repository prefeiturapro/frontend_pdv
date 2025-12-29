import React, { useState, useEffect } from "react";

// --- Ícones SVG ---
const IconUser = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconPhone = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IconMail = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconMap = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconClose = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;

const CadastroContribuinte = ({ isOpen, onClose, telefoneInicial, aoSalvar }) => {
  const API_URL = "http://127.0.0.1:3001";

  const [formData, setFormData] = useState({
    nr_telefone: "",
    nm_nomefantasia: "",
    ds_email: "",
    nm_logradouro: "",
    nm_bairro: ""
  });

  const [loading, setLoading] = useState(false);

  // Preenche o telefone automaticamente quando o modal abre
  useEffect(() => {
    if (isOpen && telefoneInicial) {
      setFormData(prev => ({ ...prev, nr_telefone: telefoneInicial }));
    }
  }, [isOpen, telefoneInicial]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Enviando dados:", formData);
      const response = await fetch(`${API_URL}/contribuintes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Cliente cadastrado com sucesso!");
        // Passa os dados de volta para a tela pai (Encomendas) preencher os campos
        if (aoSalvar) aoSalvar(formData); 
        onClose();
      } else {
        alert("Erro: " + (data.erro || "Falha ao cadastrar"));
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <IconUser className="text-white" /> Novo Cliente
          </h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
            <IconClose />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telefone */}
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Telefone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconPhone /></div>
                <input 
                  type="text" name="nr_telefone" 
                  value={formData.nr_telefone} onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50"
                  required 
                />
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconMail /></div>
                <input 
                  type="email" name="ds_email" 
                  value={formData.ds_email} onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconUser /></div>
              <input 
                type="text" name="nm_nomefantasia" 
                value={formData.nm_nomefantasia} onChange={handleChange}
                placeholder="Ex: João da Silva"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50"
                required 
              />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Endereço (Rua e Número)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconMap /></div>
              <input 
                type="text" name="nm_logradouro" 
                value={formData.nm_logradouro} onChange={handleChange}
                placeholder="Ex: Rua das Flores, 123"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50"
              />
            </div>
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Bairro</label>
            <input 
              type="text" name="nm_bairro" 
              value={formData.nm_bairro} onChange={handleChange}
              placeholder="Ex: Centro"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50"
            />
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
            <button 
              type="button" onClick={onClose}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {loading ? "Salvando..." : "Cadastrar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroContribuinte;