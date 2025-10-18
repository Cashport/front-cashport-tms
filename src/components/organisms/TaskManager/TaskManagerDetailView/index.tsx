"use client";

import { useState, useEffect } from "react";
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
  message
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  PaperClipOutlined,
  DownloadOutlined,
  EditOutlined,
  MoreOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Container from "@/components/atoms/Container/Container";
import { CheckCircle, XCircle, Clock } from "phosphor-react";
import { getTaskDetail, updatePricingApprovalStatus } from "@/services/tasks/tasks";
import {
  ITaskDetail,
  ITaskPricing,
  ITaskPricingComparation,
  ITaskApprover
} from "@/types/tasks/ITasks";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

interface TaskManagerDetailViewProps {
  moduleTitle: string;
  approvalId: number;
  onBack?: () => void;
}

const TaskManagerDetailView = ({ moduleTitle, approvalId, onBack }: TaskManagerDetailViewProps) => {
  const [taskDetail, setTaskDetail] = useState<ITaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectObservation, setRejectObservation] = useState("");

  useEffect(() => {
    const fetchTaskDetail = async () => {
      setLoading(true);
      try {
        const response = await getTaskDetail(approvalId);
        if (response?.success && response.data) {
          setTaskDetail(response.data);
        } else {
          console.error("No se encontró detalle de la aprobación");
        }
      } catch (error) {
        console.error("Error cargando detalle de la tarea:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTaskDetail();
  }, [approvalId]);

  const handleApprove = () => setShowApproveModal(true);
  const handleReject = () => setShowRejectModal(true);
  const confirmApprove = async () => {
    try {
      setShowApproveModal(false);
      const response = await updatePricingApprovalStatus(approvalId, "APPROVED");
      if (response.success) {
        message.success(response.message);
        const detail = await getTaskDetail(approvalId);
        if (detail.success && detail.data) setTaskDetail(detail.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Error al aprobar la solicitud");
      console.error(error);
    }
  };

  const confirmReject = async () => {
    if (!rejectReason) {
      message.warning("Selecciona un motivo de rechazo");
      return;
    }

    try {
      setShowRejectModal(false);
      const response = await updatePricingApprovalStatus(approvalId, "REJECTED");
      if (response.success) {
        message.success(response.message);
        const detail = await getTaskDetail(approvalId);
        if (detail.success && detail.data) setTaskDetail(detail.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Error al rechazar la solicitud");
      console.error(error);
    }
  };

  const handleDownloadEmail = () => {
    console.log("Downloading sustainability department email confirmation");
    const link = document.createElement("a");
    link.href = taskDetail?.approval.evidence_file_url || "#";
    link.download = taskDetail?.approval.evidence_file_name || "confirmacion.pdf";
    link.click();
  };

  if (loading) return <div>Cargando detalle de la aprobación...</div>;
  if (!taskDetail) return <div>No se encontró la aprobación.</div>;

  const { approval, pricing, users_approval } = taskDetail;

  const renderStatusTag = (status: string) => {
    if (status === "approved") return <Tag color="green">Aprobado</Tag>;
    if (status === "rejected") return <Tag color="red">Rechazado</Tag>;
    return <Tag color="default">Pendiente</Tag>;
  };

  return (
    <div style={{ overflowY: "auto" }}>
      <Container>
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: 24, borderBottom: "1px solid #f0f0f0", paddingBottom: 12 }}
        >
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
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
            <Button type="primary" icon={<CheckOutlined />} onClick={handleApprove}>
              Aprobar
            </Button>
            <Button danger icon={<CloseOutlined />} onClick={handleReject}>
              Rechazar
            </Button>
          </Space>
        </Flex>

        {/* ===== INFORMACIÓN DE APROBACIÓN ===== */}
        <Card style={{ marginBottom: 24, padding: 0 }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <Title level={4}>Información de aprobación</Title>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text type="secondary">Solicitud de aprobación para</Text>
                <div>{approval.approval_type_name}</div>
              </Col>

              <Col xs={24} md={12}>
                <Text type="secondary">TR o Proyecto asociado a esta solicitud</Text>
                <div style={{ color: "#1677ff", fontWeight: 600, cursor: "pointer" }}>
                  {approval.id_transfer_request ? `TR-${approval.id_transfer_request}` : "-"}
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              <Col xs={24} md={12}>
                <Text type="secondary">
                  Valido previamente con el coordinador de la zona que no haya un contrato activo
                  para este scope?
                </Text>
                <div
                  style={{
                    color: approval.is_another_contract_active ? "green" : "red",
                    fontWeight: 600
                  }}
                >
                  {approval.is_another_contract_active ? "Sí" : "No"}
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              <Col xs={24} md={12}>
                <Text type="secondary">
                  ¿Este proveedor es recomendado por el departamento de sostenibilidad?
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      color: approval.is_provider_recommended_by_sustainability ? "green" : "red",
                      fontWeight: 600
                    }}
                  >
                    {approval.is_provider_recommended_by_sustainability ? "Sí" : "No"}
                  </div>
                  {approval.evidence_file_url && (
                    <Button
                      type="link"
                      icon={<PaperClipOutlined />}
                      onClick={handleDownloadEmail}
                      style={{ padding: 0 }}
                    >
                      Descargar evidencia <DownloadOutlined />
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          </div>

          {/* ===== INFORMACIÓN DEL VIAJE ===== */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
            <Collapse accordion defaultActiveKey={["1"]} expandIconPosition="end" bordered={false}>
              <Panel header="Información del viaje" key="1">
                <Row gutter={[24, 16]} align="middle">
                  <Col xs={24} md={12}>
                    <Text type="secondary">Origen</Text>
                    <div style={{ fontWeight: 600 }}>{approval.origin}</div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Text type="secondary">Destino</Text>
                    <div style={{ fontWeight: 600 }}>{approval.destination}</div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Text type="secondary">Tipo de servicio</Text>
                    <div style={{ fontWeight: 600 }}>
                      {pricing.length > 0 && pricing[0].rate_description
                        ? pricing[0].rate_description
                        : ""}
                    </div>
                  </Col>

                  <Col
                    xs={24}
                    md={12}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <Text type="secondary">VP</Text>
                      <div style={{ fontWeight: 600 }}>{approval.vp}</div>
                    </div>
                    {approval.id_transfer_request && (
                      <div>
                        <a
                          style={{ fontWeight: 600 }}
                          onClick={() =>
                            router.push(
                              `/logistics/transfer-orders/details/${approval.id_transfer_request}`
                            )
                          }
                        >
                          Ver detalle de TR →
                        </a>
                      </div>
                    )}
                  </Col>
                </Row>
              </Panel>
            </Collapse>
          </div>

          {/* ===== TARIFAS ===== */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
            <Title level={4}>Tarifas</Title>
            <Table
              dataSource={pricing}
              rowKey={(record) => record.id_approval_item.toString()}
              pagination={false}
              bordered
              summary={(pageData) => {
                let totalSum = 0;
                pageData.forEach(({ total }) => {
                  totalSum += total;
                });
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={8}>
                      <div style={{ textAlign: "right", fontWeight: "bold" }}>Total</div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={9}>
                      <div style={{ fontWeight: "bold" }}>
                        {totalSum.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
                      </div>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            >
              <Table.Column title="Proveedor" dataIndex="provider" key="provider" />
              <Table.Column title="Vendor" dataIndex="vendor" key="vendor" />
              <Table.Column title="Contrato" dataIndex="contract" key="contract" />
              <Table.Column title="Tipo Vehículo" dataIndex="vehicle_type" key="vehicle_type" />
              <Table.Column
                title="Descripción tarifa"
                dataIndex="rate_description"
                key="rate_description"
                render={(value: string | null) => value || "-"}
              />
              <Table.Column
                title="Cotización"
                key="quotation"
                render={() => (
                  <Button type="link" disabled>
                    PDF
                  </Button>
                )}
              />
              <Table.Column
                title="Tarifa"
                dataIndex="rate"
                key="rate"
                render={(value: number) =>
                  value.toLocaleString("es-CO", { style: "currency", currency: "COP" })
                }
              />
              <Table.Column
                title="Cantidad de usos"
                dataIndex="usage_quantity"
                key="usage_quantity"
              />
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
          <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
            <Title level={4}>Análisis comparativo</Title>
            {pricing.map((p: ITaskPricing) => {
              if (!p.comparations || p.comparations.length === 0) return null;

              // Base + comparaciones
              const tableData: (ITaskPricing | ITaskPricingComparation)[] = [p, ...p.comparations];

              return (
                <Table
                  key={p.id_approval_item}
                  dataSource={tableData}
                  rowKey={(record, index) => `${record.id_carrier_request}-${index}`}
                  pagination={false}
                  bordered
                  size="small"
                  style={{ marginBottom: 24 }}
                >
                  <Table.Column
                    title="Proveedor"
                    dataIndex="provider"
                    key="provider"
                    render={(text) => <strong>{text}</strong>}
                  />
                  <Table.Column title="Contrato" dataIndex="contract" key="contract" />
                  <Table.Column title="Tipo Vehículo" dataIndex="vehicle_type" key="vehicle_type" />
                  <Table.Column
                    title="Tarifa"
                    dataIndex="rate"
                    key="rate"
                    render={(value: number) =>
                      value.toLocaleString("es-CO", { style: "currency", currency: "COP" })
                    }
                  />
                  <Table.Column
                    title="Cantidad de usos"
                    dataIndex="usage_quantity"
                    key="usage_quantity"
                  />
                  <Table.Column
                    title="Total"
                    dataIndex="total"
                    key="total"
                    render={(value: number) =>
                      value.toLocaleString("es-CO", { style: "currency", currency: "COP" })
                    }
                  />
                  <Table.Column
                    title="Diferencia"
                    key="diferencia"
                    render={(_, record: ITaskPricing | ITaskPricingComparation, index) => {
                      if (index === 0) return "-";
                      const rate = "rate" in record ? record.rate : 0;
                      const baseRate = p.rate;
                      const diff = ((rate - baseRate) / baseRate) * 100;
                      return `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}%`;
                    }}
                  />
                </Table>
              );
            })}
          </div>

          {/* ===== APROBADORES PENDIENTES ===== */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
            <Collapse accordion defaultActiveKey={["1"]} expandIconPosition="end" bordered={false}>
              <Panel header="Aprobadores pendientes" key="1">
                <Table
                  dataSource={users_approval}
                  rowKey={(record) => record.id_user.toString()}
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
                  <Table.Column title="Email" dataIndex="email" key="email" />
                  <Table.Column
                    title="Estado"
                    dataIndex="status"
                    key="status"
                    render={(status: string) => {
                      let color = "#999";
                      let text = "Pendiente";
                      if (status === "Aprobado") {
                        color = "#4caf50";
                        text = "Aprobado";
                      } else if (status === "Rechazado") {
                        color = "#f44336";
                        text = "Rechazado";
                      }
                      return (
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color }}>
                          {status === "Aprobado" && <CheckCircle />}
                          {status === "Rechazado" && <XCircle />}
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
