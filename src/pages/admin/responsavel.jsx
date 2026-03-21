import React, { useState, useEffect } from "react";
import {
    Container, Card, Table, Button, Modal, Form,
    Spinner, Alert, Badge, Navbar, Row, Col, InputGroup
} from "react-bootstrap";
import {
    FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
    FaArrowLeft, FaUserTie, FaClock, FaLayerGroup
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo_cafe from "../../assets/imagem/logo_cafe_francesa.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const COR_CAFE = "#6B3A2A";
const COR_LATTE = "#C4956A";
const COR_CREAM = "#f5f0eb";

const FORM_VAZIO = {
    id_empregados: "",
    ds_campo:  "",
    ds_tabela: "",
    ds_grupo:  "",
    horaini:   "",
    horafim:   "",
    nm_produto: ""
};

function formatarHora(valor) {
    if (!valor) return "—";
    return String(valor).substring(0, 5);
}

// ─── Componente ───────────────────────────────────────────────────────────────

const Responsavel = () => {
    const [registros, setRegistros]     = useState([]);
    const [empregados, setEmpregados]   = useState([]);
    const [carregando, setCarregando]   = useState(true);

    const [showModal, setShowModal]     = useState(false);
    const [modoEdicao, setModoEdicao]   = useState(false);
    const [formAtual, setFormAtual]     = useState(FORM_VAZIO);
    const [salvando, setSalvando]       = useState(false);
    const [erroModal, setErroModal]     = useState(null);

    const [confirmarExcluir, setConfirmarExcluir] = useState(null);
    const [excluindo, setExcluindo]     = useState(false);

    const [filtro, setFiltro]           = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        carregarDados();
        carregarEmpregados();
    }, []);

    const carregarDados = async () => {
        setCarregando(true);
        try {
            const res  = await fetch(`${API_URL}/responsavel/listar`);
            const data = await res.json();
            setRegistros(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setRegistros([]);
        } finally {
            setCarregando(false);
        }
    };

    const carregarEmpregados = async () => {
        try {
            const res  = await fetch(`${API_URL}/empregados/listar`);
            const data = await res.json();
            setEmpregados(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    // ── Modal ──────────────────────────────────────────────────────────────────

    const abrirModalNovo = () => {
        setFormAtual(FORM_VAZIO);
        setModoEdicao(false);
        setErroModal(null);
        setShowModal(true);
    };

    const abrirModalEditar = (r) => {
        setFormAtual({
            id_responsavelenc: r.id_responsavelenc,
            id_empregados: r.id_empregados || "",
            ds_campo:  r.ds_campo  || "",
            ds_tabela: r.ds_tabela || "",
            ds_grupo:  r.ds_grupo  || "",
            horaini:   r.horaini   ? String(r.horaini).substring(0, 5) : "",
            horafim:   r.horafim   ? String(r.horafim).substring(0, 5) : "",
            nm_produto: r.nm_produto || ""
        });
        setModoEdicao(true);
        setErroModal(null);
        setShowModal(true);
    };

    const fecharModal = () => {
        setShowModal(false);
        setErroModal(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormAtual(prev => ({ ...prev, [name]: value }));
    };

    const handleSalvar = async (e) => {
        e.preventDefault();
        setErroModal(null);

        if (!formAtual.nm_produto.trim()) {
            setErroModal("Nome do produto é obrigatório.");
            return;
        }

        setSalvando(true);
        try {
            const payload = {
                id_empregados: formAtual.id_empregados || null,
                ds_campo:  formAtual.ds_campo  || null,
                ds_tabela: formAtual.ds_tabela || null,
                ds_grupo:  formAtual.ds_grupo  || null,
                horaini:   formAtual.horaini   || null,
                horafim:   formAtual.horafim   || null,
                nm_produto: formAtual.nm_produto.trim()
            };

            let res;
            if (modoEdicao) {
                res = await fetch(`${API_URL}/responsavel/atualizar/${formAtual.id_responsavelenc}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${API_URL}/responsavel/salvar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }

            const data = await res.json();
            if (!res.ok) { setErroModal(data.erro || "Erro ao salvar registro."); return; }

            fecharModal();
            carregarDados();
        } catch (e) {
            setErroModal("Erro de conexão com o servidor.");
        } finally {
            setSalvando(false);
        }
    };

    // ── Exclusão ───────────────────────────────────────────────────────────────

    const handleExcluir = async () => {
        if (!confirmarExcluir) return;
        setExcluindo(true);
        try {
            const res = await fetch(`${API_URL}/responsavel/excluir/${confirmarExcluir.id_responsavelenc}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.erro || "Erro ao excluir.");
            } else {
                setConfirmarExcluir(null);
                carregarDados();
            }
        } catch (e) {
            alert("Erro de conexão.");
        } finally {
            setExcluindo(false);
        }
    };

    // ── Filtro ─────────────────────────────────────────────────────────────────

    const registrosFiltrados = filtro.trim()
        ? registros.filter(r =>
            (r.nm_produto  || "").toLowerCase().includes(filtro.toLowerCase()) ||
            (r.ds_grupo    || "").toLowerCase().includes(filtro.toLowerCase()) ||
            (r.nm_nomefantasia || "").toLowerCase().includes(filtro.toLowerCase()) ||
            (r.ds_campo    || "").toLowerCase().includes(filtro.toLowerCase())
          )
        : registros;

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div style={{ minHeight: "100vh", background: COR_CREAM }}>

            {/* Navbar */}
            <Navbar style={{ background: "#3D1F12" }} className="px-3 py-2 shadow">
                <div className="d-flex align-items-center gap-3 w-100">
                    <img
                        src={logo_cafe}
                        alt="Logo"
                        style={{ height: 40, width: "auto", maxWidth: 120, objectFit: "contain" }}
                    />
                    <div className="flex-grow-1">
                        <span className="fw-bold text-white" style={{ fontSize: "1rem" }}>
                            Responsável pelo Produto
                        </span>
                    </div>
                    <Button
                        variant="outline-light"
                        size="sm"
                        className="rounded-pill px-3"
                        onClick={() => navigate("/menu")}
                    >
                        <FaArrowLeft className="me-1" /> Menu Principal
                    </Button>
                </div>
            </Navbar>

            <Container className="py-4">

                {/* Toolbar */}
                <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 12 }}>
                    <Card.Body className="d-flex flex-wrap gap-2 align-items-center justify-content-between py-3">
                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                            <Form.Control
                                placeholder="Pesquisar por produto, grupo, empregado ou campo..."
                                value={filtro}
                                onChange={e => setFiltro(e.target.value)}
                                style={{ maxWidth: 400, borderColor: COR_LATTE }}
                                size="sm"
                            />
                            {filtro && (
                                <span className="text-muted small">{registrosFiltrados.length} resultado(s)</span>
                            )}
                        </div>
                        <Button
                            className="rounded-pill px-4 fw-bold shadow-sm"
                            style={{ background: COR_CAFE, border: "none" }}
                            onClick={abrirModalNovo}
                        >
                            <FaPlus className="me-2" /> Novo Registro
                        </Button>
                    </Card.Body>
                </Card>

                {/* Tabela */}
                <Card className="shadow-sm border-0" style={{ borderRadius: 12 }}>
                    <Card.Body className="p-0">
                        {carregando ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" style={{ color: COR_CAFE }} />
                                <p className="text-muted small mt-2">Carregando registros...</p>
                            </div>
                        ) : registrosFiltrados.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <FaUserTie size={40} className="mb-2 opacity-25" />
                                <p className="small">{filtro ? "Nenhum resultado encontrado." : "Nenhum registro cadastrado."}</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="mb-0" style={{ fontSize: "0.875rem" }}>
                                    <thead style={{ background: "#faf6f2" }}>
                                        <tr>
                                            <th className="py-3 px-4 text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Produto</th>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Grupo</th>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Empregado</th>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold text-center" style={{ fontSize: "0.75rem" }}>Horário</th>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Campo / Tabela</th>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold text-center" style={{ fontSize: "0.75rem" }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrosFiltrados.map(r => (
                                            <tr key={r.id_responsavelenc} style={{ borderBottom: "1px solid #f0e8e0" }}>
                                                <td className="py-3 px-4 align-middle">
                                                    <span className="fw-bold" style={{ color: COR_CAFE }}>{r.nm_produto || "—"}</span>
                                                </td>
                                                <td className="py-3 px-3 align-middle">
                                                    {r.ds_grupo ? (
                                                        <Badge style={{ background: COR_LATTE, color: "#fff", fontWeight: 500 }}
                                                            className="rounded-pill px-2">
                                                            {r.ds_grupo}
                                                        </Badge>
                                                    ) : <span className="text-muted">—</span>}
                                                </td>
                                                <td className="py-3 px-3 align-middle">
                                                    <span>{r.nm_nomefantasia || <span className="text-muted">—</span>}</span>
                                                </td>
                                                <td className="py-3 px-3 align-middle text-center">
                                                    {r.horaini || r.horafim ? (
                                                        <span className="d-flex align-items-center justify-content-center gap-1"
                                                            style={{ color: "#6c757d", fontSize: "0.82rem" }}>
                                                            <FaClock size={11} />
                                                            {formatarHora(r.horaini)} – {formatarHora(r.horafim)}
                                                        </span>
                                                    ) : <span className="text-muted">—</span>}
                                                </td>
                                                <td className="py-3 px-3 align-middle">
                                                    <div style={{ fontSize: "0.78rem", color: "#6c757d" }}>
                                                        {r.ds_campo && <div><strong>Campo:</strong> {r.ds_campo}</div>}
                                                        {r.ds_tabela && <div><strong>Tabela:</strong> {r.ds_tabela}</div>}
                                                        {!r.ds_campo && !r.ds_tabela && <span>—</span>}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 align-middle text-center">
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <Button size="sm" variant="outline-secondary" className="rounded-circle p-1"
                                                            style={{ width: 32, height: 32 }}
                                                            title="Editar"
                                                            onClick={() => abrirModalEditar(r)}>
                                                            <FaEdit size={13} />
                                                        </Button>
                                                        <Button size="sm" variant="outline-danger" className="rounded-circle p-1"
                                                            style={{ width: 32, height: 32 }}
                                                            title="Excluir"
                                                            onClick={() => setConfirmarExcluir(r)}>
                                                            <FaTrash size={13} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                    {!carregando && registros.length > 0 && (
                        <Card.Footer className="text-muted small py-2 px-4" style={{ background: "#faf6f2", borderTop: "1px solid #f0e8e0" }}>
                            {registros.length} registro(s) cadastrado(s)
                            {filtro && ` · ${registrosFiltrados.length} exibido(s)`}
                        </Card.Footer>
                    )}
                </Card>
            </Container>

            {/* ── Modal Criar / Editar ─────────────────────────────────────────── */}
            <Modal show={showModal} onHide={fecharModal} centered size="lg">
                <Modal.Header closeButton style={{ background: "#faf6f2" }}>
                    <Modal.Title className="h6 fw-bold text-uppercase">
                        <FaUserTie className="me-2" style={{ color: COR_CAFE }} />
                        {modoEdicao ? "Editar Responsável" : "Novo Responsável pelo Produto"}
                    </Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSalvar}>
                    <Modal.Body className="p-4">
                        {erroModal && (
                            <Alert variant="danger" className="py-2 small" dismissible onClose={() => setErroModal(null)}>
                                {erroModal}
                            </Alert>
                        )}

                        {/* Destaque: Nome do Produto */}
                        <div className="p-3 rounded mb-4" style={{ background: "#fff8f0", border: `2px solid ${COR_LATTE}` }}>
                            <Form.Label className="fw-bold text-uppercase" style={{ color: COR_CAFE, fontSize: "0.8rem" }}>
                                Nome do Produto <span className="text-danger">*</span>
                                <span className="ms-2 fw-normal text-muted" style={{ fontSize: "10px" }}>(nome comercial)</span>
                            </Form.Label>
                            <Form.Control
                                name="nm_produto"
                                value={formAtual.nm_produto}
                                onChange={handleChange}
                                placeholder="ex: Torta de Limão, Bolo de Cenoura..."
                                required
                                autoComplete="off"
                                style={{
                                    borderColor: COR_LATTE,
                                    fontSize: "1.05rem",
                                    fontWeight: "600",
                                    color: COR_CAFE
                                }}
                            />
                        </div>

                        <Row className="g-3">

                            {/* Empregado */}
                            <Col md={12}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">
                                    <FaUserTie className="me-1" /> Empregado Responsável
                                </Form.Label>
                                <Form.Select
                                    name="id_empregados"
                                    value={formAtual.id_empregados || ""}
                                    onChange={handleChange}
                                    style={{ borderColor: "#ced4da" }}
                                >
                                    <option value="">— Selecione o empregado —</option>
                                    {empregados.map(emp => (
                                        <option key={emp.id_empregados} value={emp.id_empregados}>
                                            {emp.nm_nomefantasia}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>

                            {/* Horário */}
                            <Col md={6}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">
                                    <FaClock className="me-1" /> Hora Início
                                </Form.Label>
                                <Form.Control
                                    type="time"
                                    name="horaini"
                                    value={formAtual.horaini}
                                    onChange={handleChange}
                                    style={{ borderColor: "#ced4da" }}
                                />
                                <Form.Text className="text-muted" style={{ fontSize: "10px" }}>
                                    Encomendas a partir desta hora são responsabilidade deste empregado.
                                </Form.Text>
                            </Col>

                            <Col md={6}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">
                                    <FaClock className="me-1" /> Hora Fim
                                </Form.Label>
                                <Form.Control
                                    type="time"
                                    name="horafim"
                                    value={formAtual.horafim}
                                    onChange={handleChange}
                                    style={{ borderColor: "#ced4da" }}
                                />
                                <Form.Text className="text-muted" style={{ fontSize: "10px" }}>
                                    Encomendas até esta hora são responsabilidade deste empregado.
                                </Form.Text>
                            </Col>

                            {/* Grupo */}
                            <Col md={12}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">
                                    <FaLayerGroup className="me-1" /> Grupo de Produtos
                                </Form.Label>
                                <Form.Control
                                    name="ds_grupo"
                                    value={formAtual.ds_grupo}
                                    onChange={handleChange}
                                    placeholder="ex: Tortas, Bolos, Salgados..."
                                    autoComplete="off"
                                />
                            </Col>

                            {/* Separador técnico */}
                            <Col md={12}>
                                <hr style={{ borderColor: "#e8ddd5", margin: "4px 0 8px" }} />
                                <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: "10px", letterSpacing: 1 }}>
                                    Mapeamento no Banco de Dados
                                </small>
                            </Col>

                            {/* ds_campo */}
                            <Col md={6}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">Nome Técnico do Campo</Form.Label>
                                <Form.Control
                                    name="ds_campo"
                                    value={formAtual.ds_campo}
                                    onChange={handleChange}
                                    placeholder="ex: qt_tortalimao"
                                    autoComplete="off"
                                    style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                                />
                                <Form.Text className="text-muted" style={{ fontSize: "10px" }}>
                                    Nome da coluna usada para identificar este produto no banco.
                                </Form.Text>
                            </Col>

                            {/* ds_tabela */}
                            <Col md={6}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">Tabela no Banco</Form.Label>
                                <Form.Control
                                    name="ds_tabela"
                                    value={formAtual.ds_tabela}
                                    onChange={handleChange}
                                    placeholder="ex: relatorios.encomendas"
                                    autoComplete="off"
                                    style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                                />
                                <Form.Text className="text-muted" style={{ fontSize: "10px" }}>
                                    Schema e tabela onde o campo está localizado.
                                </Form.Text>
                            </Col>

                        </Row>
                    </Modal.Body>

                    <Modal.Footer style={{ background: "#faf6f2" }}>
                        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={fecharModal} disabled={salvando}>
                            <FaTimes className="me-1" /> Cancelar
                        </Button>
                        <Button type="submit" className="rounded-pill px-4 fw-bold shadow-sm"
                            style={{ background: COR_CAFE, border: "none" }} disabled={salvando}>
                            {salvando
                                ? <><Spinner size="sm" className="me-2" /> Salvando...</>
                                : <><FaSave className="me-2" /> Salvar</>
                            }
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* ── Modal Confirmar Exclusão ─────────────────────────────────────── */}
            <Modal show={!!confirmarExcluir} onHide={() => setConfirmarExcluir(null)} centered size="sm">
                <Modal.Header closeButton style={{ background: "#fff5f5" }}>
                    <Modal.Title className="h6 fw-bold text-danger">
                        <FaTrash className="me-2" /> Confirmar Exclusão
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1 small text-muted">Você está prestes a excluir o registro:</p>
                    <p className="fw-bold mb-0" style={{ color: COR_CAFE }}>
                        {confirmarExcluir?.nm_produto}
                    </p>
                    {confirmarExcluir?.nm_nomefantasia && (
                        <p className="small text-muted mb-0">Empregado: {confirmarExcluir.nm_nomefantasia}</p>
                    )}
                    <p className="mt-2 small text-danger">Esta ação não pode ser desfeita.</p>
                </Modal.Body>
                <Modal.Footer style={{ background: "#fff5f5" }}>
                    <Button variant="outline-secondary" size="sm" className="rounded-pill px-3"
                        onClick={() => setConfirmarExcluir(null)} disabled={excluindo}>
                        Cancelar
                    </Button>
                    <Button variant="danger" size="sm" className="rounded-pill px-3 fw-bold"
                        onClick={handleExcluir} disabled={excluindo}>
                        {excluindo ? <><Spinner size="sm" className="me-1" /> Excluindo...</> : "Excluir"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Responsavel;
