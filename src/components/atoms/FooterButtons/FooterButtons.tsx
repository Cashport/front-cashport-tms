import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import { Col, Row } from "antd";

const FooterButtons = ({
  titleConfirm,
  titleCancel,
  isConfirmDisabled = false,
  onCancel,
  handleOk,
  showLeftButton = true,
  isConfirmLoading = false
}: {
  titleConfirm?: string;
  titleCancel?: string;
  isConfirmDisabled?: boolean;
  onCancel?: () => void;
  handleOk: () => void;
  showLeftButton?: boolean;
  isConfirmLoading?: boolean;
}) => {
  if (!showLeftButton)
    return (
      <Row style={{ width: "100%" }}>
        <Col span={24} style={{ minHeight: 48 }}>
          <PrincipalButton fullWidth onClick={handleOk} disabled={isConfirmDisabled}>
            {titleConfirm ?? "Confirmar"}
          </PrincipalButton>
        </Col>
      </Row>
    );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
        height: "48px"
      }}
    >
      <SecondaryButton fullWidth onClick={onCancel} disabled={isConfirmLoading}>
        {titleCancel ?? "Cancelar"}
      </SecondaryButton>

      <PrincipalButton
        fullWidth
        onClick={handleOk}
        disabled={isConfirmDisabled || isConfirmLoading}
        loading={isConfirmLoading}
      >
        {titleConfirm ?? "Confirmar"}
      </PrincipalButton>
    </div>
  );
};

export default FooterButtons;
