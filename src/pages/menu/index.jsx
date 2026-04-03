import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo_cafe_francesa from '../../assets/imagem/logo_cafe_pequena.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Botões principais do menu
const ITENS_PRINCIPAL = [
  {
    nm_form: 'consultaencomenda',
    label: 'CONSULTA DE\nENCOMENDAS',
    rota: '/encomendas/consulta',
    corFrom: 'from-red-500', corTo: 'to-red-700',
    corHoverFrom: 'hover:from-red-600', corHoverTo: 'hover:to-red-800',
    icon: 'M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    nm_form: 'painelenc',
    label: 'PAINEL DE\nENCOMENDAS',
    rota: '/painel-encomendas',
    corFrom: 'from-blue-500', corTo: 'to-blue-700',
    corHoverFrom: 'hover:from-blue-600', corHoverTo: 'hover:to-blue-800',
    icon: 'M9 17v-2m3 2v-4m3 2v-6m2 9H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z'
  },
  {
    nm_form: 'consultatortas',
    label: 'CONSULTA\nDE TORTAS',
    rota: '/tortas',
    corFrom: 'from-amber-500', corTo: 'to-amber-700',
    corHoverFrom: 'hover:from-amber-600', corHoverTo: 'hover:to-amber-800',
    icon: 'M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z'
  }
];

// Mapeamento: nm_form (bauhaus.forms) → rota
const ITENS_ADMIN = [
  {
    nm_form: 'cadastrousuarios',
    label: 'Cadastro de Usuários',
    rota: '/admin/usuarios',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
  },
  {
    nm_form: 'cadastroformularios',
    label: 'Cadastro de Formulários',
    rota: '/admin/formularios',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    nm_form: 'responsavelproduto',
    label: 'Responsável pelo Produto',
    rota: '/admin/responsavel',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    nm_form: 'cadastroempregados',
    label: 'Cadastro de Empregados',
    rota: '/admin/empregados',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
  },
  {
    nm_form: 'painelbi',
    label: 'Painel de Indicadores',
    rota: '/admin/bi',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  }
];

function Menu() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto]         = useState(false);
  const [formsPermitidos, setFormsPermitidos] = useState(new Set());
  const [carregandoPerms, setCarregandoPerms] = useState(true);

  const usuarioLogado = (() => {
    try { return JSON.parse(sessionStorage.getItem('usuario_logado')); }
    catch { return null; }
  })();

  // Carrega permissões do usuário logado ao montar
  useEffect(() => {
    if (!usuarioLogado?.id_usuarios) {
      setCarregandoPerms(false);
      return;
    }
    fetch(`${API_URL}/forms-usuarios/usuario/${usuarioLogado.id_usuarios}`)
      .then(res => res.json())
      .then(data => {
        const permitidos = new Set();
        if (Array.isArray(data)) {
          data.forEach(p => {
            if (p.acessar?.trim() === 'S') {
              permitidos.add(p.nm_form?.toLowerCase());
            }
          });
        }
        setFormsPermitidos(permitidos);
      })
      .catch(() => setFormsPermitidos(new Set()))
      .finally(() => setCarregandoPerms(false));
  }, []);

  const temAcesso = (nm_form) => formsPermitidos.has(nm_form.toLowerCase());

  const itensPrincipalVisiveis = ITENS_PRINCIPAL.filter(item => temAcesso(item.nm_form));
  const itensVisiveis = ITENS_ADMIN.filter(item => temAcesso(item.nm_form));
  const temQualquerAdmin = itensVisiveis.length > 0;

  const handleLogout = () => {
    sessionStorage.removeItem('usuario_logado');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center z-20 relative">
        <div className="flex items-center">
          <img src={logo_cafe_francesa} alt="Logo" className="h-10 w-auto" />
          <span className="ml-3 text-xl font-semibold text-gray-800 hidden md:block">Café Francesa</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {menuAberto && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg py-1 z-50 border border-gray-200 overflow-hidden">

              {/* Seção Admin — só exibe se houver ao menos um item permitido */}
              {carregandoPerms ? (
                <div className="px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Verificando permissões...
                </div>
              ) : temQualquerAdmin && (
                <>
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b bg-gray-50">
                    Administração
                  </div>

                  {itensVisiveis.map(item => (
                    <button
                      key={item.nm_form}
                      onClick={() => { setMenuAberto(false); navigate(item.rota); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      {item.label}
                    </button>
                  ))}

                  <div className="border-t my-1" />
                </>
              )}

              {/* Sair */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair do Sistema
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <div
        className="flex-grow flex items-center justify-center p-6"
        onClick={() => setMenuAberto(false)}
      >
        {carregandoPerms ? (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <svg className="animate-spin w-10 h-10" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm font-medium">Carregando menu...</span>
          </div>
        ) : itensPrincipalVisiveis.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-xl font-bold mb-2">Sem acesso</p>
            <p className="text-sm">Você não tem permissão para acessar nenhuma tela.<br/>Solicite ao administrador.</p>
          </div>
        ) : (
          <div className="w-full max-w-5xl space-y-10">

            {/* Botões principais */}
            <div className={`grid gap-6
              ${itensPrincipalVisiveis.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : ''}
              ${itensPrincipalVisiveis.length === 2 ? 'grid-cols-1 md:grid-cols-2' : ''}
              ${itensPrincipalVisiveis.length >= 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}
            `}>
              {itensPrincipalVisiveis.map(item => (
                <button
                  key={item.nm_form}
                  onClick={() => navigate(item.rota)}
                  className={`flex flex-col items-center justify-center p-8 rounded-lg shadow-xl
                    bg-gradient-to-br ${item.corFrom} ${item.corTo} text-white
                    ${item.corHoverFrom} ${item.corHoverTo}
                    transition-all duration-300 transform hover:-translate-y-1 hover:scale-105`}
                >
                  <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
                  </svg>
                  <span className="text-3xl font-extrabold text-center whitespace-pre-line">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Painel Administrador */}
            {temQualquerAdmin && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-300" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Administração</span>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>
                <div className={`grid gap-4
                  ${itensVisiveis.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : ''}
                  ${itensVisiveis.length === 2 ? 'grid-cols-2' : ''}
                  ${itensVisiveis.length === 3 ? 'grid-cols-3' : ''}
                  ${itensVisiveis.length >= 4 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : ''}
                `}>
                  {itensVisiveis.map(item => (
                    <button
                      key={item.nm_form}
                      onClick={() => navigate(item.rota)}
                      className="flex flex-col items-center justify-center gap-2 p-5 rounded-lg border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 text-amber-900 transition-all duration-200 shadow-sm hover:shadow-md group"
                    >
                      <svg className="w-8 h-8 text-amber-700 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
                      </svg>
                      <span className="text-sm font-bold text-center leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;
