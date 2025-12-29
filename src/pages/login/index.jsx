import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert'; // Para mensagens de erro

import logo_prefeiturapro from '../../assets/imagem/logo_prefeiturapro.svg';
import logo_cafe_francesa from '../../assets/imagem/logo_cafe_francesa.png';
import '../../assets/css/login.css';

const API_URL = "http://localhost:3001";


function Login() {
  const [showPassword, setShowPassword] = useState(false);
  
  // 2. Estados para armazenar dados e erros
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha    ] = useState("");
  const [erro, setErro      ] = useState("");

  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // 3. Função de Login atualizada para POST
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    if (!usuario || !senha) {
       setErro("Preencha usuário e senha.");
       return;
    }

    try {
      const response = await fetch(`${API_URL}/usuarios/login`, {
        method: "POST",
         headers: {
         "Content-Type": "application/json",
       },
        // Perfeito: mapeando o state 'usuario' para o campo 'nome' que o backend espera
       body: JSON.stringify({ nome: usuario, senha: senha }),
      });

      const data = await response.json();

      if (response.ok) {
         console.log("Login realizado:", data);

        
        // Use 'data' direto, e não 'response.data'
        localStorage.setItem("id_usuario_logado", data.id_usuarios);
        localStorage.setItem("nome_usuario_logado", data.nome); 
        // ---------------------

         navigate("/menu"); 
       } else {        
         setErro(data.erro || "Usuário ou senha incorretos.");
      }

    } catch (error) {
       console.error("Erro:", error);
      setErro("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="login-page-wrapper">
      <Container className="flex-grow-1 d-flex align-items-center">
        <Row className="w-100 justify-content-center align-items-center m-0">
          
          <Col md={6} lg={6} className="d-none d-md-block text-center mb-4 mb-md-0">
            <img 
              src={logo_cafe_francesa} 
              alt="logomarca" 
              style={{ maxWidth: '80%', height: 'auto' }}
            />
          </Col>

          <Col md={6} lg={5} xl={4}>
            <div className="login-card">
              <div className="mb-4">
                <h2 className="brand-title">
                  Café <span style={{fontSize: '0.5em', color: '#610d0d8b', verticalAlign: 'middle'}}>FRANCESA</span>
                </h2>
                <p className="brand-subtitle mt-2">
                  Te acompanhando a cada,<br />
                  momento do dia
                </p>
              </div>

              {/* Exibe o alerta se houver erro */}
              {erro && <Alert variant="danger">{erro}</Alert>}

              {/* 4. Adicionado onSubmit e Values nos inputs */}
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formBasicUser">
                  <Form.Label className="fw-bold text-secondary small">Usuário</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Seu nome de usuário" 
                    className="custom-input"
                    // LIGAÇÃO (BIND) COM O REACT:
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4 position-relative" controlId="formBasicPassword">
                  <Form.Label className="fw-bold text-secondary small">Senha</Form.Label>
                  <div className="position-relative">
                    <Form.Control 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Sua senha" 
                      className="custom-input"
                      style={{ paddingRight: '45px' }}
                      // LIGAÇÃO (BIND) COM O REACT:
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                    <span className="password-toggle-icon" onClick={togglePassword}>
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                          <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
                          <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>
                        </svg>
                      )}
                    </span>
                  </div>
                </Form.Group>

                <div className="d-flex flex-column mb-4 small">
                  <a href="#forgot" className="text-decoration-none text-muted mb-1">Esqueceu a senha?</a>
                  <a href="#help" className="text-decoration-none text-muted">Dúvidas? Fale conosco</a>
                </div>

                <div className="text-end">
                  <Button variant="primary" type="submit" className="btn-login">
                    Acessar
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>

      <footer className="footer-section text-center">
        <div className="footer-logos mb-3 d-flex justify-content-center align-items-center gap-3">
            <img src={logo_prefeiturapro} alt="Logo PrefeituraPro" />
            <div style={{borderLeft: '1px solid #ccc', height: '80px', margin: '0 40px'}}></div>
            <span className="fw-bold text-secondary">PrefeiturPro</span>
        </div>
        <p className="text-muted" style={{fontSize: '0.90rem'}}>
          Desenvolvido por PrefeituraPro Soluções Municipais. 2010.
        </p>
      </footer>
    </div>
  );
}

export default Login;