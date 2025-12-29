import React from "react";
import { Route, Routes } from "react-router-dom";

import Login from "./pages/login";
import Menu from "./pages/menu"; 
import Home from "./pages/home"; // Painel de Encomendas
import CadastroEncomenda from "./pages/encomenda/cadastroencomenda";
import ConsultaEncomenda from "./pages/encomenda/consultaencomenda";


function App() {
  return (
    <Routes>
      {/* 1. A rota raiz agora leva para o Login (segurança) */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* 2. A tela intermediária de Menu */}
      <Route path="/menu" element={<Menu />} />

      {/* 3. O botão "Painel de Encomendas" do menu vai levar para cá */}
      {/* Reutilizamos o componente Home, que já é o seu painel pronto */}
      <Route path="/painel-encomendas" element={<Home />} />

      {/* 4. O botão "Cadastro" leva para cá */}
      {/* Criei um texto provisório para não dar erro 404 ao clicar */}
      <Route path="/cadastro-encomendas" element={<CadastroEncomenda />} /> 

         {/* 2. ADICIONE ESSA LINHA NOVA 👇 */}
        <Route path="/encomendas/consulta" element={<ConsultaEncomenda />} />
    
    </Routes>
  );
}

export default App;