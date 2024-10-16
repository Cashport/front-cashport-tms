import { Tooltip, Typography } from "antd";
import styles from "./BillingStatus.module.scss"; // Importar los estilos si es un archivo SCSS separado
import { BillingStatusEnum } from "@/types/logistics/billing/billing";

const { Text } = Typography;

interface BillingStatusProps {
  status: BillingStatusEnum;
  tooltipText?: string;
}

const BillingStatus: React.FC<BillingStatusProps> = ({ status, tooltipText }) => {
  const getBgColor = (state: BillingStatusEnum) => {
    switch (state) {
      case BillingStatusEnum.Preautorizado:
        return "#CBE71E";
      case BillingStatusEnum.Facturado:
        return "#FF6B00";
      case BillingStatusEnum.Aceptadas:
        return "#0085FF";
      case BillingStatusEnum.PorAceptar:
        return "#969696";
      default:
        return "#969696";
    }
  };

  const getColor = (state: BillingStatusEnum) => {
    switch (state) {
      case BillingStatusEnum.Preautorizado:
        return "#141414";
      case BillingStatusEnum.Facturado:
        return "#141414";
      case BillingStatusEnum.Aceptadas:
        return "#FFFFFF";
      case BillingStatusEnum.PorAceptar:
        return "#FFFFFF";
      default:
        return "#FFFFFF";
    }
  };
  const showTooltip = status === BillingStatusEnum.RechazadoProveedor;

  const content = (
    <div className={styles.stateContainer}>
      <div style={{ backgroundColor: getBgColor(status) }} className={styles.stateContent}>
        <Text style={{ color: getColor(status) }} className={styles.text}>
          {status}
        </Text>
      </div>
    </div>
  );
  return showTooltip ? (
    <Tooltip title={`Observación: ${tooltipText ?? ""}`}>{content}</Tooltip>
  ) : (
    content
  );
};

export default BillingStatus;
