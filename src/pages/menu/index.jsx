import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo_cafe_francesa from '../../assets/imagem/logo_cafe_pequena.png';

function Menu() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

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
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-1 z-50 border border-gray-200 overflow-hidden">

              {/* Seção Admin */}
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b bg-gray-50">
                Administração
              </div>

              <button
                onClick={() => { setMenuAberto(false); navigate('/admin/usuarios'); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Cadastro de Usuários
              </button>

              <button
                onClick={() => { setMenuAberto(false); navigate('/admin/formularios'); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Cadastro de Formulários
              </button>

              <button
                onClick={() => { setMenuAberto(false); navigate('/admin/responsavel'); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Responsável pelo Produto
              </button>

              <button
                onClick={() => { setMenuAberto(false); navigate('/admin/empregados'); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Cadastro de Empregados
              </button>

              {/* Divisor */}
              <div className="border-t my-1" />

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">

          <button
            onClick={() => navigate('/encomendas/consulta')}
            className="flex flex-col items-center justify-center p-8 rounded-lg shadow-xl
                       bg-gradient-to-br from-red-500 to-red-700 text-white
                       hover:from-red-600 hover:to-red-800 transition-all duration-300
                       transform hover:-translate-y-1 hover:scale-105"
          >
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-3xl font-extrabold text-center">CONSULTA DE<br/>ENCOMENDAS</span>
          </button>

          <button
            onClick={() => navigate('/painel-encomendas')}
            className="flex flex-col items-center justify-center p-8 rounded-lg shadow-xl
                       bg-gradient-to-br from-blue-500 to-blue-700 text-white
                       hover:from-blue-600 hover:to-blue-800 transition-all duration-300
                       transform hover:-translate-y-1 hover:scale-105"
          >
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 2v-6m2 9H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
            </svg>
            <span className="text-3xl font-extrabold text-center">PAINEL DE<br/>ENCOMENDAS</span>
          </button>

        </div>
      </div>
    </div>
  );
}

export default Menu;
