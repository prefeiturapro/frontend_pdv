import React from 'react';
import { useNavigate } from 'react-router-dom'; // Para navegação entre rotas
import logo_cafe_francesa from '../../assets/imagem/logo_cafe_pequena.png';


function Menu() {
  const navigate = useNavigate(); // Hook para navegar programaticamente

  const handleCadastroClick = () => {
    navigate('/encomendas/consulta'); // Redireciona para a tela de cadastro
  };

  const handlePainelClick = () => {
    navigate('/painel-encomendas'); // Redireciona para o painel de encomendas
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar Superior */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        {/* Logo (Mantendo a consistência do login) */}
        <div className="flex items-center">
          <img src={logo_cafe_francesa} />
          <span className="text-xl font-semibold text-gray-800 hidden md:block">      Café Francesa</span>
        </div>

        {/* Ícone de Usuário (Direita) */}
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </button>
            {/* Opcional: Dropdown de usuário */}
            {/*
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Meu Perfil</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sair</a>
            </div>
            */}
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal com os Botões */}
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Botão CONSULTA E CADASTRO DE ENCOMENDAS */}
          <button
            onClick={handleCadastroClick}
            className="flex flex-col items-center justify-center p-8 rounded-lg shadow-xl 
                       bg-gradient-to-br from-red-500 to-red-700 text-white 
                       hover:from-red-600 hover:to-red-800 transition-all duration-300 
                       transform hover:-translate-y-1 hover:scale-105"
          >
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span className="text-3xl font-extrabold text-center">CONSULTA DE <br/>ENCOMENDAS</span>
          </button>

          {/* Botão PAINEL DE ENCOMENDAS */}
          <button
            onClick={handlePainelClick}
            className="flex flex-col items-center justify-center p-8 rounded-lg shadow-xl 
                       bg-gradient-to-br from-blue-500 to-blue-700 text-white 
                       hover:from-blue-600 hover:to-blue-800 transition-all duration-300 
                       transform hover:-translate-y-1 hover:scale-105"
          >
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 2v-6m2 9H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z"></path></svg>
            <span className="text-3xl font-extrabold text-center">PAINEL DE<br/>ENCOMENDAS</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;