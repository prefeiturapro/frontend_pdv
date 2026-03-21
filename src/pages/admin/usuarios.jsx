import React, { useState, useEffect, useRef } from "react";
import {
    Container, Card, Table, Button, Modal, Form,
    Spinner, Alert, Badge, Navbar, Row, Col, InputGroup, Nav, Tab
} from "react-bootstrap";
import {
    FaPlus, FaEdit, FaTrash, FaUserShield, FaSave, FaTimes,
    FaKey, FaEye, FaEyeSlash, FaLock, FaUnlock, FaCamera, FaUsers,
    FaArrowLeft, FaShieldAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import logo_cafe from "../../assets/imagem/logo_cafe_francesa.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const COR_CAFE = "#6B3A2A";

const FORM_VAZIO = {
    nm_usuario: "", nr_cpf: "", dt_nascimento: "", ds_email: "",
    ds_password: "", by_foto: null, st_exibirfoto: "S", cd_usuario: "",
    id_empregados: ""
};

const SENHA_VAZIA = { nova_senha: "", confirmar_senha: "" };

const PERM_VAZIA = { editar: "N", consultar: "N", incluir: "N", imprimir: "N", acessar: "N", excluir: "N" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatarCPF(valor) {
    return valor.replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        .slice(0, 14);
}

function cpfSomenteNumeros(cpf) { return cpf.replace(/\D/g, ""); }

// ─── Componente ───────────────────────────────────────────────────────────────

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);

    // Modal criar/editar
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [formAtual, setFormAtual] = useState(FORM_VAZIO);
    const [salvando, setSalvando] = useState(false);
    const [erroModal, setErroModal] = useState(null);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [previewFoto, setPreviewFoto] = useState(null);
    const [abaAtiva, setAbaAtiva] = useState("dados");
    const inputFotoRef = useRef(null);

    // Empregados
    const [empregados, setEmpregados] = useState([]);

    // Permissões
    const [todosForms, setTodosForms] = useState([]);
    const [permissoes, setPermissoes] = useState({}); // { id_forms: { editar, consultar, ... } }
    const [loadingPerms, setLoadingPerms] = useState(false);
    const [buscarForm, setBuscarForm] = useState("");

    // Modal alterar senha
    const [showModalSenha, setShowModalSenha] = useState(false);
    const [usuarioSenha, setUsuarioSenha] = useState(null);
    const [formSenha, setFormSenha] = useState(SENHA_VAZIA);
    const [salvandoSenha, setSalvandoSenha] = useState(false);
    const [erroSenha, setErroSenha] = useState(null);
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

    const [processando, setProcessando] = useState(false);
    const navigate = useNavigate();

    const usuarioLogado = (() => {
        try { return JSON.parse(sessionStorage.getItem("usuario_logado")); }
        catch { return null; }
    })();

    useEffect(() => {
        carregarUsuarios();
        carregarTodosForms();
        carregarEmpregados();
    }, []);

    const carregarUsuarios = async () => {
        setCarregando(true);
        try {
            const res = await fetch(`${API_URL}/usuarios/listar`);
            const data = await res.json();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setUsuarios([]);
        } finally {
            setCarregando(false);
        }
    };

    const carregarEmpregados = async () => {
        try {
            const res = await fetch(`${API_URL}/empregados/listar`);
            const data = await res.json();
            setEmpregados(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Erro ao carregar empregados:", e);
        }
    };

    const carregarTodosForms = async () => {
        try {
            const res = await fetch(`${API_URL}/forms/listar`);
            const data = await res.json();
            setTodosForms(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Erro ao carregar forms:", e);
        }
    };

    const carregarPermissoes = async (id_usuarios) => {
        setLoadingPerms(true);
        try {
            const res = await fetch(`${API_URL}/forms-usuarios/usuario/${id_usuarios}`);
            const data = await res.json();
            const mapa = {};
            if (Array.isArray(data)) {
                data.forEach(p => {
                    mapa[p.id_forms] = {
                        editar: p.editar?.trim() || "N",
                        consultar: p.consultar?.trim() || "N",
                        incluir: p.incluir?.trim() || "N",
                        imprimir: p.imprimir?.trim() || "N",
                        acessar: p.acessar?.trim() || "N",
                        excluir: p.excluir?.trim() || "N",
                    };
                });
            }
            setPermissoes(mapa);
        } catch (e) {
            console.error("Erro ao carregar permissões:", e);
            setPermissoes({});
        } finally {
            setLoadingPerms(false);
        }
    };

    // ── Foto ───────────────────────────────────────────────────────────────────

    const handleFoto = (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewFoto(reader.result);
            setFormAtual(prev => ({ ...prev, by_foto: reader.result }));
        };
        reader.readAsDataURL(arquivo);
    };

    const removerFoto = () => {
        setPreviewFoto(null);
        setFormAtual(prev => ({ ...prev, by_foto: null }));
        if (inputFotoRef.current) inputFotoRef.current.value = "";
    };

    // ── Modal criar/editar ─────────────────────────────────────────────────────

    const abrirModalNovo = async () => {
        setFormAtual(FORM_VAZIO);
        setPreviewFoto(null);
        setModoEdicao(false);
        setErroModal(null);
        setMostrarSenha(false);
        setAbaAtiva("dados");
        setPermissoes({});
        setShowModal(true);
        try {
            const res = await fetch(`${API_URL}/usuarios/proximo-codigo`);
            const data = await res.json();
            setFormAtual(prev => ({ ...prev, cd_usuario: data.cd_usuario ?? "" }));
        } catch { }
    };

    const abrirModalEditar = (u) => {
        setFormAtual({
            id_usuarios: u.id_usuarios,
            nm_usuario: u.nm_usuario || "",
            nr_cpf: u.nr_cpf || "",
            dt_nascimento: u.dt_nascimento ? u.dt_nascimento.substring(0, 10) : "",
            ds_email: u.ds_email || "",
            ds_password: "",
            by_foto: u.by_foto || null,
            st_exibirfoto: u.st_exibirfoto || "S",
            id_empregados: u.id_empregados || ""
        });
        setPreviewFoto(u.by_foto || null);
        setModoEdicao(true);
        setErroModal(null);
        setMostrarSenha(false);
        setAbaAtiva("dados");
        carregarPermissoes(u.id_usuarios);
        setShowModal(true);
    };

    const fecharModal = () => {
        setShowModal(false);
        setErroModal(null);
        setPreviewFoto(null);
        setPermissoes({});
        setAbaAtiva("dados");
        setBuscarForm("");
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === "checkbox" ? (checked ? "S" : "N") : value;
        if (name === "nr_cpf") val = formatarCPF(value);
        setFormAtual(prev => ({ ...prev, [name]: val }));
    };

    // ── Toggle de permissão ───────────────────────────────────────────────────

    const togglePermissao = (id_forms, campo) => {
        setPermissoes(prev => {
            const atual = prev[id_forms] || { ...PERM_VAZIA };
            const novoValor = atual[campo] === "S" ? "N" : "S";

            // Se desativar "acessar", limpa todas as outras
            if (campo === "acessar" && novoValor === "N") {
                return { ...prev, [id_forms]: { ...PERM_VAZIA } };
            }
            // Se ativar qualquer permissão, ativa "acessar" automaticamente
            const novoRegistro = { ...atual, [campo]: novoValor };
            if (novoValor === "S" && campo !== "acessar") {
                novoRegistro.acessar = "S";
            }
            return { ...prev, [id_forms]: novoRegistro };
        });
    };

    const permissaoValor = (id_forms, campo) => {
        return permissoes[id_forms]?.[campo] === "S";
    };

    const handleSelecionarTodos = () => {
        const todosAtivos = todosForms.every(f =>
            todosForms.length > 0 && permissoes[f.id_forms]?.acessar === "S"
        );
        if (todosAtivos) {
            // Desmarcar todos
            setPermissoes({});
        } else {
            // Selecionar todos (todas as permissões = S)
            const novoMapa = {};
            todosForms.forEach(f => {
                novoMapa[f.id_forms] = { editar: "S", consultar: "S", incluir: "S", imprimir: "S", acessar: "S", excluir: "S" };
            });
            setPermissoes(novoMapa);
        }
    };

    // ── Salvar usuário + permissões ────────────────────────────────────────────

    const handleSalvar = async (e) => {
        e.preventDefault();
        setErroModal(null);

        if (!modoEdicao && formAtual.ds_password.length < 8) {
            setErroModal("A senha deve ter no mínimo 8 caracteres.");
            setAbaAtiva("dados");
            return;
        }

        setSalvando(true);
        try {
            const payload = {
                nm_usuario: formAtual.nm_usuario,
                nr_cpf: cpfSomenteNumeros(formAtual.nr_cpf) || null,
                dt_nascimento: formAtual.dt_nascimento || null,
                ds_email: formAtual.ds_email || null,
                by_foto: formAtual.by_foto || null,
                st_exibirfoto: formAtual.st_exibirfoto,
                id_empregados: formAtual.id_empregados || null
            };

            let res, idUsuario;
            if (modoEdicao) {
                res = await fetch(`${API_URL}/usuarios/atualizar/${formAtual.id_usuarios}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                idUsuario = formAtual.id_usuarios;
            } else {
                res = await fetch(`${API_URL}/usuarios/salvar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...payload,
                        ds_password: formAtual.ds_password,
                        id_usuarioscadastro: usuarioLogado?.id_usuarios || null
                    })
                });
                const novoUsuario = await res.json();
                if (!res.ok) { setErroModal(novoUsuario.erro || "Erro ao salvar usuário."); return; }
                idUsuario = novoUsuario.id_usuarios;
            }

            if (modoEdicao) {
                const data = await res.json();
                if (!res.ok) { setErroModal(data.erro || "Erro ao salvar usuário."); return; }
            }

            // Salva permissões
            const listaPerms = todosForms.map(f => ({
                id_forms: f.id_forms,
                ...(permissoes[f.id_forms] || PERM_VAZIA)
            }));

            await fetch(`${API_URL}/forms-usuarios/salvar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_usuarios: idUsuario,
                    permissoes: listaPerms,
                    id_usuarioautorizacao: usuarioLogado?.id_usuarios || null
                })
            });

            fecharModal();
            carregarUsuarios();
        } catch (e) {
            setErroModal("Erro de conexão com o servidor.");
        } finally {
            setSalvando(false);
        }
    };

    // ── Modal alterar senha ────────────────────────────────────────────────────

    const abrirModalSenha = (u) => {
        setUsuarioSenha(u);
        setFormSenha(SENHA_VAZIA);
        setErroSenha(null);
        setMostrarNovaSenha(false);
        setShowModalSenha(true);
    };

    const fecharModalSenha = () => { setShowModalSenha(false); setErroSenha(null); };

    const handleSalvarSenha = async (e) => {
        e.preventDefault();
        setErroSenha(null);
        if (formSenha.nova_senha.length < 8) { setErroSenha("A senha deve ter no mínimo 8 caracteres."); return; }
        if (formSenha.nova_senha !== formSenha.confirmar_senha) { setErroSenha("As senhas não coincidem."); return; }
        setSalvandoSenha(true);
        try {
            const res = await fetch(`${API_URL}/usuarios/alterar-senha/${usuarioSenha.id_usuarios}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nova_senha: formSenha.nova_senha })
            });
            const data = await res.json();
            if (!res.ok) { setErroSenha(data.erro || "Erro ao alterar senha."); return; }
            fecharModalSenha();
        } catch (e) {
            setErroSenha("Erro de conexão com o servidor.");
        } finally {
            setSalvandoSenha(false);
        }
    };

    // ── Bloquear / Desbloquear ─────────────────────────────────────────────────

    const handleBloquear = async (u) => {
        const acao = u.st_bloqueado === "S" ? "desbloquear" : "bloquear";
        if (!window.confirm(`Deseja ${acao} o usuário "${u.nm_usuario}"?`)) return;
        setProcessando(true);
        try {
            if (u.st_bloqueado === "S") {
                await fetch(`${API_URL}/usuarios/desbloquear/${u.id_usuarios}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }
                });
            } else {
                await fetch(`${API_URL}/usuarios/bloquear/${u.id_usuarios}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_usuariosbloqueio: usuarioLogado?.id_usuarios || null })
                });
            }
            carregarUsuarios();
        } catch (e) {
            alert("Erro ao processar ação.");
        } finally {
            setProcessando(false);
        }
    };

    const handleExcluir = async (u) => {
        if (!window.confirm(`Deseja excluir o usuário "${u.nm_usuario}"? Esta ação não pode ser desfeita.`)) return;
        try {
            const res = await fetch(`${API_URL}/usuarios/excluir/${u.id_usuarios}`, { method: "DELETE" });
            if (res.ok) carregarUsuarios();
            else { const d = await res.json(); alert(d.erro || "Erro ao excluir."); }
        } catch (e) { alert("Erro de conexão."); }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    const COLUNAS_PERM = [
        { campo: "acessar",   label: "Acessar",   destaque: true  },
        { campo: "consultar", label: "Consultar",  destaque: false },
        { campo: "incluir",   label: "Incluir",    destaque: false },
        { campo: "editar",    label: "Editar",     destaque: false },
        { campo: "imprimir",  label: "Imprimir",   destaque: false },
        { campo: "excluir",   label: "Excluir",    destaque: false },
    ];

    return (
        <div style={{ backgroundColor: "#f5f0eb", minHeight: "100vh" }}>

            {/* Navbar */}
            <Navbar bg="white" className="border-bottom py-2 shadow-sm mb-4">
                <Container>
                    <Navbar.Brand className="d-flex align-items-center gap-2">
                        <img src={logo_cafe} alt="Café Francesa" height="40"
                            style={{ objectFit: "contain", maxWidth: 120 }}
                            onError={(e) => { e.target.style.display = "none"; }} />
                        <h5 className="fw-bold mb-0 text-uppercase" style={{ color: COR_CAFE }}>
                            Café Francesa
                        </h5>
                    </Navbar.Brand>
                    <Navbar.Collapse className="justify-content-end">
                        <Button size="sm" className="rounded-pill px-3 fw-bold"
                            style={{ borderColor: COR_CAFE, color: COR_CAFE, background: "transparent" }}
                            onClick={() => navigate("/menu")}>
                            <FaArrowLeft className="me-1" /> Menu
                        </Button>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container>
                {/* Cabeçalho */}
                <Card className="border-0 shadow-sm mb-4 rounded-4">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col>
                                <div className="d-flex align-items-center" style={{ color: COR_CAFE }}>
                                    <FaUserShield className="me-2" size={20} />
                                    <h5 className="fw-bold mb-0 text-uppercase">Gestão de Usuários</h5>
                                </div>
                                <p className="text-muted small mb-0 mt-1">Cadastro e gerenciamento de usuários do sistema.</p>
                            </Col>
                            <Col xs="auto" className="d-flex gap-2">
                                <Button variant="outline-secondary" className="rounded-pill px-4 fw-bold"
                                    onClick={() => navigate("/menu")}>
                                    <FaArrowLeft className="me-2" /> Menu Principal
                                </Button>
                                <Button className="rounded-pill px-4 fw-bold shadow-sm text-uppercase"
                                    style={{ background: COR_CAFE, border: "none" }}
                                    onClick={abrirModalNovo}>
                                    <FaPlus className="me-2" /> Novo Usuário
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Tabela */}
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <Table hover responsive className="mb-0 text-uppercase" style={{ fontSize: "0.78rem" }}>
                        <thead className="border-bottom text-muted" style={{ background: "#faf6f2" }}>
                            <tr>
                                <th className="py-3 text-center">Foto</th>
                                <th className="py-3">Usuário</th>
                                <th className="py-3">CPF</th>
                                <th className="py-3">E-mail</th>
                                <th className="py-3 text-center">Nascimento</th>
                                <th className="py-3 text-center">Cadastro</th>
                                <th className="py-3 text-center">Status</th>
                                <th className="py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregando ? (
                                <tr><td colSpan="8" className="text-center py-5">
                                    <Spinner animation="border" style={{ color: COR_CAFE }} />
                                </td></tr>
                            ) : usuarios.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-5 text-muted">Nenhum usuário cadastrado.</td></tr>
                            ) : usuarios.map((u) => (
                                <tr key={u.id_usuarios}>
                                    <td className="align-middle text-center">
                                        {u.by_foto && u.st_exibirfoto === "S" ? (
                                            <img src={u.by_foto} alt="Foto" width={36} height={36}
                                                style={{ borderRadius: "50%", objectFit: "cover", border: `2px solid ${COR_CAFE}` }} />
                                        ) : (
                                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0e8e0", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                                <FaUsers size={14} style={{ color: COR_CAFE }} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="align-middle fw-bold" style={{ color: COR_CAFE }}>{u.nm_usuario}</td>
                                    <td className="align-middle text-muted">
                                        {u.nr_cpf ? u.nr_cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : <span className="fst-italic">—</span>}
                                    </td>
                                    <td className="align-middle text-muted text-lowercase">{u.ds_email || <span className="fst-italic">—</span>}</td>
                                    <td className="align-middle text-center text-muted">
                                        {u.dt_nascimento ? new Date(u.dt_nascimento).toLocaleDateString("pt-BR") : "—"}
                                    </td>
                                    <td className="align-middle text-center text-muted">
                                        {u.dt_cadastro ? new Date(u.dt_cadastro).toLocaleDateString("pt-BR") : "—"}
                                    </td>
                                    <td className="align-middle text-center">
                                        {u.st_bloqueado === "S" ? (
                                            <div>
                                                <Badge bg="danger" className="px-2 d-block mb-1">Bloqueado</Badge>
                                                {u.dt_bloqueio && <div className="text-muted" style={{ fontSize: "10px" }}>{new Date(u.dt_bloqueio).toLocaleDateString("pt-BR")}</div>}
                                            </div>
                                        ) : (
                                            <Badge bg="success" className="px-2">Ativo</Badge>
                                        )}
                                    </td>
                                    <td className="align-middle text-center">
                                        <div className="d-flex gap-1 justify-content-center">
                                            <Button variant="outline-warning" size="sm" className="rounded-pill" title="Alterar senha" onClick={() => abrirModalSenha(u)}><FaKey /></Button>
                                            <Button variant="outline-secondary" size="sm" className="rounded-pill" onClick={() => abrirModalEditar(u)}><FaEdit /></Button>
                                            <Button variant={u.st_bloqueado === "S" ? "outline-success" : "outline-secondary"} size="sm" className="rounded-pill"
                                                title={u.st_bloqueado === "S" ? "Desbloquear" : "Bloquear"}
                                                onClick={() => handleBloquear(u)} disabled={processando}>
                                                {u.st_bloqueado === "S" ? <FaUnlock /> : <FaLock />}
                                            </Button>
                                            <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={() => handleExcluir(u)}><FaTrash /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            </Container>

            {/* ── Modal Criar / Editar ──────────────────────────────────────────── */}
            <Modal show={showModal} onHide={fecharModal} centered size="xl">
                <Modal.Header closeButton style={{ background: "#faf6f2" }}>
                    <Modal.Title className="h6 fw-bold text-uppercase">
                        <FaUserShield className="me-2" style={{ color: COR_CAFE }} />
                        {modoEdicao ? "Editar Usuário" : "Novo Usuário"}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSalvar}>
                    <Modal.Body className="p-0">
                        {erroModal && (
                            <div className="px-4 pt-3">
                                <Alert variant="danger" className="py-2 small" dismissible onClose={() => setErroModal(null)}>
                                    {erroModal}
                                </Alert>
                            </div>
                        )}

                        <Tab.Container activeKey={abaAtiva} onSelect={setAbaAtiva}>
                            {/* Abas */}
                            <Nav variant="tabs" className="px-4 pt-3 border-bottom" style={{ background: "#faf6f2" }}>
                                <Nav.Item>
                                    <Nav.Link eventKey="dados" className="fw-bold"
                                        style={abaAtiva === "dados" ? { color: COR_CAFE, borderBottomColor: COR_CAFE } : {}}>
                                        <FaUserShield className="me-1" size={13} /> Dados
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="permissoes" className="fw-bold"
                                        style={abaAtiva === "permissoes" ? { color: COR_CAFE, borderBottomColor: COR_CAFE } : {}}>
                                        <FaShieldAlt className="me-1" size={13} /> Permissões
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Tab.Content className="p-4">

                                {/* ── ABA DADOS ── */}
                                <Tab.Pane eventKey="dados">
                                    <Row className="g-3">
                                        {/* Coluna da foto */}
                                        <Col md={3} className="d-flex flex-column align-items-center">
                                            <div
                                                style={{ width: 110, height: 110, borderRadius: "50%", background: "#f0e8e0", border: `3px dashed #C4956A`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                                                onClick={() => inputFotoRef.current?.click()}
                                            >
                                                {previewFoto
                                                    ? <img src={previewFoto} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    : <FaCamera size={28} style={{ color: COR_CAFE }} />}
                                            </div>
                                            <input ref={inputFotoRef} type="file" accept="image/*" className="d-none" onChange={handleFoto} />
                                            <div className="mt-2 d-flex gap-2">
                                                <Button variant="outline-secondary" size="sm" className="rounded-pill" style={{ fontSize: "11px" }} onClick={() => inputFotoRef.current?.click()}>
                                                    <FaCamera className="me-1" /> Foto
                                                </Button>
                                                {previewFoto && (
                                                    <Button variant="outline-danger" size="sm" className="rounded-pill" style={{ fontSize: "11px" }} onClick={removerFoto}>
                                                        <FaTimes />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="mt-2">
                                                <Form.Check type="switch" id="st_exibirfoto" name="st_exibirfoto"
                                                    label={<span style={{ fontSize: "11px" }}>Exibir foto</span>}
                                                    checked={formAtual.st_exibirfoto === "S"} onChange={handleChange} />
                                            </div>
                                        </Col>

                                        {/* Coluna dos dados */}
                                        <Col md={9}>
                                            <Row className="g-3">
                                                {!modoEdicao && (
                                                    <Col md={4}>
                                                        <Form.Label className="fw-bold small text-uppercase" style={{ color: COR_CAFE }}>Código (Automático)</Form.Label>
                                                        <Form.Control value={formAtual.cd_usuario || "..."} disabled
                                                            style={{ background: "#faf6f2", color: COR_CAFE, fontWeight: "bold", border: `1px solid #C4956A`, cursor: "not-allowed" }} />
                                                    </Col>
                                                )}
                                                <Col md={modoEdicao ? 12 : 8}>
                                                    <Form.Label className="fw-bold small text-muted text-uppercase">Nome de Usuário <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control name="nm_usuario" value={formAtual.nm_usuario} onChange={handleChange} placeholder="ex: joao.silva" required autoComplete="off" />
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Label className="fw-bold small text-muted text-uppercase">CPF</Form.Label>
                                                    <Form.Control name="nr_cpf" value={formAtual.nr_cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} autoComplete="off" />
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Label className="fw-bold small text-muted text-uppercase">E-mail</Form.Label>
                                                    <Form.Control type="email" name="ds_email" value={formAtual.ds_email} onChange={handleChange} placeholder="ex: joao@email.com" autoComplete="off" />
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Label className="fw-bold small text-muted text-uppercase">Data de Nascimento</Form.Label>
                                                    <Form.Control type="date" name="dt_nascimento" value={formAtual.dt_nascimento} onChange={handleChange} />
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Label className="fw-bold small text-muted text-uppercase">Empregado Vinculado</Form.Label>
                                                    <Form.Select
                                                        name="id_empregados"
                                                        value={formAtual.id_empregados || ""}
                                                        onChange={handleChange}
                                                        style={{ borderColor: "#C4956A" }}
                                                    >
                                                        <option value="">— Nenhum empregado vinculado —</option>
                                                        {empregados.map(emp => (
                                                            <option key={emp.id_empregados} value={emp.id_empregados}>
                                                                {emp.nm_nomefantasia}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                    <Form.Text className="text-muted" style={{ fontSize: "11px" }}>
                                                        Opcional. Vincula este usuário a um empregado cadastrado no sistema.
                                                    </Form.Text>
                                                </Col>
                                                {!modoEdicao && (
                                                    <Col md={12}>
                                                        <Form.Label className="fw-bold small text-muted text-uppercase">Senha <span className="text-danger">*</span></Form.Label>
                                                        <InputGroup>
                                                            <Form.Control type={mostrarSenha ? "text" : "password"} name="ds_password" value={formAtual.ds_password}
                                                                onChange={handleChange} placeholder="Mínimo 8 caracteres" required autoComplete="new-password" />
                                                            <Button variant="outline-secondary" onClick={() => setMostrarSenha(v => !v)} tabIndex={-1}>
                                                                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                                                            </Button>
                                                        </InputGroup>
                                                        <Form.Text className="text-muted" style={{ fontSize: "11px" }}>Armazenada com bcrypt. Mínimo 8 caracteres.</Form.Text>
                                                    </Col>
                                                )}
                                            </Row>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                {/* ── ABA PERMISSÕES ── */}
                                <Tab.Pane eventKey="permissoes">
                                    {loadingPerms ? (
                                        <div className="text-center py-4">
                                            <Spinner animation="border" style={{ color: COR_CAFE }} />
                                            <p className="text-muted small mt-2">Carregando permissões...</p>
                                        </div>
                                    ) : todosForms.length === 0 ? (
                                        <div className="text-center py-4 text-muted">
                                            <FaShieldAlt size={32} className="mb-2 opacity-25" />
                                            <p className="small">Nenhum formulário cadastrado no sistema.</p>
                                        </div>
                                    ) : (() => {
                                        const todosAtivos = todosForms.length > 0 && todosForms.every(f => permissoes[f.id_forms]?.acessar === "S");
                                        const termoBusca = buscarForm.toLowerCase().trim();
                                        const formsExibidos = termoBusca
                                            ? todosForms.filter(f =>
                                                (f.ds_caption || "").toLowerCase().includes(termoBusca) ||
                                                (f.nm_form || "").toLowerCase().includes(termoBusca)
                                              )
                                            : todosForms;
                                        return (
                                            <>
                                                <p className="text-muted small mb-2">
                                                    Selecione as permissões para cada tela. Ativar qualquer permissão habilita <strong>Acessar</strong> automaticamente.
                                                    Desativar <strong>Acessar</strong> remove todas as permissões daquela tela.
                                                </p>
                                                {/* Barra de busca + Selecionar Todos */}
                                                <div className="d-flex gap-2 mb-2 align-items-center">
                                                    <Form.Control
                                                        size="sm"
                                                        placeholder="Pesquisar formulário..."
                                                        value={buscarForm}
                                                        onChange={e => setBuscarForm(e.target.value)}
                                                        style={{ maxWidth: 280, borderColor: "#C4956A" }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant={todosAtivos ? "outline-danger" : "outline-secondary"}
                                                        className="rounded-pill px-3 fw-bold"
                                                        style={todosAtivos ? {} : { borderColor: COR_CAFE, color: COR_CAFE }}
                                                        onClick={handleSelecionarTodos}
                                                    >
                                                        {todosAtivos ? "Desmarcar Todos" : "Selecionar Todos"}
                                                    </Button>
                                                    {termoBusca && (
                                                        <span className="text-muted small">{formsExibidos.length} resultado(s)</span>
                                                    )}
                                                </div>
                                                <div style={{ maxHeight: 380, overflowY: "auto", border: "1px solid #f0e8e0", borderRadius: 6 }}>
                                                    <Table size="sm" className="mb-0" style={{ fontSize: "0.8rem" }}>
                                                        <thead style={{ background: "#faf6f2", position: "sticky", top: 0, zIndex: 1 }}>
                                                            <tr>
                                                                <th className="py-2 text-uppercase text-muted">Formulário</th>
                                                                {COLUNAS_PERM.map(c => (
                                                                    <th key={c.campo} className="py-2 text-center text-uppercase"
                                                                        style={{ color: c.destaque ? "#B45309" : "#6c757d", minWidth: 72 }}>
                                                                        {c.destaque && <FaShieldAlt className="me-1" size={10} />}
                                                                        {c.label}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {formsExibidos.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={COLUNAS_PERM.length + 1} className="text-center text-muted py-3 small">
                                                                        Nenhum formulário encontrado para "{buscarForm}".
                                                                    </td>
                                                                </tr>
                                                            ) : formsExibidos.map(f => (
                                                                <tr key={f.id_forms} style={{ borderBottom: "1px solid #f0e8e0" }}>
                                                                    <td className="align-middle py-2">
                                                                        <div className="fw-bold" style={{ color: COR_CAFE }}>{f.ds_caption || f.nm_form}</div>
                                                                        <div className="text-muted" style={{ fontSize: "10px" }}>{f.nm_form}</div>
                                                                    </td>
                                                                    {COLUNAS_PERM.map(c => (
                                                                        <td key={c.campo} className="text-center align-middle py-2">
                                                                            <div
                                                                                onClick={() => togglePermissao(f.id_forms, c.campo)}
                                                                                style={{
                                                                                    display: "inline-flex",
                                                                                    alignItems: "center",
                                                                                    justifyContent: "center",
                                                                                    width: c.destaque ? 36 : 28,
                                                                                    height: c.destaque ? 36 : 28,
                                                                                    borderRadius: c.destaque ? "50%" : 6,
                                                                                    cursor: "pointer",
                                                                                    border: `2px solid ${permissaoValor(f.id_forms, c.campo)
                                                                                        ? (c.destaque ? "#B45309" : COR_CAFE)
                                                                                        : "#dee2e6"}`,
                                                                                    background: permissaoValor(f.id_forms, c.campo)
                                                                                        ? (c.destaque ? "#B45309" : COR_CAFE)
                                                                                        : "#fff",
                                                                                    color: permissaoValor(f.id_forms, c.campo) ? "#fff" : "#dee2e6",
                                                                                    transition: "all 0.15s",
                                                                                    fontSize: c.destaque ? 14 : 11,
                                                                                    fontWeight: "bold"
                                                                                }}
                                                                                title={c.label}
                                                                            >
                                                                                {permissaoValor(f.id_forms, c.campo) ? "✓" : ""}
                                                                            </div>
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </Modal.Body>

                    <Modal.Footer style={{ background: "#faf6f2" }}>
                        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={fecharModal} disabled={salvando}>
                            <FaTimes className="me-1" /> Cancelar
                        </Button>
                        <Button type="submit" className="rounded-pill px-4 fw-bold shadow-sm"
                            style={{ background: COR_CAFE, border: "none" }} disabled={salvando}>
                            {salvando ? <><Spinner size="sm" className="me-2" /> Salvando...</> : <><FaSave className="me-2" /> Salvar</>}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* ── Modal Alterar Senha ─────────────────────────────────────────── */}
            <Modal show={showModalSenha} onHide={fecharModalSenha} centered size="sm">
                <Modal.Header closeButton style={{ background: "#faf6f2" }}>
                    <Modal.Title className="h6 fw-bold text-uppercase">
                        <FaKey className="me-2 text-warning" /> Alterar Senha
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSalvarSenha}>
                    <Modal.Body>
                        {usuarioSenha && <p className="text-muted small mb-3">Usuário: <strong className="text-dark">{usuarioSenha.nm_usuario}</strong></p>}
                        {erroSenha && <Alert variant="danger" className="py-2 small" dismissible onClose={() => setErroSenha(null)}>{erroSenha}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-muted text-uppercase">Nova Senha <span className="text-danger">*</span></Form.Label>
                            <InputGroup>
                                <Form.Control type={mostrarNovaSenha ? "text" : "password"} value={formSenha.nova_senha}
                                    onChange={(e) => setFormSenha(prev => ({ ...prev, nova_senha: e.target.value }))}
                                    placeholder="Mínimo 8 caracteres" required autoComplete="new-password" />
                                <Button variant="outline-secondary" onClick={() => setMostrarNovaSenha(v => !v)} tabIndex={-1}>
                                    {mostrarNovaSenha ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fw-bold small text-muted text-uppercase">Confirmar Senha <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="password" value={formSenha.confirmar_senha}
                                onChange={(e) => setFormSenha(prev => ({ ...prev, confirmar_senha: e.target.value }))}
                                placeholder="Repita a senha" required autoComplete="new-password" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer style={{ background: "#faf6f2" }}>
                        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={fecharModalSenha} disabled={salvandoSenha}>
                            <FaTimes className="me-1" /> Cancelar
                        </Button>
                        <Button variant="warning" type="submit" className="rounded-pill px-4 fw-bold shadow-sm" disabled={salvandoSenha}>
                            {salvandoSenha ? <><Spinner size="sm" className="me-2" /> Salvando...</> : <><FaKey className="me-2" /> Alterar Senha</>}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Usuarios;
