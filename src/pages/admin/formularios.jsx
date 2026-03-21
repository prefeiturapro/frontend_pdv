import React, { useState, useEffect } from "react";
import {
    Container, Card, Table, Button, Modal, Form,
    Spinner, Alert, Badge, Navbar, Row, Col
} from "react-bootstrap";
import {
    FaPlus, FaEdit, FaTrash, FaListAlt, FaSave, FaTimes, FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import logo_cafe from "../../assets/imagem/logo_cafe_francesa.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const COR_CAFE = "#6B3A2A";

const FORM_VAZIO = { nm_form: "", ds_caption: "", ds_observacao: "", st_formreport: "N" };

const Formularios = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [formAtual, setFormAtual] = useState(FORM_VAZIO);
    const [salvando, setSalvando] = useState(false);
    const [erroModal, setErroModal] = useState(null);

    useEffect(() => {
        carregarForms();
    }, []);

    const carregarForms = async () => {
        setCarregando(true);
        try {
            const res = await fetch(`${API_URL}/forms/listar`);
            const data = await res.json();
            setForms(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Erro ao carregar formulários:", e);
            setForms([]);
        } finally {
            setCarregando(false);
        }
    };

    const abrirModalNovo = () => {
        setFormAtual(FORM_VAZIO);
        setModoEdicao(false);
        setErroModal(null);
        setShowModal(true);
    };

    const abrirModalEditar = (form) => {
        setFormAtual({
            id_forms: form.id_forms,
            nm_form: form.nm_form || "",
            ds_caption: form.ds_caption || "",
            ds_observacao: form.ds_observacao || "",
            st_formreport: form.st_formreport || "N"
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
        const { name, value, type, checked } = e.target;
        const val = type === "checkbox" ? (checked ? "S" : "N") : value;
        setFormAtual(prev => ({ ...prev, [name]: val }));
    };

    const handleSalvar = async (e) => {
        e.preventDefault();
        setErroModal(null);

        setSalvando(true);
        try {
            let res;
            if (modoEdicao) {
                res = await fetch(`${API_URL}/forms/atualizar/${formAtual.id_forms}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formAtual)
                });
            } else {
                res = await fetch(`${API_URL}/forms/salvar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formAtual)
                });
            }

            const data = await res.json();
            if (!res.ok) {
                setErroModal(data.erro || "Erro ao salvar formulário.");
                return;
            }
            fecharModal();
            carregarForms();
        } catch (e) {
            setErroModal("Erro de conexão com o servidor.");
        } finally {
            setSalvando(false);
        }
    };

    const handleExcluir = async (form) => {
        if (!window.confirm(`Deseja excluir o formulário "${form.nm_form}"?`)) return;
        try {
            const res = await fetch(`${API_URL}/forms/excluir/${form.id_forms}`, { method: "DELETE" });
            if (res.ok) {
                carregarForms();
            } else {
                const data = await res.json();
                alert(data.erro || "Erro ao excluir formulário.");
            }
        } catch (e) {
            alert("Erro de conexão com o servidor.");
        }
    };

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
                                    <FaListAlt className="me-2" size={20} />
                                    <h5 className="fw-bold mb-0 text-uppercase">Gestão de Formulários</h5>
                                </div>
                                <p className="text-muted small mb-0 mt-1">
                                    Cadastro e consulta de formulários do sistema.
                                </p>
                            </Col>
                            <Col xs="auto" className="d-flex gap-2">
                                <Button
                                    variant="outline-secondary"
                                    className="rounded-pill px-4 fw-bold"
                                    onClick={() => navigate("/menu")}
                                >
                                    <FaArrowLeft className="me-2" /> Menu Principal
                                </Button>
                                <Button
                                    className="rounded-pill px-4 fw-bold shadow-sm text-uppercase"
                                    style={{ background: COR_CAFE, border: "none" }}
                                    onClick={abrirModalNovo}
                                >
                                    <FaPlus className="me-2" /> Novo Formulário
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Tabela */}
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <Table hover responsive className="mb-0 text-uppercase" style={{ fontSize: "0.8rem" }}>
                        <thead className="border-bottom text-muted" style={{ background: "#faf6f2" }}>
                            <tr>
                                <th className="py-3">Nome</th>
                                <th className="py-3">Caption</th>
                                <th className="py-3">Observação</th>
                                <th className="py-3 text-center">Relatório</th>
                                <th className="py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregando ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <Spinner animation="border" style={{ color: COR_CAFE }} />
                                    </td>
                                </tr>
                            ) : forms.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        Nenhum formulário cadastrado.
                                    </td>
                                </tr>
                            ) : forms.map((f) => (
                                <tr key={f.id_forms}>
                                    <td className="align-middle fw-bold" style={{ color: COR_CAFE }}>{f.nm_form}</td>
                                    <td className="align-middle">{f.ds_caption}</td>
                                    <td className="align-middle text-muted">
                                        {f.ds_observacao || <span className="fst-italic">—</span>}
                                    </td>
                                    <td className="align-middle text-center">
                                        {f.st_formreport === "S"
                                            ? <Badge bg="success" className="px-3">SIM</Badge>
                                            : <Badge bg="secondary" className="px-3">NÃO</Badge>}
                                    </td>
                                    <td className="align-middle text-center">
                                        <div className="d-flex gap-1 justify-content-center">
                                            <Button variant="outline-secondary" size="sm" className="rounded-pill"
                                                onClick={() => abrirModalEditar(f)}>
                                                <FaEdit />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" className="rounded-pill"
                                                onClick={() => handleExcluir(f)}>
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            </Container>

            {/* Modal Criar / Editar */}
            <Modal show={showModal} onHide={fecharModal} centered>
                <Modal.Header closeButton style={{ background: "#faf6f2" }}>
                    <Modal.Title className="h6 fw-bold text-uppercase">
                        <FaListAlt className="me-2" style={{ color: COR_CAFE }} />
                        {modoEdicao ? "Editar Formulário" : "Novo Formulário"}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSalvar}>
                    <Modal.Body>
                        {erroModal && (
                            <Alert variant="danger" className="py-2 small" dismissible onClose={() => setErroModal(null)}>
                                {erroModal}
                            </Alert>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-muted text-uppercase">
                                Nome do Formulário <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                name="nm_form"
                                value={formAtual.nm_form}
                                onChange={handleChange}
                                placeholder="ex: FORM_CADASTRO"
                                required
                            />
                            <Form.Text className="text-muted" style={{ fontSize: "11px" }}>
                                Apenas letras, números, underscores e espaços.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-muted text-uppercase">
                                Caption (Título) <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                name="ds_caption"
                                value={formAtual.ds_caption}
                                onChange={handleChange}
                                placeholder="ex: Formulário de Cadastro"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small text-muted text-uppercase">
                                Observação
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="ds_observacao"
                                value={formAtual.ds_observacao}
                                onChange={handleChange}
                                placeholder="Observações sobre o formulário (opcional)"
                            />
                        </Form.Group>

                        <div className="p-3 rounded border" style={{ background: "#faf6f2" }}>
                            <Form.Check
                                type="switch"
                                id="st_formreport"
                                name="st_formreport"
                                label="É um formulário de relatório?"
                                checked={formAtual.st_formreport === "S"}
                                onChange={handleChange}
                                className="fw-bold"
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ background: "#faf6f2" }}>
                        <Button variant="outline-secondary" className="rounded-pill px-4"
                            onClick={fecharModal} disabled={salvando}>
                            <FaTimes className="me-1" /> Cancelar
                        </Button>
                        <Button type="submit" className="rounded-pill px-4 fw-bold shadow-sm"
                            style={{ background: COR_CAFE, border: "none" }} disabled={salvando}>
                            {salvando
                                ? <><Spinner size="sm" className="me-2" /> Salvando...</>
                                : <><FaSave className="me-2" /> Salvar</>}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Formularios;
