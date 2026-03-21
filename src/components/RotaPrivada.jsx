import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RotaPrivada = () => {
    const usuarioString = sessionStorage.getItem('usuario_logado');
    let isAuthenticated = false;

    // Defina aqui quanto tempo a sessão dura em Milissegundos
    // Exemplo: 4 horas = 4 * 60 minutos * 60 segundos * 1000
    const TEMPO_LIMITE = 4 * 60 * 60 * 1000; 

    if (usuarioString) {
        try {
            const usuario = JSON.parse(usuarioString);
            
            // 1. Verifica se tem ID
            if (usuario && (usuario.id || usuario.id_usuarios)) {
                
                // 2. VERIFICAÇÃO DE TEMPO
                const agora = new Date().getTime();
                const tempoLogin = usuario.hora_login || 0;

                // Se (Agora - HoraLogin) for menor que o Limite, está válido
                if ((agora - tempoLogin) < TEMPO_LIMITE) {
                    isAuthenticated = true;
                } else {
                    // Se expirou: Limpa tudo para garantir
                    sessionStorage.removeItem('usuario_logado');
                    alert("Sua sessão expirou. Por favor, faça login novamente.");
                }
            }
        } catch (e) {
            isAuthenticated = false;
        }
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default RotaPrivada;