import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Row, Col, Alert, InputGroup } from "react-bootstrap";
import { FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";

import logo_cafe_francesa from "../../assets/imagem/logo_cafe_francesa.png";
import logo_prefeiturapro from "../../assets/imagem/logo_prefeiturapro.svg";
import "../../assets/css/login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

function Login() {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro("");

        if (!usuario || !senha) {
            setErro("Preencha usuário e senha.");
            return;
        }

        setCarregando(true);
        try {
            const response = await fetch(`${API_URL}/usuarios/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome: usuario, senha })
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem("usuario_logado", JSON.stringify({
                    ...data,
                    hora_login: new Date().getTime()
                }));
                navigate("/menu");
            } else {
                setErro(data.erro || "Usuário ou senha inválidos.");
            }
        } catch (error) {
            setErro("Erro ao conectar com o servidor.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <Row className="g-0 flex-grow-1">

                {/* ── Painel esquerdo (café escuro) ─────────────────────────── */}
                <Col md={5} className="d-none d-md-flex login-left-panel">
                    <div className="login-brasao-wrapper">
                        <img
                            src={logo_cafe_francesa}
                            alt="Café Francesa"
                            style={{ maxWidth: 220, height: "auto" }}
                            onError={(e) => { e.target.style.display = "none"; }}
                        />
                    </div>
                    <div className="login-left-nome">Café Francesa</div>
                    <div className="login-left-subtitulo">Sistema de Gestão de Encomendas</div>
                </Col>

                {/* ── Painel direito (formulário) ───────────────────────────── */}
                <Col xs={12} md={7} className="login-right-panel">
                    <div className="login-card">

                        {/* Logo mobile */}
                        <div className="d-flex d-md-none justify-content-center mb-4">
                            <img
                                src={logo_cafe_francesa}
                                alt="Café Francesa"
                                style={{ height: 72, objectFit: "contain" }}
                            />
                        </div>

                        {/* Título */}
                        <div className="mb-4">
                            <h5 className="fw-bold text-dark mb-0 text-uppercase" style={{ fontSize: "1rem" }}>
                                Acesso ao Sistema
                            </h5>
                            <div style={{ width: 40, height: 4, background: "#6B3A2A", borderRadius: 2, marginTop: 8 }} />
                            <p className="text-muted small mt-2 mb-0">
                                Informe suas credenciais para continuar.
                            </p>
                        </div>

                        {erro && (
                            <Alert variant="danger" className="py-2 small" dismissible onClose={() => setErro("")}>
                                {erro}
                            </Alert>
                        )}

                        <Form onSubmit={handleLogin}>
                            {/* Usuário */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small text-muted text-uppercase">Usuário</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="login-input-icon">
                                        <FaUser size={13} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Seu nome de usuário"
                                        value={usuario}
                                        onChange={(e) => setUsuario(e.target.value)}
                                        autoComplete="username"
                                        className="login-input"
                                    />
                                </InputGroup>
                            </Form.Group>

                            {/* Senha */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold small text-muted text-uppercase">Senha</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="login-input-icon">
                                        <FaLock size={13} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type={mostrarSenha ? "text" : "password"}
                                        placeholder="Sua senha"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        autoComplete="current-password"
                                        className="login-input"
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        className="btn-olho"
                                        onClick={() => setMostrarSenha(v => !v)}
                                        tabIndex={-1}
                                    >
                                        {mostrarSenha ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            {/* Links */}
                            <div className="d-flex justify-content-between small mb-4">
                                <a href="#forgot" className="text-decoration-none text-muted">Esqueceu a senha?</a>
                                <a href="#help" className="text-decoration-none text-muted">Dúvidas? Fale conosco</a>
                            </div>

                            {/* Botão */}
                            <div className="d-grid">
                                <Button
                                    type="submit"
                                    className="btn-login-action"
                                    disabled={carregando}
                                >
                                    {carregando ? "Verificando..." : "Acessar Sistema"}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>

            {/* ── Rodapé ──────────────────────────────────────────────────────── */}
            <footer className="footer-section text-center">
                <div className="d-flex justify-content-center align-items-center gap-3">
                    <img src={logo_prefeiturapro} alt="Logo" style={{ height: 28, opacity: 0.6 }} />
                    <div className="vr" style={{ height: 24 }} />
                    <span className="text-muted fw-bold small">PrefeituraPro</span>
                </div>
                <p className="text-muted mb-0 mt-1" style={{ fontSize: "0.7rem" }}>
                    &copy; 2026 Soluções Municipais. Todos os direitos reservados.
                </p>
            </footer>
        </div>
    );
}

export default Login;
