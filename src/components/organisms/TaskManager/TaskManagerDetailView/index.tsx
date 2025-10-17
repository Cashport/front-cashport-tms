"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Collapse,
  Modal,
  Input,
  Select,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  Flex,
  Tooltip,
  Divider
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  EditOutlined,
  MoreOutlined,
  PaperClipOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  DownOutlined,
  UpOutlined
} from "@ant-design/icons";
import Container from "@/components/atoms/Container/Container";
import { CheckCircle, XCircle, Clock } from "phosphor-react";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

interface TaskManagerDetailViewProps {
  moduleTitle: string;
  onBack?: () => void;
}

const TaskManagerDetailView = ({ moduleTitle, onBack }: TaskManagerDetailViewProps) => {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectObservation, setRejectObservation] = useState("");
  const [isComparativeAnalysisOpen, setIsComparativeAnalysisOpen] = useState(true);
  const [isTripInfoOpen, setIsTripInfoOpen] = useState(true);

  // Datos mock
  const generalInfo = {
    tipoServicio: "Izaje",
    vp: "VRO",
    ubicacion: "POZO CHICHIMENE",
    ubicacionDetalle: "Santander - Puerto Wilches",
    solicitudPara: "Viaje puntual",
    trProyecto: "TO-28268",
    validadoCoordinador: "Sí",
    proveedorRecomendado: "Sí",
    montoTotal: 673000000,
    alertaMonto: true
  };

  const travelInfo = {
    origen: "Bogotá",
    destino: "Medellín",
    fechaSalida: "2025-10-20",
    fechaRegreso: "2025-10-25",
    pasajeros: 2,
    clase: "Económica"
  };

  const forecastData = [
    {
      proveedor: "COLTANQUES",
      vendor: "121313551",
      contrato: "12135158 CAMABAJA",
      tipoVehiculo: "0 - 100 KM",
      descripcionTarifa: "0 - 100 KM",
      tarifa: 1500000,
      cantidadUsos: 10,
      total: 150000000
    },
    {
      proveedor: "ENTRAPETROL",
      vendor: "111118888",
      contrato: "55551234 PLANA",
      tipoVehiculo: "100 - 200 KM",
      descripcionTarifa: "100 - 200 KM",
      tarifa: 2200000,
      cantidadUsos: 5,
      total: 11000000
    }
  ];

  const forecastTotal = forecastData.reduce((sum, item) => sum + item.total, 0);

  const rateComparison = {
    vehiculo: "TRACTOMULA C3S3 - COLTANQUES",
    origen: "BASE NEIVA",
    destino: "CEBU-21",
    tarifaSeleccionada: 1371192,
    rangoKm: "Km 0 - 50",
    proveedores: [
      {
        proveedor: "COLTANQUES",
        tipo: "Nacional",
        tipoVehiculo: "TRACTOMULA C3S3",
        tipoTarifa: "C - 50 KM",
        contrato: "38733773",
        tarifa: 500000,
        diferencia: "+10%"
      },
      {
        proveedor: "NG TRANSPORTES",
        tipo: "Comunidad",
        tipoVehiculo: "TRACTOMULA C3S3",
        tipoTarifa: "C - 50 KM",
        contrato: "98377826",
        tarifa: 620000,
        diferencia: "+15%"
      },
      {
        proveedor: "ENTRAPETROL",
        tipo: "Nacional",
        tipoVehiculo: "TRACTOMULA C3S3",
        tipoTarifa: "C - 50 KM",
        contrato: "28727826",
        tarifa: 470000,
        diferencia: "-7%"
      }
    ]
  };

  const pendingApprovers = [
    { name: "Miguel Martinez", role: "Coordinador", status: "pending" },
    { name: "Ana García", role: "Gerente Regional", status: "pending" },
    { name: "Carlos López", role: "Director Financiero", status: "approved" }
  ];

  // Helpers
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircleOutlined style={{ color: "green" }} />;
      case "rejected":
        return <CloseCircleOutlined style={{ color: "red" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "gray" }} />;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "approved":
        return <Tag color="green">Aprobado</Tag>;
      case "rejected":
        return <Tag color="red">Rechazado</Tag>;
      default:
        return <Tag color="default">Pendiente</Tag>;
    }
  };

  // Handlers
  const handleApprove = () => setShowApproveModal(true);
  const handleReject = () => setShowRejectModal(true);
  const confirmApprove = () => {
    console.log("Aprobado");
    setShowApproveModal(false);
  };
  const confirmReject = () => {
    console.log("Rechazado con:", rejectReason, rejectObservation);
    setShowRejectModal(false);
  };
  const handleDownloadEmail = () => {
    console.log("Downloading sustainability department email confirmation");
    const link = document.createElement("a");
    link.href = "#";
    link.download = "confirmacion-sostenibilidad.pdf";
  };
  const promedioTarifa = Math.round(
    rateComparison.proveedores.reduce((sum, p) => sum + p.tarifa, 0) /
      rateComparison.proveedores.length
  );

  const diferenciaPromedio = (() => {
    const diffs = rateComparison.proveedores.map((p) => parseFloat(p.diferencia.replace("%", "")));
    const avg = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
    return (avg >= 0 ? "+" : "") + avg.toFixed(0) + "%";
  })();

  return (
    <div style={{ overflowY: "auto" }}>
      <Container>
        {/* ===== HEADER DE ACCIONES ===== */}
        <Flex
          justify="space-between"
          align="center"
          style={{
            marginBottom: 24,
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: 12
          }}
        >
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ fontWeight: 500 }}>
              Volver
            </Button>

            <Tooltip title="Generar acción (no disponible)">
              <Button icon={<MoreOutlined />} disabled>
                Generar acción
              </Button>
            </Tooltip>

            <Tooltip title="Editar tarea (no disponible)">
              <Button icon={<EditOutlined />} disabled>
                Editar
              </Button>
            </Tooltip>
          </Space>

          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleApprove}
              style={{ fontWeight: 500 }}
            >
              Aprobar
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={handleReject}
              style={{ fontWeight: 500 }}
            >
              Rechazar
            </Button>
          </Space>
        </Flex>

        {/* ===== CARD PRINCIPAL CON BLOQUES INTERNOS ===== */}
        <Card style={{ marginBottom: 24, padding: 0 }}>
          {/* ===== INFORMACIÓN DE APROBACIÓN ===== */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <Title level={4}>Información de aprobación</Title>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text type="secondary">Solicitud de aprobación para</Text>
                <div>{generalInfo.solicitudPara}</div>
              </Col>

              <Col xs={24} md={12}>
                <Text type="secondary">TR o Proyecto asociado a esta solicitud</Text>
                <div style={{ color: "#1677ff", cursor: "pointer" }}>{generalInfo.trProyecto}</div>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              <Col xs={24} md={12}>
                <Text type="secondary">
                  Validado previamente con el coordinador de la zona que no haya un contrato activo
                  para este scope?
                </Text>
                <div style={{ color: "green", fontWeight: 600 }}>
                  {generalInfo.validadoCoordinador}
                </div>
              </Col>

              <Col xs={24} md={12}>
                <Text type="secondary">
                  ¿Este proveedor es recomendado por el departamento de sostenibilidad?
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ color: "green", fontWeight: 600 }}>
                    {generalInfo.proveedorRecomendado}
                  </div>
                  <Button
                    type="link"
                    icon={<PaperClipOutlined />}
                    onClick={handleDownloadEmail}
                    style={{ padding: 0 }}
                  >
                    Descargar correo de confirmación <DownloadOutlined />
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          {/* ===== INFORMACIÓN DEL VIAJE ===== */}
          <div style={{ padding: "16px 0", borderTop: "1px solid #f0f0f0" }}>
            <Collapse accordion defaultActiveKey={["1"]} expandIconPosition="end" bordered={false}>
              <Panel header="Información del viaje" key="1">
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Text type="secondary">Origen</Text>
                    <div style={{ fontWeight: 600 }}>{travelInfo.origen}</div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Text type="secondary">Destino</Text>
                    <div style={{ fontWeight: 600 }}>{travelInfo.destino}</div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Text type="secondary">Fecha de salida</Text>
                    <div style={{ fontWeight: 600 }}>{travelInfo.fechaSalida}</div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Text type="secondary">Fecha de regreso</Text>
                    <div style={{ fontWeight: 600 }}>{travelInfo.fechaRegreso}</div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Text type="secondary">Número de pasajeros</Text>
                    <div style={{ fontWeight: 600 }}>{travelInfo.pasajeros}</div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Text type="secondary">Clase de viaje</Text>
                    <div style={{ fontWeight: 600 }}>{travelInfo.clase}</div>
                  </Col>
                </Row>
              </Panel>
            </Collapse>
          </div>

          {/* ===== FORECAST DE TARIFAS ===== */}
          <div style={{ padding: "16px 24px" }}>
            <Title level={4}>Forecast</Title>
            <Table
              dataSource={forecastData}
              rowKey={(record) => record.proveedor + record.contrato}
              pagination={false}
              bordered
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <div style={{ textAlign: "right", fontWeight: 600 }}>Total:</div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    <div style={{ fontWeight: 600 }}>
                      {forecastTotal.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP"
                      })}
                    </div>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            >
              <Table.Column title="Proveedor" dataIndex="proveedor" key="proveedor" />
              <Table.Column title="Contrato" dataIndex="contrato" key="contrato" />
              <Table.Column title="Tipo Vehículo" dataIndex="tipoVehiculo" key="tipoVehiculo" />
              <Table.Column
                title="Tarifa"
                dataIndex="tarifa"
                key="tarifa"
                render={(value: number) =>
                  value.toLocaleString("es-CO", { style: "currency", currency: "COP" })
                }
              />
              <Table.Column title="Cantidad de usos" dataIndex="cantidadUsos" key="cantidadUsos" />
              <Table.Column
                title="Total"
                dataIndex="total"
                key="total"
                render={(value: number) =>
                  value.toLocaleString("es-CO", { style: "currency", currency: "COP" })
                }
              />
            </Table>
          </div>
          {/* ===== ANÁLISIS COMPARATIVO ===== */}
          <div style={{ padding: "16px 0", borderTop: "1px solid #f0f0f0" }}>
            <Collapse accordion defaultActiveKey={["1"]} expandIconPosition="end" bordered={false}>
              <Panel header="Análisis comparativo" key="1">
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12
                    }}
                  >
                    <div>
                      <strong>{rateComparison.proveedores[0].proveedor}</strong>
                      <div style={{ fontSize: 12, color: "#555" }}>
                        Vendor: 12135434 Contrato: 101513546
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>
                        $ {rateComparison.tarifaSeleccionada.toLocaleString("es-CO")}
                      </div>
                      <div style={{ fontWeight: 600 }}>{rateComparison.vehiculo}</div>
                      <div style={{ fontSize: 12, color: "#555" }}>{rateComparison.rangoKm}</div>
                    </div>
                  </div>

                  <Table
                    dataSource={rateComparison.proveedores}
                    rowKey={(record) => record.proveedor + record.contrato}
                    pagination={false}
                    bordered={false}
                    size="small"
                    style={{ margin: 0 }}
                    rowClassName={(record, index) =>
                      index === rateComparison.proveedores.length ? "bg-gray-50" : ""
                    }
                  >
                    <Table.Column
                      title="Proveedor"
                      dataIndex="proveedor"
                      key="proveedor"
                      render={(text) => <strong>{text}</strong>}
                    />
                    <Table.Column title="Tipo" dataIndex="tipo" key="tipo" />
                    <Table.Column
                      title="Tipo vehículo"
                      dataIndex="tipoVehiculo"
                      key="tipoVehiculo"
                    />
                    <Table.Column title="Tipo tarifa" dataIndex="tipoTarifa" key="tipoTarifa" />
                    <Table.Column title="Contrato" dataIndex="contrato" key="contrato" />
                    <Table.Column
                      title="Tarifa"
                      dataIndex="tarifa"
                      key="tarifa"
                      render={(value: number) => `$ ${value.toLocaleString("es-CO")}`}
                    />
                    <Table.Column
                      title="Diferencia"
                      dataIndex="diferencia"
                      key="diferencia"
                      render={(diff: string) => (
                        <span
                          style={{
                            color: diff.startsWith("+") ? "#f44336" : "#4caf50",
                            fontWeight: 600
                          }}
                        >
                          {diff}
                        </span>
                      )}
                    />
                  </Table>

                  {/* Fila de promedio */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: 8,
                      fontWeight: 600
                    }}
                  >
                    <div style={{ marginRight: 24 }}>Promedio:</div>
                    <div style={{ marginRight: 24 }}>
                      $ {promedioTarifa.toLocaleString("es-CO")}
                    </div>
                    <div
                      style={{ color: diferenciaPromedio.startsWith("+") ? "#f44336" : "#4caf50" }}
                    >
                      {diferenciaPromedio}
                    </div>
                  </div>
                </div>
              </Panel>
            </Collapse>
          </div>
          {/* ===== APROBADORES PENDIENTES ===== */}
          <div style={{ padding: "16px 0", borderTop: "1px solid #f0f0f0" }}>
            <Collapse accordion defaultActiveKey={["1"]} expandIconPosition="end" bordered={false}>
              <Panel header="Aprobadores pendientes" key="1">
                <Table
                  dataSource={pendingApprovers}
                  rowKey={(record) => record.name + record.role}
                  pagination={false}
                  bordered={false}
                  size="small"
                >
                  <Table.Column
                    title="Nombre"
                    dataIndex="name"
                    key="name"
                    render={(text) => <strong>{text}</strong>}
                  />
                  <Table.Column title="Rol" dataIndex="role" key="role" />
                  <Table.Column
                    title="Estado"
                    dataIndex="status"
                    key="status"
                    render={(status: string) => {
                      let color = "#999";
                      let text = "Pendiente";
                      if (status === "approved") {
                        color = "#4caf50";
                        text = "Aprobado";
                      } else if (status === "rejected") {
                        color = "#f44336";
                        text = "Rechazado";
                      }
                      return (
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color }}>
                          {status === "approved" && <CheckCircle />}
                          {status === "rejected" && <XCircle />}
                          {status === "pending" && <Clock />}
                          {text}
                        </span>
                      );
                    }}
                  />
                </Table>
              </Panel>
            </Collapse>
          </div>
        </Card>

        {/* ===== MODALES ===== */}
        <Modal
          open={showApproveModal}
          title="Confirmar aprobación"
          onOk={confirmApprove}
          onCancel={() => setShowApproveModal(false)}
          okText="Aprobar"
        >
          <Text>¿Estás seguro de aprobar esta solicitud?</Text>
        </Modal>

        <Modal
          open={showRejectModal}
          title="Rechazar solicitud"
          onOk={confirmReject}
          onCancel={() => setShowRejectModal(false)}
          okText="Rechazar"
          okButtonProps={{ danger: true }}
        >
          <Text>Motivo:</Text>
          <Select
            style={{ width: "100%", marginBottom: 12 }}
            placeholder="Selecciona motivo"
            value={rejectReason}
            onChange={setRejectReason}
          >
            <Option value="incomplete">Información incompleta</Option>
            <Option value="budget">Fuera de presupuesto</Option>
          </Select>
          <Input.TextArea
            placeholder="Observaciones adicionales"
            rows={4}
            value={rejectObservation}
            onChange={(e) => setRejectObservation(e.target.value)}
          />
        </Modal>
      </Container>
    </div>
  );
};

export default TaskManagerDetailView;
