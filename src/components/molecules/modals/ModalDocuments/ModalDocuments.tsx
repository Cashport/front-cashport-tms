import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import {
  FileObject,
  UploadDocumentButton
} from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";
import { CertificateType, DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import { Col, DatePicker, Flex, Modal, Row, Select, Spin, Switch, Typography } from "antd";
import { X } from "phosphor-react";

const { Title } = Typography;

type PropsModalDocuments = {
  mockFiles: DocumentCompleteType[];
  setFiles: React.Dispatch<React.SetStateAction<any[] | FileObject[]>>;
  documentsType?: CertificateType[];
  isLoadingDocuments: boolean;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleChange: (value: string[]) => void;
  // eslint-disable-next-line no-unused-vars
  handleChangeExpirationDate: (index: number, value: any) => void;
  showExpiry?: boolean;
  allOptional?: boolean;
  setSelectedFiles?: React.Dispatch<React.SetStateAction<DocumentCompleteType[]>>;
};

const calculateExpirate = (expiry?: boolean) => {
  if (expiry) {
    return true;
  }
  if (expiry) {
    return false;
  }
  return false;
};

export default function ModalDocuments(props: PropsModalDocuments) {
  const {
    mockFiles,
    setSelectedFiles,
    setFiles,
    documentsType,
    isLoadingDocuments,
    isOpen,
    onClose,
    handleChange,
    handleChangeExpirationDate,
    showExpiry = true,
    allOptional = false
  } = props;

  return (
    <Modal
      title="Cargar documentos adicionales"
      styles={{ body: { maxHeight: "30rem", overflowY: "auto", paddingRight: "0.5rem" } }}
      centered
      open={isOpen}
      onOk={onClose}
      onClose={() => onClose()}
      closeIcon={<X onClick={onClose} />}
      footer={
        <Flex justify="flex-end">
          <PrincipalButton onClick={onClose}>Cerrar</PrincipalButton>
        </Flex>
      }
    >
      <Flex style={{ width: "100%" }} justify="space-between">
        <Row style={{ width: "100%" }} justify="space-between">
          <Col span={24}>
            <Row style={{ width: "100%", marginBottom: "1rem" }}>
              {mockFiles.map((file, index) => {
                return (
                  <Col key={file.id} style={{ width: "100%", margin: "1rem 0" }}>
                    {file.link ? (
                      <UploadDocumentButton
                        key={file.id}
                        title={file.description}
                        isMandatory={!file.optional}
                        aditionalData={file.id}
                        setFiles={() => {}}
                        files={file.file}
                        disabled
                      >
                        <UploadDocumentChild
                          linkFile={file.link}
                          nameFile={file.link.split("-").pop() ?? ""}
                          showTrash={true}
                          onDelete={() => {
                            setSelectedFiles &&
                              setSelectedFiles((currentFiles) => {
                                return currentFiles.map((cf) =>
                                  cf.id === file.id ? { ...cf, link: undefined } : cf
                                );
                              });
                          }}
                        />
                      </UploadDocumentButton>
                    ) : (
                      <UploadDocumentButton
                        key={file.id}
                        title={file.description}
                        isMandatory={!file.optional}
                        aditionalData={file.id}
                        setFiles={setFiles}
                      />
                    )}
                    {showExpiry && (
                      <Row justify="end" align="middle" style={{ gap: "10px" }}>
                        <p style={{ fontSize: "12px" }}>
                          Fecha de <br />
                          vencimiento
                        </p>
                        <DatePicker
                          size="small"
                          placeholder="dd/mm/aaaa"
                          value={file.expirationDate}
                          disabled={!calculateExpirate(file.expiry)}
                          onChange={(value: any) => handleChangeExpirationDate(index, value)}
                        />
                        <Switch size="default" checked={calculateExpirate(file.expiry)} disabled />
                        {calculateExpirate(file.expiry) ? "aplica" : "no aplica"}
                      </Row>
                    )}
                  </Col>
                );
              })}
            </Row>
          </Col>
          <Col span={24}>
            <Title className="title" level={5}>
              Seleccione los documentos adicionales
            </Title>
            {documentsType && Array.isArray(documentsType) ? (
              <Select
                mode="multiple"
                allowClear={false}
                style={{ width: "100%" }}
                placeholder="Seleccione documentos"
                defaultValue={mockFiles?.map((document) => document.id.toString()) || []}
                loading={isLoadingDocuments}
                onChange={handleChange}
                options={documentsType?.map((document) => ({
                  label: <span>{document.description}</span>,
                  value: document.id.toString(),
                  disabled: allOptional ? false : mockFiles.some((file) => file.id === document.id) && !document.optional,
                }))}
              />
            ) : (
              <Spin spinning={true}>Loading documents...</Spin>
            )}
          </Col>
        </Row>
      </Flex>
    </Modal>
  );
}
