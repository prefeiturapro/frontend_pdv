import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import CadastroContribuinte from "../contribuinte/cadastrocontribuinte";

// --- ÍCONES SVG ---
const IconCliente = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IconCakeMenu = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"/></svg>;
const IconPhoneInput = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>;
const IconUserInput = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;

// --- COMPONENTE INTERNO PARA SWITCHES ---
const ToggleSwitch = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <button type="button" onClick={onChange} className={`${checked === 'S' ? 'bg-red-600' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}>
      <span className={`${checked === 'S' ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm`} />
    </button>
  </div>
);

// --- INPUT DE PESO (KG) ---
const WeightInput = ({ label, name, value, onChange }) => (
    <div className="flex flex-col">
        <label className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide min-h-[32px] flex items-end">{label}</label>
        <div className="relative">
            <input type="number" name={name} value={value} onChange={onChange} placeholder="0.0" step="0.1" className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 transition-all hover:bg-white text-center font-medium text-gray-700" />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 font-medium pointer-events-none">kg</span>
        </div>
    </div>
);

// --- INPUT DE UNIDADE (UN) ---
const UnitInput = ({ label, name, value, onChange }) => (
    <div className="flex flex-col">
        <label className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide min-h-[32px] flex items-end">{label}</label>
        <div className="relative">
            <input type="number" name={name} value={value} onChange={onChange} placeholder="0" className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 transition-all hover:bg-white text-center font-medium text-gray-700" />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 text-xs font-bold pointer-events-none">UN</span>
        </div>
    </div>
);

function CadastroEncomenda() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = "http://127.0.0.1:3001"; 

  const [modalClienteAberto, setModalClienteAberto] = useState(false);

  // --- ESTADO DO FORMULÁRIO ---
  const [formData, setFormData] = useState({
    // ABA CLIENTE
    id_ordemservicos: null, // Importante para saber se é edição
    id_usuarios: localStorage.getItem("id_usuario_logado") || 1,
    nr_telefone: "", nm_nomefantasia: "", dt_agendamento: "", hr_horaenc: "19:00", st_status: 1, id_contribuintes: 1, observacao: "",

    // ABA TORTAS
    ds_recheio: "", ds_decoracao: "", vl_tamanho: "", ds_topo: "N", ds_papel: "N", ds_gliter: "N", ds_redonda: "N", ds_quadrada: "N",
    ds_menino: "N", ds_menina: "N", ds_mulher: "N", ds_homem: "N", ds_po: "N", ds_tabuleiro: "N", ds_cafeboard: "N",
    ds_obstortas: "", ds_fototorta: null,

    // ABA BOLOS
    vl_bolpamon: "", vl_bolmilho: "", vl_bolchoc: "", vl_bolintban: "", vl_bolmult: "", vl_boltoic: "", vl_bolceno: "", vl_bolamend: "",
    vl_bolbrownie: "", vl_bolprest: "", vl_bolbanana: "", vl_bolaveia: "", vl_bollaranj: "", vl_bolcuca: "", ds_obsbolo: "",

    // ABA SALGADOS
    vl_risfrango: "", vl_rispresque: "", vl_coxinha: "", vl_pastelcar: "", vl_pastelban: "", vl_salsic: "", vl_quibe: "", vl_bolquei: "", vl_rispalm: "", vl_pastmil: "", ds_obssalg: "",

    // ABA MINI'S
    vl_assadfra: "", vl_assadcar: "", vl_assadcho: "", vl_mindonu: "", vl_minempa: "", vl_miniquic: "", vl_minibaufr: "", vl_minibaupr: "",
    vl_minibauca: "", vl_minicook: "", vl_minix: "", vl_minisoave: "", vl_minicacho: "", vl_minipaoca: "", vl_minipaofr: "", vl_minisonre: "",
    vl_paominix: "", vl_mnipizza: "", ds_obsminis: "",

    // ABA DIVERSOS
    vl_barc: "", vl_paofr: "", vl_paodoc: "", vl_sandfrint: "", vl_sandfr: "", vl_sandfra: "", vl_doccam: "", vl_cricri: "",
    vl_tortsa: "", vl_maeben: "", vl_cookie: "", vl_paoque: "", vl_pudin: "", vl_paocach: "", vl_paoham: "", vl_marr: "",
    vl_sonsere: "", vl_sonavel: "", vl_sondoc: "", vl_sonbal: "", vl_cava: "", vl_empad: "", vl_quich: "", vl_empagr: "",
    vl_cacho: "", vl_pizza: "", ds_obsdiv: ""
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("cliente");
  const [carregandoCliente, setCarregandoCliente] = useState(false);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // --- EFEITO: Carrega dados se vier da Consulta (Edição) ---
  useEffect(() => {
    if (location.state && location.state.encomendaParaEditar) {
      const dados = location.state.encomendaParaEditar;
      console.log("Modo Edição Ativado. Dados:", dados);

      // Tratamento da Data
      let dataFormatada = "";
      if (dados.dt_abertura) {
         dataFormatada = dados.dt_abertura.split('T')[0];
      }

      // Tratamento do Telefone
      const telefoneTratado = mascaraTelefoneDB(dados.nr_telefone || "");

      // Tratamento dos Valores (Inteiro vs Decimal)
      const camposPorKg = [
          'vl_tamanho', 'vl_bolpamon', 'vl_bolmilho', 'vl_bolchoc', 'vl_bolintban', 'vl_bolmult',
          'vl_boltoic', 'vl_bolceno', 'vl_bolamend', 'vl_bolbrownie', 'vl_bolprest',
          'vl_bolbanana', 'vl_bolaveia', 'vl_bollaranj', 'vl_bolcuca'
      ];

      const dadosTratados = { ...dados };

      Object.keys(dadosTratados).forEach(key => {
          if (key.startsWith('vl_')) {
              const valor = dadosTratados[key];
              if (!camposPorKg.includes(key) && valor !== null && valor !== undefined) {
                  dadosTratados[key] = parseInt(valor, 10); 
              }
          }
      });

      // --- TRATAMENTO DA FOTO (BUFFER DO BANCO DE DADOS) ---
      if (dados.ds_fototorta) {
          try {
              // Verifica se é o formato Buffer do Node.js (Postgres Bytea)
              if (dados.ds_fototorta.type === 'Buffer' && Array.isArray(dados.ds_fototorta.data)) {
                  const buffer = new Uint8Array(dados.ds_fototorta.data);
                  const blob = new Blob([buffer], { type: 'image/jpeg' }); 
                  const urlImagem = URL.createObjectURL(blob);
                  setPreviewUrl(urlImagem);
                  
                  // Mantemos o dado original no formData para saber que já tem foto, 
                  // mas não vamos reenviar esse buffer no save se não for alterado.
              } else if (typeof dados.ds_fototorta === 'string') {
                  // Caso venha como Base64 (menos comum para Bytea puro, mas possível)
                  // setPreviewUrl(`data:image/jpeg;base64,${dados.ds_fototorta}`);
                  console.warn("Formato string recebido para imagem, verifique o backend.");
              }
          } catch (err) {
              console.error("Erro ao converter imagem do banco:", err);
          }
      }

      // Preenche o formulário
      setFormData((prev) => ({
        ...prev,
        ...dadosTratados,
        dt_agendamento: dataFormatada, 
        nr_telefone: telefoneTratado,
        id_ordemservicos: dados.id_ordemservicos
      }));
    }
  }, [location]);

  const menuItems = [
    { id: "cliente", label: "Cliente", icon: <IconCliente /> },
    { id: "tortas", label: "Tortas", icon: <IconCakeMenu /> },
    { id: "bolos", label: "Bolos", icon: <IconCakeMenu /> },
    { id: "salgados", label: "Salgadinhos", icon: <IconCakeMenu /> },
    { id: "minis", label: "Mini's", icon: <IconCakeMenu /> },
    { id: "diversos", label: "Diversos", icon: <IconCakeMenu /> },
  ];

  const mascaraTelefoneDB = (valor) => {
    if (!valor) return "";
    valor = valor.replace(/\D/g, "");
    valor = valor.substring(0, 11);
    if (valor.length <= 10) {
        valor = valor.replace(/^(\d{2})(\d)/, "$1-$2");
        valor = valor.replace(/-(\d{4})(\d)/, "-$1-$2");
    } else {
        valor = valor.replace(/^(\d{2})(\d)/, "$1-$2");
        valor = valor.replace(/-(\d{5})(\d)/, "-$1-$2");
    }
    return valor;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nr_telefone") {
      setFormData((prev) => ({ ...prev, [name]: mascaraTelefoneDB(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: prev[fieldName] === 'S' ? 'N' : 'S' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFormData((prev) => ({...prev, ds_fototorta: file})); // Armazena o ARQUIVO real
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }
  };

  const removeFile = (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('file-upload');
      if(fileInput) fileInput.value = '';
      setFormData(prev => ({...prev, ds_fototorta: null}));
      setPreviewUrl(null);
  };

  const buscarClientePorTelefone = async () => {
    const telefoneComMascara = formData.nr_telefone;
    if (!telefoneComMascara || telefoneComMascara.length < 10) return;

    setCarregandoCliente(true);
    try {
      const response = await fetch(`${API_URL}/contribuintes/${encodeURIComponent(telefoneComMascara)}`);

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          setFormData((prev) => ({ 
              ...prev, 
              id_contribuintes: data[0].id_contribuintes,
              nm_nomefantasia: data[0].nm_nomefantasia || "" 
          }));
        } else {
          setFormData((prev) => ({ ...prev, nm_nomefantasia: "" })); 
          setModalClienteAberto(true);
        }
      } else {
          setFormData((prev) => ({ ...prev, nm_nomefantasia: "" })); 
          setModalClienteAberto(true);
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
    } finally {
      setCarregandoCliente(false);
    }
  };

  const aoSalvarCliente = (dadosDoModal) => {
    setFormData((prev) => ({
      ...prev,
      id_contribuintes: dadosDoModal.id_contribuintes,
      nm_nomefantasia: dadosDoModal.nm_nomefantasia, 
      nr_telefone: dadosDoModal.nr_telefone,         
    }));
  };
  
  const handleStatusToggle = () => {
    setFormData((prev) => ({ ...prev, st_status: prev.st_status === 1 ? 2 : 1 }));
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    
    // --- 1. CRIAR FORM DATA (Para enviar arquivos binários) ---
    const formDataToSend = new FormData();

    // Adiciona todos os campos de texto/número
    Object.keys(formData).forEach(key => {
        // Ignora a foto aqui, vamos adicionar manualmente depois
        // Ignora valores nulos ou undefined para limpar a request
        if (key !== 'ds_fototorta' && formData[key] !== null && formData[key] !== undefined) {
            formDataToSend.append(key, formData[key]);
        }
    });

    // Tratamento da Data (garante formato correto)
    const dataFormatada = formData.dt_agendamento || new Date().toISOString().split('T')[0];
    formDataToSend.set('dt_abertura', dataFormatada); // set sobrescreve se já existir

    // --- 2. ADICIONAR O ARQUIVO REAL ---
    // Verifica se tem uma nova foto selecionada (Objeto File)
    if (formData.ds_fototorta && formData.ds_fototorta instanceof File) {
        formDataToSend.append('ds_fototorta', formData.ds_fototorta);
    } 
    // Se for edição e a foto não mudou (ainda é buffer do banco), NÃO mandamos o campo ds_fototorta.
    // O backend vai ser esperto e manter a imagem antiga se não receber nada novo.

    console.log(">>> ENVIANDO FORM DATA...");

    const isEdicao = !!formData.id_ordemservicos;
    const url = isEdicao 
        ? `${API_URL}/encomendas/${formData.id_ordemservicos}` 
        : `${API_URL}/encomendas`;
    
    const method = isEdicao ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
          method: method,
          // ⚠️ NÃO colocar headers: { "Content-Type": "application/json" }
          // O navegador define automaticamente como multipart/form-data com o boundary correto
          body: formDataToSend,
        });

        const data = await response.json();
        
        if (response.ok) {
          alert(`Encomenda ${isEdicao ? 'atualizada' : 'salva'} com sucesso!`);
          navigate('/encomendas/consulta'); 
        } else {
          alert(`Erro ao salvar: ${data.erro || "Verifique os dados."}`);
        }
    } catch (error) { 
        console.error("Erro:", error); 
        alert("Erro ao conectar."); 
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-white shadow-xl flex flex-col z-10 border-r border-gray-200">
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setAbaAtiva(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${abaAtiva === item.id ? "bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100 translate-x-1" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>
        <div className="p-8 flex flex-col items-center justify-center border-t border-gray-100 bg-gray-50/50">
           <img src="/logo-cafe-francesa.png" alt="Logo" className="w-20 h-20 mb-3 object-contain rounded-full bg-white p-1 border border-gray-100 shadow-sm" onError={(e) => {e.target.style.display='none'}} />
           <div className="text-center"><span className="block text-red-700 font-extrabold text-xl tracking-wider">CAFÉ</span><span className="block text-gray-600 font-semibold tracking-wide text-sm">FRANCESA</span></div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 flex flex-col h-screen overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
             {formData.id_ordemservicos ? "Editar Pedido" : "Novo Pedido"} 
             <span className="text-gray-400 font-light mx-2">/</span> 
             <span className="text-red-600">{menuItems.find(i => i.id === abaAtiva)?.label}</span>
          </h1>
        </div>

        <form onSubmit={handleSalvar} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 p-8 overflow-y-auto">
            
            {/* ABA CLIENTE */}
            {abaAtiva === "cliente" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Telefone {carregandoCliente && <span className="text-xs text-blue-500 ml-2 animate-pulse">Buscando...</span>}</label>
                  <div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconPhoneInput /></div><input type="text" name="nr_telefone" value={formData.nr_telefone} onChange={handleChange} onBlur={buscarClientePorTelefone} placeholder="48-99999-9999" maxLength={13} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 transition-all group-hover:bg-white" autoFocus required /></div>
                </div>
                <div className="md:col-span-9">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Cliente</label>
                  <div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IconUserInput /></div><input type="text" name="nm_nomefantasia" value={formData.nm_nomefantasia} onChange={handleChange} placeholder="Nome completo..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 transition-all group-hover:bg-white" required /></div>
                </div>
                <div className="md:col-span-12 border-t border-gray-100 my-2"></div>
                <div className="md:col-span-4"><label className="block text-sm font-bold text-gray-700 mb-1">Data Entrega</label><input type="date" name="dt_agendamento" value={formData.dt_agendamento} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" required /></div>
                <div className="md:col-span-4"><label className="block text-sm font-bold text-gray-700 mb-1">Hora</label><input type="time" name="hr_horaenc" value={formData.hr_horaenc} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" required /></div>
                <div className="md:col-span-4 flex flex-col justify-end pb-1">
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <span className="text-sm font-bold text-gray-700 ml-2">É para Entrega?</span>
                        <button type="button" onClick={handleStatusToggle} className={`${formData.st_status === 2 ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}><span className={`${formData.st_status === 2 ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`} /></button>
                    </div>
                </div>
                <div className="md:col-span-12"><label className="block text-sm font-bold text-gray-700 mb-1">Observação do Cliente</label><textarea name="observacao" value={formData.observacao} onChange={handleChange} rows={3} placeholder="Observações gerais..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-gray-50" /></div>
              </div>
            )}

            {/* ABA TORTAS */}
            {abaAtiva === "tortas" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
                <div className="md:col-span-5"><label className="block text-sm font-bold text-gray-700 mb-1">Decoração</label><input type="text" name="ds_decoracao" value={formData.ds_decoracao} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" /></div>
                <div className="md:col-span-5"><label className="block text-sm font-bold text-gray-700 mb-1">Recheio</label><input type="text" name="ds_recheio" value={formData.ds_recheio} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Tamanho (kg)</label><div className="relative"><input type="number" name="vl_tamanho" value={formData.vl_tamanho} onChange={handleChange} placeholder="1.5" step="0.1" className="w-full pl-4 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50" /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 font-medium pointer-events-none">kg</span></div></div>
                <div className="md:col-span-12 border-t border-gray-100 my-2"></div>
                <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <h3 className="col-span-full text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2"><IconCakeMenu /> Opções & Adicionais</h3>
                    <div className="space-y-3"><ToggleSwitch label="Formato Redondo" checked={formData.ds_redonda} onChange={() => handleSwitchChange('ds_redonda')} /><ToggleSwitch label="Formato Quadrado" checked={formData.ds_quadrada} onChange={() => handleSwitchChange('ds_quadrada')} /><ToggleSwitch label="Topo de Bolo" checked={formData.ds_topo} onChange={() => handleSwitchChange('ds_topo')} /></div>
                    <div className="space-y-3"><ToggleSwitch label="Papel Arroz" checked={formData.ds_papel} onChange={() => handleSwitchChange('ds_papel')} /><ToggleSwitch label="Gliter" checked={formData.ds_gliter} onChange={() => handleSwitchChange('ds_gliter')} /><ToggleSwitch label="Pó Decorativo" checked={formData.ds_po} onChange={() => handleSwitchChange('ds_po')} /></div>
                    <div className="space-y-3"><ToggleSwitch label="Dec. Menino" checked={formData.ds_menino} onChange={() => handleSwitchChange('ds_menino')} /><ToggleSwitch label="Dec. Menina" checked={formData.ds_menina} onChange={() => handleSwitchChange('ds_menina')} /><ToggleSwitch label="Dec. Mulher" checked={formData.ds_mulher} onChange={() => handleSwitchChange('ds_mulher')} /></div>
                    <div className="space-y-3"><ToggleSwitch label="Dec. Homem" checked={formData.ds_homem} onChange={() => handleSwitchChange('ds_homem')} /><ToggleSwitch label="Tabuleiro" checked={formData.ds_tabuleiro} onChange={() => handleSwitchChange('ds_tabuleiro')} /><ToggleSwitch label="Cake Board" checked={formData.ds_cafeboard} onChange={() => handleSwitchChange('ds_cafeboard')} /></div>
                </div>
                <div className="md:col-span-12 border-t border-gray-100 my-2"></div>
                <div className="md:col-span-8"><label className="block text-sm font-bold text-gray-700 mb-1">Observações da Torta</label><textarea rows={5} name="ds_obstortas" value={formData.ds_obstortas} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-gray-50" /></div>
                <div className="md:col-span-4"><label className="block text-sm font-bold text-gray-700 mb-1">Foto de Referência</label><div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-red-50 hover:border-red-300 transition-all relative group h-40"><input id="file-upload" name="ds_fototorta" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={handleFileChange} accept="image/*" />{previewUrl ? (<div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-lg p-1 z-10 w-full h-full overflow-hidden pointer-events-none"><img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded" /><button onClick={removeFile} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 pointer-events-auto z-30"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button><p className="absolute bottom-0 bg-black bg-opacity-50 text-white text-xs w-full text-center py-1 truncate px-2">{formData.ds_fototorta instanceof File ? formData.ds_fototorta.name : "Imagem do Pedido"}</p></div>) : (<div className="space-y-1 text-center flex flex-col justify-center h-full z-10 pointer-events-none"><svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-red-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg><div className="flex text-sm text-gray-600 justify-center"><span className="relative rounded-md font-medium text-red-600 group-hover:text-red-700">Carregar foto</span></div></div>)}</div></div>
              </div>
            )}

            {/* ABA BOLOS */}
            {abaAtiva === "bolos" && (
                <div className="animate-fadeIn">
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6 flex items-start gap-3"><div className="p-2 bg-orange-100 rounded-full text-orange-600"><IconCakeMenu /></div><div><h3 className="text-sm font-bold text-orange-800">Seleção de Bolos</h3><p className="text-xs text-orange-700">Informe a quantidade (kg) desejada para cada sabor.</p></div></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                        <WeightInput label="Bolo de Pamonha" name="vl_bolpamon" value={formData.vl_bolpamon} onChange={handleChange} />
                        <WeightInput label="Bolo de Milho" name="vl_bolmilho" value={formData.vl_bolmilho} onChange={handleChange} />
                        <WeightInput label="Bolo de Chocolate" name="vl_bolchoc" value={formData.vl_bolchoc} onChange={handleChange} />
                        <WeightInput label="Bolo Integral de Banana" name="vl_bolintban" value={formData.vl_bolintban} onChange={handleChange} />
                        <WeightInput label="Bolo Integral Multicereais" name="vl_bolmult" value={formData.vl_bolmult} onChange={handleChange} />
                        <WeightInput label="Bolo Toicinho do Céu" name="vl_boltoic" value={formData.vl_boltoic} onChange={handleChange} />
                        <WeightInput label="Bolo de Cenoura" name="vl_bolceno" value={formData.vl_bolceno} onChange={handleChange} />
                        <WeightInput label="Bolo de Amendoim" name="vl_bolamend" value={formData.vl_bolamend} onChange={handleChange} />
                        <WeightInput label="Brownie" name="vl_bolbrownie" value={formData.vl_bolbrownie} onChange={handleChange} />
                        <WeightInput label="Bolo de Prestígio" name="vl_bolprest" value={formData.vl_bolprest} onChange={handleChange} />
                        <WeightInput label="Bolo de Banana" name="vl_bolbanana" value={formData.vl_bolbanana} onChange={handleChange} />
                        <WeightInput label="Bolo de Aveia" name="vl_bolaveia" value={formData.vl_bolaveia} onChange={handleChange} />
                        <WeightInput label="Bolo de Laranja" name="vl_bollaranj" value={formData.vl_bollaranj} onChange={handleChange} />
                        <WeightInput label="Cuca" name="vl_bolcuca" value={formData.vl_bolcuca} onChange={handleChange} />
                    </div>
                    <div className="mt-8 border-t border-gray-100 pt-6"><label className="block text-sm font-bold text-gray-700 mb-1">Observações dos Bolos</label><textarea name="ds_obsbolo" value={formData.ds_obsbolo} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-gray-50" /></div>
                </div>
            )}

            {/* ABA SALGADOS */}
            {abaAtiva === "salgados" && (
                <div className="animate-fadeIn">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6 flex items-start gap-3"><div className="p-2 bg-yellow-100 rounded-full text-yellow-600"><IconCakeMenu /></div><div><h3 className="text-sm font-bold text-yellow-800">Salgadinhos de Festa</h3><p className="text-xs text-yellow-700">Informe a quantidade (UN) desejada para cada tipo.</p></div></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                        <UnitInput label="Risoles de Frango" name="vl_risfrango" value={formData.vl_risfrango} onChange={handleChange} />
                        <UnitInput label="Risoles Presunto e Queijo" name="vl_rispresque" value={formData.vl_rispresque} onChange={handleChange} />
                        <UnitInput label="Coxinha" name="vl_coxinha" value={formData.vl_coxinha} onChange={handleChange} />
                        <UnitInput label="Pastel de Carne" name="vl_pastelcar" value={formData.vl_pastelcar} onChange={handleChange} />
                        <UnitInput label="Pastel de Banana" name="vl_pastelban" value={formData.vl_pastelban} onChange={handleChange} />
                        <UnitInput label="Salsicha" name="vl_salsic" value={formData.vl_salsic} onChange={handleChange} />
                        <UnitInput label="Quibe" name="vl_quibe" value={formData.vl_quibe} onChange={handleChange} />
                        <UnitInput label="Bolinha de Queijo" name="vl_bolquei" value={formData.vl_bolquei} onChange={handleChange} />
                        <UnitInput label="Risoles de Palmito" name="vl_rispalm" value={formData.vl_rispalm} onChange={handleChange} />
                        <UnitInput label="Pastel de Milho" name="vl_pastmil" value={formData.vl_pastmil} onChange={handleChange} />
                    </div>
                    <div className="mt-8 border-t border-gray-100 pt-6"><label className="block text-sm font-bold text-gray-700 mb-1">Observações dos Salgados</label><textarea name="ds_obssalg" value={formData.ds_obssalg} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-gray-50" /></div>
                </div>
            )}

            {/* ABA MINI'S */}
            {abaAtiva === "minis" && (
                <div className="animate-fadeIn">
                    <div className="bg-pink-50 border border-pink-100 rounded-lg p-4 mb-6 flex items-start gap-3"><div className="p-2 bg-pink-100 rounded-full text-pink-600"><IconCakeMenu /></div><div><h3 className="text-sm font-bold text-pink-800">Mini's e Assados</h3><p className="text-xs text-pink-700">Informe a quantidade (UN) desejada para cada item.</p></div></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                        <UnitInput label="Assado de Frango" name="vl_assadfra" value={formData.vl_assadfra} onChange={handleChange} />
                        <UnitInput label="Assado de Carne" name="vl_assadcar" value={formData.vl_assadcar} onChange={handleChange} />
                        <UnitInput label="Assado de Chocolate" name="vl_assadcho" value={formData.vl_assadcho} onChange={handleChange} />
                        <UnitInput label="Donuts" name="vl_mindonu" value={formData.vl_mindonu} onChange={handleChange} />
                        <UnitInput label="Empadinha" name="vl_minempa" value={formData.vl_minempa} onChange={handleChange} />
                        <UnitInput label="Quiche" name="vl_miniquic" value={formData.vl_miniquic} onChange={handleChange} />
                        <UnitInput label="Bauru de Frango" name="vl_minibaufr" value={formData.vl_minibaufr} onChange={handleChange} />
                        <UnitInput label="Bauru Presunto e Queijo" name="vl_minibaupr" value={formData.vl_minibaupr} onChange={handleChange} />
                        <UnitInput label="Bauru de Calabresa" name="vl_minibauca" value={formData.vl_minibauca} onChange={handleChange} />
                        <UnitInput label="Cookies" name="vl_minicook" value={formData.vl_minicook} onChange={handleChange} />
                        <UnitInput label="Mini X Completo" name="vl_minix" value={formData.vl_minix} onChange={handleChange} />
                        <UnitInput label="Sonho de Avelã" name="vl_minisoave" value={formData.vl_minisoave} onChange={handleChange} />
                        <UnitInput label="Cachorro Quente Completo" name="vl_minicacho" value={formData.vl_minicacho} onChange={handleChange} />
                        <UnitInput label="Pão de Cachorro Quente" name="vl_minipaoca" value={formData.vl_minipaoca} onChange={handleChange} />
                        <UnitInput label="Pão Francês" name="vl_minipaofr" value={formData.vl_minipaofr} onChange={handleChange} />
                        <UnitInput label="Sonho sem Recheio" name="vl_minisonre" value={formData.vl_minisonre} onChange={handleChange} />
                        <UnitInput label="Pão de Hamburguer Mini" name="vl_paominix" value={formData.vl_paominix} onChange={handleChange} />
                        <UnitInput label="Pizza" name="vl_mnipizza" value={formData.vl_mnipizza} onChange={handleChange} />
                    </div>
                    <div className="mt-8 border-t border-gray-100 pt-6"><label className="block text-sm font-bold text-gray-700 mb-1">Observações dos Mini's</label><textarea name="ds_obsminis" value={formData.ds_obsminis} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-gray-50" /></div>
                </div>
            )}

            {/* ABA DIVERSOS */}
            {abaAtiva === "diversos" && (
                <div className="animate-fadeIn">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 rounded-full text-indigo-600"><IconCakeMenu /></div>
                        <div>
                            <h3 className="text-sm font-bold text-indigo-800">Produtos Diversos (Tradicionais)</h3>
                            <p className="text-xs text-indigo-700">Pães, Doces e Salgados (Tamanho Tradicional). Informe a quantidade (UN).</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                        <UnitInput label="Barquetes" name="vl_barc" value={formData.vl_barc} onChange={handleChange} />
                        <UnitInput label="Pão Francês" name="vl_paofr" value={formData.vl_paofr} onChange={handleChange} />
                        <UnitInput label="Pão Doce" name="vl_paodoc" value={formData.vl_paodoc} onChange={handleChange} />
                        <UnitInput label="Sanduíche Frango Integral" name="vl_sandfrint" value={formData.vl_sandfrint} onChange={handleChange} />
                        
                        <UnitInput label="Sanduíche de Frango" name="vl_sandfr" value={formData.vl_sandfr} onChange={handleChange} />
                        <UnitInput label="Sanduíche Pão Francês" name="vl_sandfra" value={formData.vl_sandfra} onChange={handleChange} />
                        <UnitInput label="Docinho Camuflado" name="vl_doccam" value={formData.vl_doccam} onChange={handleChange} />
                        <UnitInput label="Cricri" name="vl_cricri" value={formData.vl_cricri} onChange={handleChange} />
                        
                        <UnitInput label="Torta Salgada" name="vl_tortsa" value={formData.vl_tortsa} onChange={handleChange} />
                        <UnitInput label="Mãe Benta (Cupcake)" name="vl_maeben" value={formData.vl_maeben} onChange={handleChange} />
                        <UnitInput label="Cookies" name="vl_cookie" value={formData.vl_cookie} onChange={handleChange} />
                        <UnitInput label="Pão de Queijo" name="vl_paoque" value={formData.vl_paoque} onChange={handleChange} />
                        
                        <UnitInput label="Pudim/Cheesecake" name="vl_pudin" value={formData.vl_pudin} onChange={handleChange} />
                        <UnitInput label="Pão de Cachorro Quente" name="vl_paocach" value={formData.vl_paocach} onChange={handleChange} />
                        <UnitInput label="Pão de Hambúrguer" name="vl_paoham" value={formData.vl_paoham} onChange={handleChange} />
                        <UnitInput label="Marroquino" name="vl_marr" value={formData.vl_marr} onChange={handleChange} />
                        
                        <UnitInput label="Sonho sem Recheio" name="vl_sonsere" value={formData.vl_sonsere} onChange={handleChange} />
                        <UnitInput label="Sonho de Avelã" name="vl_sonavel" value={formData.vl_sonavel} onChange={handleChange} />
                        <UnitInput label="Sonho de Doce de Leite" name="vl_sondoc" value={formData.vl_sondoc} onChange={handleChange} />
                        <UnitInput label="Sonho de Baunilha" name="vl_sonbal" value={formData.vl_sonbal} onChange={handleChange} />
                        
                        <UnitInput label="Cavaquinho" name="vl_cava" value={formData.vl_cava} onChange={handleChange} />
                        <UnitInput label="Empadinha" name="vl_empad" value={formData.vl_empad} onChange={handleChange} />
                        <UnitInput label="Quiche" name="vl_quich" value={formData.vl_quich} onChange={handleChange} />
                        <UnitInput label="Empadão" name="vl_empagr" value={formData.vl_empagr} onChange={handleChange} />
                        
                        <UnitInput label="Cachorro Quente Completo" name="vl_cacho" value={formData.vl_cacho} onChange={handleChange} />
                        <UnitInput label="Pizza" name="vl_pizza" value={formData.vl_pizza} onChange={handleChange} />
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                         <label className="block text-sm font-bold text-gray-700 mb-1">Observações Diversos</label>
                         <textarea name="ds_obsdiv" value={formData.ds_obsdiv} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-gray-50" />
                    </div>
                </div>
            )}

          </div>
          <footer className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-between items-center">
             <button type="button" className="text-gray-500 hover:text-gray-800 text-sm font-medium underline underline-offset-2">Limpar Formulário</button>
             <div className="flex gap-3">
                <button type="button" className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all font-medium text-sm">Exportar PDF</button>
                <button type="button" onClick={() => navigate('/encomendas/consulta')} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm">Cancelar</button>
                <button type="submit" className="px-8 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  {formData.id_ordemservicos ? "Atualizar Pedido" : "Salvar Pedido"}
                </button>
             </div>
          </footer>
        </form>

        <CadastroContribuinte 
             isOpen={modalClienteAberto}
             onClose={() => setModalClienteAberto(false)}
             telefoneInicial={formData.nr_telefone}
             aoSalvar={aoSalvarCliente}
        />

      </main>
    </div>
  );
}

export default CadastroEncomenda;