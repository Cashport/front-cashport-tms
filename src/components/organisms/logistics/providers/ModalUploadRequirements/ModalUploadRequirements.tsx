"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, DatePicker, Flex, message, Modal, Select, Spin, Table, UploadProps } from "antd";
import { File, Trash, Upload, X } from "phosphor-react";
import Dragger from "antd/es/upload/Dragger";
import dayjs from "dayjs";

import useScreenHeight from "@/components/hooks/useScreenHeight";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import IconButton from "@/components/atoms/IconButton/IconButton";

import "./modalUploadRequirements.scss";

export interface IUploadRequirementstTableRow {
  fileName: string;
  file?: File;
  requirementType?: string;
  state?: string;
  expirationDate?: string;
}

interface IAuditFormValues {
  rows: IUploadRequirementstTableRow[];
}

type IAvailableViews = "UPLOAD" | "TABLE";

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
}

const ModalUploadRequirements = ({ isOpen, onClose }: Props) => {
  const [selectedView, setSelectedView] = useState<IAvailableViews>("UPLOAD");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const height = useScreenHeight();

  const { control, handleSubmit, reset, watch, setValue } = useForm<IAuditFormValues>({
    defaultValues: { rows: [] }
  });

  const auditValues = watch("rows");

  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen]);

  const onSubmit = async (data: IAuditFormValues) => {
    console.log("data", data);
  };

  const props: UploadProps = {
    className: "modalUploadRequirements__dragger",
    name: "file",
    multiple: true,
    // before upload to check is under 5MB
    beforeUpload: (file) => {
      const isUnder5MB = file.size / 1024 / 1024 < 1;
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
            ...auditValues,
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
            <span>{name}</span>
            <p>{(size ?? 0 / 1024 / 1024).toFixed(2)}MB</p>
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
        auditValues.filter((row) => row.fileName !== file.name)
      );
    }
  };

  const renderView = () => {
    switch (selectedView) {
      case "UPLOAD":
        return (
          <>
            <p className="modalUploadRequirements__description">Sube tus documentos aquí</p>

            <Dragger {...props}>
              <Upload size={30} className="draggerIcon" />
              <p className="draggerText">
                Arrastra y suelta tu archivo aquí o haz clic para subirlo.
              </p>
              <p className="draggerText -small">Tamaño máximo 5MB</p>
            </Dragger>

            <div className="modalUploadRequirements__footer">
              <FooterButtons
                titleCancel="Volver"
                onCancel={() => onClose(true)}
                handleOk={() => {
                  setSelectedView("TABLE");
                }}
                titleConfirm="Aceptar"
              />
            </div>
          </>
        );
      case "TABLE":
        return (
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Table
                columns={[
                  {
                    title: "Nombre del documento",
                    dataIndex: "fileName",
                    render: (_: any, __: any, index: number) => (
                      <span>{auditValues[index]?.fileName}</span>
                    )
                  },
                  {
                    title: "Estado",
                    dataIndex: "state",
                    render: (_: any, __: any, index: number) => (
                      <Controller
                        control={control}
                        name={`rows.${index}.state`}
                        render={({ field }) => (
                          <Select
                            {...field}
                            placeholder="Acción"
                            options={[
                              { value: "Aprobar", label: "Aprobar" },
                              { value: "Rechazar", label: "Rechazar" }
                            ]}
                          />
                        )}
                      />
                    )
                  },
                  {
                    title: "Tipo de requerimiento",
                    dataIndex: "requirementType",
                    render: (_: any, __: any, index: number) => (
                      <Controller
                        control={control}
                        name={`rows.${index}.requirementType`}
                        render={({ field }) => (
                          <Select
                            {...field}
                            placeholder="Tipo de requerimiento"
                            options={[
                              { value: "GPS", label: "GPS" },
                              { value: "Licencia", label: "Licencia" }
                            ]}
                          />
                        )}
                      />
                    )
                  },
                  {
                    title: "Fecha de vencimiento",
                    dataIndex: "expirationDate",
                    render: (_: any, __: any, index: number) => (
                      <Controller
                        control={control}
                        name={`rows.${index}.expirationDate`}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            placeholder="Fecha de vencimiento"
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(date) => field.onChange(date?.toISOString())}
                          />
                        )}
                      />
                    )
                  },
                  {
                    title: "",
                    dataIndex: "actions",
                    render: (_: any, __: any, index: number) => (
                      <Flex>
                        <IconButton
                          icon={<Upload size={12} className="icon" />}
                          // className="iconDocument"
                        />
                        <IconButton
                          icon={<Trash size={12} className="icon" />}
                          // className="iconDocument"
                          onClick={() => {
                            const updated = [...auditValues];
                            updated[index].fileName = uploadedFiles[index]?.name || "";
                            setValue("rows", updated);
                          }}
                        />
                      </Flex>
                    )
                  }
                ]}
                dataSource={auditValues.map((row, idx) => ({ ...row, key: idx }))}
                pagination={false}
                // scroll={{ y: height - 400 }}
              />

              <div className="modalUploadRequirements__footer">
                <FooterButtons
                  titleCancel="Volver"
                  onCancel={() => {
                    setSelectedView("UPLOAD");
                    setUploadedFiles([]);
                    setValue("rows", []);
                  }}
                  handleOk={handleSubmit(onSubmit)}
                  titleConfirm="Guardar"
                />
              </div>
            </form>
          </>
        );
    }
  };

  return (
    <Modal
      className="modalUploadRequirements"
      width="790px"
      footer={null}
      open={isOpen}
      onCancel={() => onClose()}
      destroyOnClose
    >
      <h2 className="modalUploadRequirements__title">Subir requerimientos</h2>
      {renderView()}
    </Modal>
  );
};

export default ModalUploadRequirements;
