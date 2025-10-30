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
import { STATUS } from "@/utils/constants/globalConstants";
import { ITaskDetail } from "@/types/tasks/ITasks";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import CarriersFeeTable from "@/components/molecules/tables/CarriersFeeTable";
import type { ForecastItem } from "@/types/logistics/approval";

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
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});

  const toggleAnalysis = (id: string) => {
    setExpandedAnalysis((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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

  // Transform pricing data to ForecastItem format for CarriersFeeTable
  const transformedPricing: ForecastItem[] = pricing.map((item) => ({
    id: item.id_approval_item.toString(),
    proveedor: item.provider,
    vendor: item.vendor.toString(),
    contrato: item.contract,
    tipoVehiculo: item.vehicle_type,
    descripcionTarifa: item.rate_description || "",
    tarifa: item.rate,
    cantidadUsos: item.usage_quantity,
    cotizacionUrl: item.url_evidence
  }));

  const renderStatusTag = (status: string) => {
    if (status === "approved") return <Tag color="green">Aprobado</Tag>;
    if (status === "rejected") return <Tag color="red">Rechazado</Tag>;
    return <Tag color="default">Pendiente</Tag>;
  };
  const isApprovedOrRejected =
    approval.status === STATUS.PRICING_APPROVAL.APROBADO ||
    approval.status === STATUS.PRICING_APPROVAL.RECHAZADO;

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
            {!isApprovedOrRejected && (
              <>
                <Button type="primary" onClick={handleApprove}>
                  Aprobar
                </Button>
                <Button danger onClick={handleReject}>
                  Rechazar
                </Button>
              </>
            )}
          </Space>
        </Flex>

        {/* ===== INFORMACIÓN DE APROBACIÓN ===== */}
        <div style={{ padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
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
                Valido previamente con el coordinador de la zona que no haya un contrato activo para
                este scope?
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
        <div style={{ padding: "16px 0", borderTop: "1px solid #f0f0f0" }}>
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
        <div style={{ padding: "16px 0", borderTop: "1px solid #f0f0f0" }}>
          <Title level={4}>Tarifas</Title>
          <CarriersFeeTable forecastItems={transformedPricing} tipoAprobacion="" noInput={true} />
        </div>
        {/* ===== ANÁLISIS COMPARATIVO ===== */}
        <div className="space-y-6 mb-6">
          <Title level={4}>Análisis Comparativo</Title>
          {pricing.map((item) => {
            const baseRate = item.rate;
            const comparations = item.comparations || [];

            return (
              <div
                key={item.id_approval_item}
                className="border border-gray-200 rounded-lg shadow-sm"
              >
                {/* Encabezado */}
                <div
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleAnalysis(item.id_approval_item.toString())}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{item.provider}</h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {item.rate.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP"
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.vehicle_type} • {item.rate_description || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Vendor: {item.vendor} • Contrato: {item.contract || "-"}
                    </div>
                  </div>
                  <div className="ml-4">
                    {expandedAnalysis[item.id_approval_item] ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Tabla de comparaciones */}
                {expandedAnalysis[item.id_approval_item] && (
                  <div className="p-4 bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Proveedor
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Tipo vehículo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Tipo tarifa
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Contrato
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Tarifa
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                              Diferencia
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {comparations.map((c) => {
                            const diff = ((c.rate - baseRate) / baseRate) * 100;
                            return (
                              <tr key={c.id_carrier_request} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{c.provider}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {c.vehicle_type}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {c.rate_description || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {c.contract || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {c.rate.toLocaleString("es-CO", {
                                    style: "currency",
                                    currency: "COP"
                                  })}
                                </td>
                                <td
                                  className={`px-4 py-3 text-sm font-medium ${
                                    diff > 0
                                      ? "text-red-600"
                                      : diff < 0
                                        ? "text-green-600"
                                        : "text-gray-900"
                                  }`}
                                >
                                  {diff > 0 ? "+" : ""}
                                  {diff.toFixed(2)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ===== APROBADORES PENDIENTES ===== */}
        <div style={{ padding: "16px 0", borderTop: "1px solid #f0f0f0" }}>
          <Title level={4}>Aprobadores pendientes</Title>

          <Table
            dataSource={users_approval}
            rowKey={(record) => record.id_user.toString()}
            pagination={false}
            bordered={false}
            size="small"
            style={{ marginTop: 16 }}
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
        </div>

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
