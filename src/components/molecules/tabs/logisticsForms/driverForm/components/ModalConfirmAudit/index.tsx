import FooterButtons from "@/components/molecules/modals/ModalBillingAction/FooterButtons/FooterButtons";
import { Modal, Flex, Typography, Tag } from "antd";

const { Text } = Typography;

interface ModalConfirmAuditProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string[];
  tags?: { label: string }[];
}

const ModalConfirmAudit: React.FC<ModalConfirmAuditProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  tags = []
}) => {
  return (
    <Modal
      width={686}
      open={isOpen}
      onCancel={onClose}
      title={<Text style={{ fontWeight: 600, fontSize: 20 }}>{title}</Text>}
      centered
      footer={
        <FooterButtons titleConfirm="Confirmar auditoría" onClose={onClose} handleOk={onConfirm} />
      }
    >
      <Flex vertical gap="1.5rem" align="center" style={{ marginBottom: "2rem" }}>
        <Flex vertical gap={8} align="center">
          {description.map((text, index) => (
            <Text key={index} style={{ fontWeight: 300, fontSize: 16 }}>
              {text}
            </Text>
          ))}
        </Flex>

        {tags.length > 0 && (
          <Flex gap={4}>
            {tags.map((req, index) => (
              <Tag
                key={index}
                color="#3D3D3D"
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  marginRight: 0,
                  fontSize: "14px",
                  fontWeight: "400"
                }}
              >
                {req.label}
              </Tag>
            ))}
          </Flex>
        )}
      </Flex>
    </Modal>
  );
};

export default ModalConfirmAudit;
