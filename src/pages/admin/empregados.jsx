import React, { useState, useEffect } from "react";
import {
    Container, Card, Table, Button, Modal, Form,
    Spinner, Alert, Badge, Navbar, Row, Col, InputGroup
} from "react-bootstrap";
import {
    FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowLeft,
    FaUsers, FaMapMarkerAlt, FaIdCard, FaBriefcase
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo_cafe from "../../assets/imagem/logo_cafe_francesa.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const COR_CAFE  = "#6B3A2A";
const COR_LATTE = "#C4956A";
const COR_CREAM = "#f5f0eb";

const FORM_VAZIO = {
    nm_nomefantasia: "", cargo: "",
    nr_cpf: "", nr_rg: "", nr_telefone: "", ds_email: "",
    dt_nascimento: "", dt_admissao: "", nr_pispasep: "",
    nr_cep: "", nm_logradouro: "", nr_numero: "", nm_bairro: "",
    id_municipios: "", ds_observacao: ""
};

function formatarCPF(v) {
    return v.replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        .slice(0, 14);
}

function formatarTelefone(v) {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
    return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}

function formatarCEP(v) {
    return v.replace(/\D/g, "").replace(/(\d{5})(\d{0,3})/, "$1-$2").slice(0, 9);
}

// ─── Componente ───────────────────────────────────────────────────────────────

const Empregados = () => {
    const [empregados, setEmpregados]     = useState([]);
    const [municipios, setMunicipios]     = useState([]);
    const [carregando, setCarregando]     = useState(true);

    const [showModal, setShowModal]       = useState(false);
    const [modoEdicao, setModoEdicao]     = useState(false);
    const [formAtual, setFormAtual]       = useState(FORM_VAZIO);
    const [cdProximo, setCdProximo]       = useState("");
    const [salvando, setSalvando]         = useState(false);
    const [erroModal, setErroModal]       = useState(null);

    const [confirmarExcluir, setConfirmarExcluir] = useState(null);
    const [excluindo, setExcluindo]       = useState(false);

    const [filtro, setFiltro]             = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        carregarEmpregados();
        carregarMunicipios();
    }, []);

    const carregarEmpregados = async () => {
        setCarregando(true);
        try {
            const res  = await fetch(`${API_URL}/empregados/crud/listar`);
            const data = await res.json();
            setEmpregados(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setEmpregados([]);
        } finally {
            setCarregando(false);
        }
    };

    const carregarMunicipios = async () => {
        try {
            const res  = await fetch(`${API_URL}/municipios/listar`);
            const data = await res.json();
            setMunicipios(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    // ── Modal ──────────────────────────────────────────────────────────────────

    const abrirModalNovo = async () => {
        setFormAtual(FORM_VAZIO);
        setModoEdicao(false);
        setErroModal(null);
        setShowModal(true);
        try {
            const res  = await fetch(`${API_URL}/empregados/proximo-codigo`);
            const data = await res.json();
            setCdProximo(data.cd_empregado ?? "");
        } catch { setCdProximo(""); }
    };

    const abrirModalEditar = (e) => {
        setFormAtual({
            id_empregados:   e.id_empregados,
            nm_nomefantasia: e.nm_nomefantasia || "",
            cargo:           e.cargo           || "",
            nr_cpf:          e.nr_cpf          || "",
            nr_rg:           e.nr_rg           || "",
            nr_telefone:     e.nr_telefone      || "",
            ds_email:        e.ds_email         || "",
            dt_nascimento:   e.dt_nascimento    ? e.dt_nascimento.substring(0, 10) : "",
            dt_admissao:     e.dt_admissao      ? e.dt_admissao.substring(0, 10)  : "",
            nr_pispasep:     e.nr_pispasep      || "",
            nr_cep:          e.nr_cep           || "",
            nm_logradouro:   e.nm_logradouro     || "",
            nr_numero:       e.nr_numero        || "",
            nm_bairro:       e.nm_bairro        || "",
            id_municipios:   e.id_municipios    || "",
            ds_observacao:   e.ds_observacao    || ""
        });
        setCdProximo(e.cd_empregado || "");
        setModoEdicao(true);
        setErroModal(null);
        setShowModal(true);
    };

    const fecharModal = () => { setShowModal(false); setErroModal(null); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let v = value;
        if (name === "nr_cpf")      v = formatarCPF(value);
        if (name === "nr_telefone") v = formatarTelefone(value);
        if (name === "nr_cep")      v = formatarCEP(value);
        setFormAtual(prev => ({ ...prev, [name]: v }));
    };

    const handleSalvar = async (ev) => {
        ev.preventDefault();
        setErroModal(null);

        if (!formAtual.nm_nomefantasia.trim()) {
            setErroModal("Nome do empregado é obrigatório.");
            return;
        }
        if (!formAtual.nm_logradouro.trim()) {
            setErroModal("Logradouro (rua) é obrigatório.");
            return;
        }
        if (!formAtual.nm_bairro.trim()) {
            setErroModal("Bairro é obrigatório.");
            return;
        }
        if (!formAtual.id_municipios) {
            setErroModal("Município é obrigatório.");
            return;
        }

        setSalvando(true);
        try {
            const payload = {
                ...formAtual,
                nr_cpf:      formAtual.nr_cpf.replace(/\D/g, "") || null,
                nr_telefone: formAtual.nr_telefone.replace(/\D/g, "") || null,
                nr_cep:      formAtual.nr_cep.replace(/\D/g, "") || null,
                nr_numero:   formAtual.nr_numero || null,
                id_municipios: formAtual.id_municipios || null,
                dt_nascimento: formAtual.dt_nascimento || null,
                dt_admissao:   formAtual.dt_admissao   || null
            };

            const url = modoEdicao
                ? `${API_URL}/empregados/atualizar/${formAtual.id_empregados}`
                : `${API_URL}/empregados/salvar`;

            const res = await fetch(url, {
                method: modoEdicao ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) { setErroModal(data.erro || "Erro ao salvar."); return; }

            fecharModal();
            carregarEmpregados();
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
            const res = await fetch(`${API_URL}/empregados/excluir/${confirmarExcluir.id_empregados}`, { method: "DELETE" });
            if (!res.ok) { const d = await res.json(); alert(d.erro || "Erro ao excluir."); }
            else { setConfirmarExcluir(null); carregarEmpregados(); }
        } catch { alert("Erro de conexão."); }
        finally { setExcluindo(false); }
    };

    // ── Filtro ─────────────────────────────────────────────────────────────────

    const lista = filtro.trim()
        ? empregados.filter(e =>
            (e.nm_nomefantasia || "").toLowerCase().includes(filtro.toLowerCase()) ||
            (e.cargo           || "").toLowerCase().includes(filtro.toLowerCase()) ||
            (e.nr_cpf          || "").includes(filtro) ||
            (e.nm_municipio    || "").toLowerCase().includes(filtro.toLowerCase())
          )
        : empregados;

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div style={{ minHeight: "100vh", background: COR_CREAM }}>

            {/* Navbar */}
            <Navbar style={{ background: "#3D1F12" }} className="px-3 py-2 shadow">
                <div className="d-flex align-items-center gap-3 w-100">
                    <img src={logo_cafe} alt="Logo"
                        style={{ height: 40, width: "auto", maxWidth: 120, objectFit: "contain" }} />
                    <div className="flex-grow-1">
                        <span className="fw-bold text-white" style={{ fontSize: "1rem" }}>
                            Cadastro de Empregados
                        </span>
                    </div>
                    <Button variant="outline-light" size="sm" className="rounded-pill px-3"
                        onClick={() => navigate("/menu")}>
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
                                placeholder="Pesquisar por nome, cargo, CPF ou município..."
                                value={filtro}
                                onChange={e => setFiltro(e.target.value)}
                                style={{ maxWidth: 420, borderColor: COR_LATTE }}
                                size="sm"
                            />
                            {filtro && <span className="text-muted small">{lista.length} resultado(s)</span>}
                        </div>
                        <Button className="rounded-pill px-4 fw-bold shadow-sm"
                            style={{ background: COR_CAFE, border: "none" }}
                            onClick={abrirModalNovo}>
                            <FaPlus className="me-2" /> Novo Empregado
                        </Button>
                    </Card.Body>
                </Card>

                {/* Tabela */}
                <Card className="shadow-sm border-0" style={{ borderRadius: 12 }}>
                    <Card.Body className="p-0">
                        {carregando ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" style={{ color: COR_CAFE }} />
                                <p className="text-muted small mt-2">Carregando empregados...</p>
                            </div>
                        ) : lista.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <FaUsers size={40} className="mb-2 opacity-25" />
                                <p className="small">{filtro ? "Nenhum resultado encontrado." : "Nenhum empregado cadastrado."}</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="mb-0" style={{ fontSize: "0.875rem" }}>
                                    <thead style={{ background: "#faf6f2" }}>
                                        <tr>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold" style={{ fontSize: "0.7rem" }}>Cód.</th>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold" style={{ fontSize: "0.7rem" }}>Nome</th>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold" style={{ fontSize: "0.7rem" }}>Cargo</th>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold" style={{ fontSize: "0.7rem" }}>CPF</th>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold" style={{ fontSize: "0.7rem" }}>Telefone</th>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold" style={{ fontSize: "0.7rem" }}>Município</th>
                                            <th className="py-3 px-3 text-uppercase text-muted fw-semibold text-center" style={{ fontSize: "0.7rem" }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lista.map(emp => (
                                            <tr key={emp.id_empregados} style={{ borderBottom: "1px solid #f0e8e0" }}>
                                                <td className="py-3 px-3 align-middle">
                                                    <span className="badge rounded-pill" style={{ background: "#f0e8e0", color: COR_CAFE, fontWeight: 700 }}>
                                                        {emp.cd_empregado}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 align-middle fw-bold" style={{ color: COR_CAFE }}>
                                                    {emp.nm_nomefantasia}
                                                </td>
                                                <td className="py-3 px-3 align-middle">
                                                    {emp.cargo
                                                        ? <Badge style={{ background: COR_LATTE }} className="rounded-pill">{emp.cargo}</Badge>
                                                        : <span className="text-muted">—</span>}
                                                </td>
                                                <td className="py-3 px-3 align-middle text-muted" style={{ fontSize: "0.82rem" }}>
                                                    {emp.nr_cpf
                                                        ? emp.nr_cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
                                                        : "—"}
                                                </td>
                                                <td className="py-3 px-3 align-middle text-muted" style={{ fontSize: "0.82rem" }}>
                                                    {emp.nr_telefone || "—"}
                                                </td>
                                                <td className="py-3 px-3 align-middle text-muted" style={{ fontSize: "0.82rem" }}>
                                                    {emp.nm_municipio || "—"}
                                                </td>
                                                <td className="py-3 px-3 align-middle text-center">
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <Button size="sm" variant="outline-secondary"
                                                            className="rounded-circle p-1" style={{ width: 32, height: 32 }}
                                                            title="Editar" onClick={() => abrirModalEditar(emp)}>
                                                            <FaEdit size={13} />
                                                        </Button>
                                                        <Button size="sm" variant="outline-danger"
                                                            className="rounded-circle p-1" style={{ width: 32, height: 32 }}
                                                            title="Excluir" onClick={() => setConfirmarExcluir(emp)}>
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
                    {!carregando && empregados.length > 0 && (
                        <Card.Footer className="text-muted small py-2 px-4"
                            style={{ background: "#faf6f2", borderTop: "1px solid #f0e8e0" }}>
                            {empregados.length} empregado(s) cadastrado(s)
                            {filtro && ` · ${lista.length} exibido(s)`}
                        </Card.Footer>
                    )}
                </Card>
            </Container>

            {/* ── Modal Criar / Editar ─────────────────────────────────────────── */}
            <Modal show={showModal} onHide={fecharModal} centered size="lg" scrollable>
                <Modal.Header closeButton style={{ background: "#faf6f2" }}>
                    <Modal.Title className="h6 fw-bold text-uppercase">
                        <FaUsers className="me-2" style={{ color: COR_CAFE }} />
                        {modoEdicao ? "Editar Empregado" : "Novo Empregado"}
                    </Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSalvar}>
                    <Modal.Body className="p-4" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                        {erroModal && (
                            <Alert variant="danger" className="py-2 small" dismissible onClose={() => setErroModal(null)}>
                                {erroModal}
                            </Alert>
                        )}

                        {/* ── Identificação ── */}
                        <div className="mb-1" style={{ fontSize: "0.7rem", color: COR_CAFE, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                            <FaIdCard className="me-1" /> Identificação
                        </div>
                        <hr style={{ borderColor: COR_LATTE, marginTop: 2, marginBottom: 12 }} />
                        <Row className="g-3 mb-4">
                            <Col md={3}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">Código</Form.Label>
                                <Form.Control
                                    value={cdProximo || "—"}
                                    disabled
                                    style={{ background: "#faf6f2", color: COR_CAFE, fontWeight: "bold",
                                        border: `1px solid ${COR_LATTE}`, cursor: "not-allowed" }}
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">
                                    Nome do Empregado <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    name="nm_nomefantasia"
                                    value={formAtual.nm_nomefantasia}
                                    onChange={handleChange}
                                    placeholder="Nome completo"
                                    required autoComplete="off"
                                    style={{ fontWeight: 600, color: COR_CAFE }}
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">
                                    <FaBriefcase className="me-1" /> Cargo
                                </Form.Label>
                                <Form.Control
                                    name="cargo"
                                    value={formAtual.cargo}
                                    onChange={handleChange}
                                    placeholder="ex: Confeiteiro"
                                    autoComplete="off"
                                />
                            </Col>
                        </Row>

                        {/* ── Dados Pessoais ── */}
                        <div className="mb-1" style={{ fontSize: "0.7rem", color: COR_CAFE, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                            <FaIdCard className="me-1" /> Dados Pessoais
                        </div>
                        <hr style={{ borderColor: COR_LATTE, marginTop: 2, marginBottom: 12 }} />
                        <Row className="g-3 mb-4">
                            <Col md={4}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">CPF</Form.Label>
                                <Form.Control
                                    name="nr_cpf"
                                    value={formAtual.nr_cpf}
                                    onChange={handleChange}
                                    placeholder="000.000.000-00"
                                    maxLength={14} autoComplete="off"
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">RG</Form.Label>
                                <Form.Control
                                    name="nr_rg"
                                    value={formAtual.nr_rg}
                                    onChange={handleChange}
                                    placeholder="Número do RG"
                                    autoComplete="off"
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">PIS/PASEP</Form.Label>
                                <Form.Control
                                    name="nr_pispasep"
                                    value={formAtual.nr_pispasep}
                                    onChange={handleChange}
                                    placeholder="Número do PIS"
                                    autoComplete="off"
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">Telefone</Form.Label>
                                <Form.Control
                                    name="nr_telefone"
                                    value={formAtual.nr_telefone}
                                    onChange={handleChange}
                                    placeholder="(00) 00000-0000"
                                    autoComplete="off"
                                />
                            </Col>
                            <Col md={8}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">E-mail</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="ds_email"
                                    value={formAtual.ds_email}
                                    onChange={handleChange}
                                    placeholder="email@exemplo.com"
                                    autoComplete="off"
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">Data de Nascimento</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dt_nascimento"
                                    value={formAtual.dt_nascimento}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">Data de Admissão</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dt_admissao"
                                    value={formAtual.dt_admissao}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>

                        {/* ── Endereço ── */}
                        <div className="mb-1" style={{ fontSize: "0.7rem", color: COR_CAFE, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                            <FaMapMarkerAlt className="me-1" /> Endereço
                        </div>
                        <hr style={{ borderColor: COR_LATTE, marginTop: 2, marginBottom: 12 }} />
                        <Row className="g-3 mb-4">
                            <Col md={3}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">CEP</Form.Label>
                                <Form.Control
                                    name="nr_cep"
                                    value={formAtual.nr_cep}
                                    onChange={handleChange}
                                    placeholder="00000-000"
                                    maxLength={9} autoComplete="off"
                                />
                            </Col>
                            <Col md={7}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">
                                    Logradouro (Rua) <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    name="nm_logradouro"
                                    value={formAtual.nm_logradouro}
                                    onChange={handleChange}
                                    placeholder="Nome da rua"
                                    autoComplete="off"
                                    required
                                />
                            </Col>
                            <Col md={2}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">Número</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="nr_numero"
                                    value={formAtual.nr_numero}
                                    onChange={handleChange}
                                    placeholder="Nº"
                                    min={0}
                                />
                            </Col>
                            <Col md={5}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">
                                    Bairro <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    name="nm_bairro"
                                    value={formAtual.nm_bairro}
                                    onChange={handleChange}
                                    placeholder="Nome do bairro"
                                    autoComplete="off"
                                    required
                                />
                            </Col>
                            <Col md={7}>
                                <Form.Label className="fw-bold small text-muted text-uppercase">
                                    Município <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="id_municipios"
                                    value={formAtual.id_municipios || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">— Selecione o município —</option>
                                    {municipios.map(m => (
                                        <option key={m.id_municipios} value={m.id_municipios}>
                                            {m.nm_municipio}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>

                        {/* ── Observações ── */}
                        <div className="mb-1" style={{ fontSize: "0.7rem", color: COR_CAFE, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                            Observações
                        </div>
                        <hr style={{ borderColor: COR_LATTE, marginTop: 2, marginBottom: 12 }} />
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="ds_observacao"
                            value={formAtual.ds_observacao}
                            onChange={handleChange}
                            placeholder="Anotações adicionais sobre o empregado..."
                            style={{ resize: "vertical" }}
                        />
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

            {/* ── Modal Confirmar Exclusão ─────────────────────────────────────── */}
            <Modal show={!!confirmarExcluir} onHide={() => setConfirmarExcluir(null)} centered size="sm">
                <Modal.Header closeButton style={{ background: "#fff5f5" }}>
                    <Modal.Title className="h6 fw-bold text-danger">
                        <FaTrash className="me-2" /> Confirmar Exclusão
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1 small text-muted">Você está prestes a excluir o empregado:</p>
                    <p className="fw-bold mb-0" style={{ color: COR_CAFE }}>{confirmarExcluir?.nm_nomefantasia}</p>
                    {confirmarExcluir?.cargo && (
                        <p className="small text-muted mb-0">Cargo: {confirmarExcluir.cargo}</p>
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

export default Empregados;
