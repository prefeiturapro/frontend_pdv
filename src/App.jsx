import React from "react";
// CORREÇÃO 1: Adicionei o BrowserRouter na importação
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/login";
import Menu from "./pages/menu"; 
import Home from "./pages/home"; 
import CadastroEncomenda from "./pages/encomenda/cadastroencomenda";
import ConsultaEncomenda from "./pages/encomenda/consultaencomenda";
import ConsultaTortas from "./pages/encomenda/consultatortas";
import Usuarios from "./pages/admin/usuarios";
import Formularios from "./pages/admin/formularios";
import Responsavel from "./pages/admin/responsavel";
import Empregados  from "./pages/admin/empregados";
import BiDashboard from "./pages/admin/bi";
import RotaPrivada from './components/RotaPrivada';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === ÁREA PÚBLICA === */}
        {/* O Login fica FORA da RotaPrivada, senão ninguém consegue entrar */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* === ÁREA RESTRITA (RotaPrivada) === */}
        {/* Só entra aqui quem tiver o localStorage 'usuario_logado' */}
        <Route element={<RotaPrivada />}>
          
          <Route path="/menu" element={<Menu />} />
          <Route path="/painel-encomendas" element={<Home />} />
          <Route path="/cadastro-encomendas" element={<CadastroEncomenda />} /> 
          <Route path="/encomendas/consulta" element={<ConsultaEncomenda />} />
          <Route path="/tortas" element={<ConsultaTortas />} />
          <Route path="/admin/usuarios" element={<Usuarios />} />
          <Route path="/admin/formularios" element={<Formularios />} />
          <Route path="/admin/responsavel" element={<Responsavel />} />
          <Route path="/admin/empregados"  element={<Empregados />} />
          <Route path="/admin/bi"         element={<BiDashboard />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;