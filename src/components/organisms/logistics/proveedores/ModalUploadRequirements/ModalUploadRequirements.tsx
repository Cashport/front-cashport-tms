"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, DatePicker, Flex, message, Modal, Select, Spin, Table, UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { DownloadSimple, File, Sparkle, Trash, Upload, X } from "phosphor-react";
import dayjs from "dayjs";

import useScreenHeight from "@/components/hooks/useScreenHeight";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import IconButton from "@/components/atoms/IconButton/IconButton";
import BadgeDocumentStatus from "@/components/atoms/BadgeDocumentStatus/BadgeDocumentStatus";

import { IGetCertificate } from "@/types/logistics/certificate/certificate";
import { FILE_EXTENSIONS } from "@/utils/constants/globalConstants";

import "./modalUploadRequirements.scss";

export interface IUploadRequirementstTableRow {
  fileName: string;
  file?: File;
  requirementType?: number;
  requirementTypeName?: string;
  state?: string;
  expirationDate?: string;
}

interface IModalRequirementsTableForm {
  rows: IUploadRequirementstTableRow[];
}

type IAvailableViews = "UPLOAD" | "TABLE";

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  documentsTypesList: IGetCertificate[];
  // eslint-disable-next-line no-unused-vars
  onUpload?: (data: IModalRequirementsTableForm) => void;
}

const ModalUploadRequirements = ({ isOpen, onClose, documentsTypesList, onUpload }: Props) => {
  const [selectedView, setSelectedView] = useState<IAvailableViews>("UPLOAD");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const height = useScreenHeight();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isValid }
  } = useForm<IModalRequirementsTableForm>({
    defaultValues: { rows: [] },
    mode: "onChange"
  });

  const rowsPerFile = watch("rows");

  const closeModal = () => {
    onClose();
    setUploadedFiles([]);
    setValue("rows", []);
    setSelectedView("UPLOAD");
  };

  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen]);

  const onSubmit = async (data: IModalRequirementsTableForm) => {
    onUpload?.(data);
    closeModal();
  };

  const props: UploadProps = {
    className: "modalUploadRequirements__dragger",
    name: "file",
    multiple: true,
    // before upload to check is under 5MB
    beforeUpload: (file) => {
      const isUnder5MB = file.size / 1024 / 1024 < 5;
      if (!isUnder5MB) {
        message.error("El archivo debe ser menor a 5MB");
        return false;
      }
      return isUnder5MB;
    },
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        if (info.file.originFileObj) {
          const newFile = info.file.originFileObj as File;
          setUploadedFiles((prev) => [...prev, newFile]);
          setValue("rows", [
            ...rowsPerFile,
            {
              fileName: newFile.name,
              file: newFile,
              requirementType: undefined,
              state: undefined,
              expirationDate: undefined
            }
          ]);
        }
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    itemRender: (_, file, fileList, functions) => {
      const { remove } = functions;

      const { name, status, size } = file;
      return (
        <Flex className="draggerFileCard" align="center" justify="space-between">
          <Flex className="fileInfo" vertical align="flex-start">
            <File className="fileIcon" size={20} />
            <p>{name}</p>
            <p>
              {(() => {
                const fileSize = size ?? 0;
                const fileSizeMB = fileSize / (1024 * 1024);
                if (fileSizeMB < 1) {
                  return `${(fileSize / 1024).toFixed(2)} KB`;
                } else {
                  return `${fileSizeMB.toFixed(2)} MB`;
                }
              })()}
            </p>
          </Flex>
          {status === "done" && (
            <Button className="fileIcon" onClick={remove}>
              <Trash size={14} />
            </Button>
          )}
          {status === "uploading" && <Spin size="small" />}
          {!status && (
            <Button className="fileIcon -error" onClick={remove}>
              <X size={14} />
            </Button>
          )}
        </Flex>
      );
    },
    onRemove: (file) => {
      const updatedFiles = uploadedFiles.filter((uploadedFile) => uploadedFile.name !== file.name);
      setUploadedFiles(updatedFiles);
      setValue(
        "rows",
        rowsPerFile.filter((row) => row.fileName !== file.name)
      );
    },
    accept: FILE_EXTENSIONS.join(",")
  };

  const renderView = () => {
    switch (selectedView) {
      case "UPLOAD":
        return (
          <>
            <span className="modalUploadRequirements__title">
              Subir requerimientos con
              <span>
                <span
                  className="cashportIATextGradient"
                  style={{
                    fontWeight: 600
                  }}
                >
                  {" "}
                  CashportAI
                </span>
              </span>
            </span>
            <span className="modalUploadRequirements__description">
              Sube los documentos y
              <span>
                <span className="cashportIATextGradient"> CashportAI </span>
              </span>
              los clasificará y analizará según su tipo
            </span>

            <Dragger {...props}>
              <Upload size={30} className="draggerIcon" />
              <p className="draggerText">
                Arrastra y suelta tu archivo aquí o haz clic para subirlo
              </p>
              <p className="draggerText -small">Tamaño máximo 5MB</p>
            </Dragger>

            <div className="modalUploadRequirements__footer">
              <Button className="cancelButton" onClick={() => onClose(true)}>
                Cancelar
              </Button>
              <Button
                className="iaButton"
                disabled={uploadedFiles.length === 0}
                onClick={() => {
                  setSelectedView("TABLE");
                }}
              >
                <Sparkle size={14} color="#5b21b6" weight="fill" />
                <span className="textNormal">
                  Analizar con{" "}
                  <span
                    className="cashportIATextGradient"
                    style={{
                      fontWeight: 500
                    }}
                  >
                    CashportAI
                  </span>
                </span>
              </Button>
            </div>
          </>
        );
      case "TABLE":
        return (
          <>
            <span className="modalUploadRequirements__title">
              Resultados subida masiva de requerimientos con
              <span>
                <span
                  className="cashportIATextGradient"
                  style={{
                    fontWeight: 600
                  }}
                >
                  {" "}
                  CashportAI
                </span>
              </span>
            </span>
            <span className="modalUploadRequirements__description">
              Se detectaron los siguientes requerimientos
            </span>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Table
                className="modalUploadRequirements__table"
                columns={[
                  {
                    title: "Nombre del documento",
                    dataIndex: "fileName",
                    render: (_: any, __: any, index: number) => (
                      <span>{rowsPerFile[index]?.fileName}</span>
                    )
                  },
                  {
                    title: "Estado",
                    dataIndex: "statusId",
                    key: "statusId",
                    render: () => {
                      return (
                        // Pending status  hardcoded
                        <BadgeDocumentStatus statusId={"c02b3475-f59a-4222-bb28-9dbb51cf02c1"} />
                      );
                    },
                    width: 150
                  },
                  {
                    title: "Fecha de vencimiento",
                    dataIndex: "expirationDate",
                    render: (_: any, __: any, index: number) => {
                      const currentRequirementId = rowsPerFile[index]?.requirementType;

                      const requirementTypeMeta = documentsTypesList.find(
                        (item) => item.id === currentRequirementId
                      );

                      const isMandatory = requirementTypeMeta?.validity?.expiry === true;

                      return (
                        <Controller
                          control={control}
                          name={`rows.${index}.expirationDate`}
                          rules={{
                            required: isMandatory || undefined
                          }}
                          render={({ field }) => (
                            <DatePicker
                              {...field}
                              disabled={!isMandatory}
                              style={{ height: "40px" }}
                              placeholder={!isMandatory ? "No requerido" : "Inserte fecha"}
                              value={field.value ? dayjs(field.value) : null}
                              onChange={(date) => field.onChange(date?.toISOString())}
                            />
                          )}
                        />
                      );
                    },
                    width: 190
                  },

                  {
                    title: "Tipo de requerimiento",
                    dataIndex: "requirementType",
                    render: (_: any, __: any, index: number) => (
                      <Controller
                        control={control}
                        name={`rows.${index}.requirementType`}
                        rules={{
                          required: true
                        }}
                        render={({ field }) => (
                          <Select
                            style={{ height: "40px", width: 230 }}
                            {...field}
                            placeholder="Tipo de requerimiento"
                            options={documentsTypesList.map((item) => ({
                              label: item.name,
                              value: item.id,
                              isExpirationDateMandatory: item.validity.expiry
                            }))}
                            showSearch
                            filterOption={(input, option) =>
                              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            onChange={(value) => {
                              field.onChange(value); // actualiza requirementType

                              const selected = documentsTypesList.find((item) => item.id === value);
                              const isOptional = selected?.validity?.expiry === true;

                              // Actualiza el nombre del tipo
                              setValue(`rows.${index}.requirementTypeName`, selected?.name || "");

                              // Si el requerimiento es opcional, seteamos expirationDate a undefined
                              if (isOptional) {
                                setValue(`rows.${index}.expirationDate`, undefined);
                              }
                            }}
                            popupMatchSelectWidth={false}
                            open={true}
                            dropdownRender={(menu) => {
                              return <div className="selectRequirementType__dropdown">{menu}</div>;
                            }}
                          />
                        )}
                      />
                    ),
                    width: 250
                  },
                  {
                    title: "",
                    dataIndex: "actions",
                    render: (_: any, __: any, index: number) => (
                      <Flex gap={8} align="center">
                        <IconButton icon={<DownloadSimple size={20} className="iconRow" />} />
                        <IconButton
                          icon={<Trash size={20} className="iconRow" />}
                          onClick={() => {
                            const updatedRows = rowsPerFile.filter((_, i) => i !== index);
                            const updatedFiles = uploadedFiles.filter((_, i) => i !== index);

                            setValue("rows", updatedRows);
                            setUploadedFiles(updatedFiles);
                          }}
                        />
                      </Flex>
                    ),
                    width: 90
                  }
                ]}
                pagination={false}
                dataSource={rowsPerFile.map((row, idx) => ({ ...row, key: idx }))}
                scroll={{ y: height - 400 }}
              />

              <FooterButtons
                stylesContainer={{ marginTop: "24px" }}
                titleCancel="Volver"
                onCancel={() => {
                  setSelectedView("UPLOAD");
                  setUploadedFiles([]);
                  setValue("rows", []);
                }}
                handleOk={handleSubmit(onSubmit)}
                isConfirmDisabled={!isValid}
                titleConfirm="Guardar"
              />
            </form>
          </>
        );
    }
  };

  return (
    <Modal
      className="modalUploadRequirements"
      width={selectedView === "UPLOAD" ? 686 : 1000}
      footer={null}
      open={isOpen}
      onCancel={closeModal}
      destroyOnClose
    >
      {renderView()}
    </Modal>
  );
};

export default ModalUploadRequirements;
