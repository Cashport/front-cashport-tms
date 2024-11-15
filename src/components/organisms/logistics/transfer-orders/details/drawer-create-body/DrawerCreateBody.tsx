import { Button, Input, Select, Typography, Upload } from "antd";
import { NumericFormat } from "react-number-format";
import styles from "./drawerCreateBody.module.scss";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import {
  CaretDoubleRight,
  ChartBar,
  ChartLineUp,
  Check,
  FileArrowDown,
  Files,
  Money,
  PlusCircle,
  User
} from "phosphor-react";
import { getNoveltyTypes, getOvercosts } from "@/services/logistics/novelty";
import { INovelty, INoveltyType } from "@/types/novelty/INovelty";
import { IForm } from "../Details";
import { UploadFile } from "antd/lib";
import { UploadChangeParam } from "antd/es/upload";
import useSWR from "swr";

const Text = Typography;

interface IDrawerBodyProps {
  onClose: () => void;
  handleCreateNovelty: () => void;
  novelty: INovelty | null;
  form: IForm;
  setForm: Dispatch<SetStateAction<IForm>>;
  formEvidences: File[];
  setFormEvidences: Dispatch<SetStateAction<File[]>>;
  tripData: { idCarrier: number; idVehicleType: number };
}

export const DrawerCreateBody: FC<IDrawerBodyProps> = ({
  onClose,
  handleCreateNovelty,
  form,
  setForm,
  novelty,
  formEvidences,
  setFormEvidences,
  tripData
}) => {
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [novelties, setNovelties] = useState<INoveltyType[]>([]);
  const { data: overcosts, isLoading: isLoadingOvercosts } = useSWR(
    {
      key: "overcosts",
      idCarrier: tripData.idCarrier,
      idVehicleType: tripData.idVehicleType
    },
    ({ idCarrier, idVehicleType }) => getOvercosts(idVehicleType, idCarrier),
    {
      keepPreviousData: false,
      refreshInterval: 1000 * 60 * 60 * 24
    }
  );

  const findNoveltyTypes = async () => {
    const data = await getNoveltyTypes();
    if (data.length > 0) {
      setNovelties(data);
    }
  };

  useEffect(() => {
    findNoveltyTypes();
  }, []);

  useEffect(() => {
    if (novelty && novelty.id) {
      const getNovelty = novelties.find((f) => f.name === novelty.novelty_type);
      setForm({
        noeltyTypeId: getNovelty?.id || null,
        quantity: novelty.quantity,
        observation: novelty.observation,
        value: novelty.value,
        overcostId: novelty.overcost_id
      });
    }
  }, [novelties]);

  useEffect(() => {
    if (form.noeltyTypeId && form.observation && form.value) {
      setIsDisabled(false);
      return;
    }
    setIsDisabled(true);
  }, [form]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      value: calculateOvercost(form.quantity, form.overcostId)
    }));
  }, [form.quantity, form.overcostId, overcosts]);

  const calculateOvercost = (quantity: number, overcostId?: number) => {
    if (!overcostId) return 0;
    const overcost = overcosts?.find((oc) => oc.id === overcostId);
    if (overcost) {
      return overcost.price * quantity;
    }
    return 0;
  };

  const updateFiles = (newFile: File) => {
    setFormEvidences((prevState: File[]) => {
      const existingFileIndex = prevState.findIndex((file) => file.name === newFile.name);

      if (existingFileIndex !== -1) {
        const updatedFiles = [...prevState];
        updatedFiles[existingFileIndex] = newFile;
        return updatedFiles;
      } else {
        return [...prevState, newFile];
      }
    });
  };

  const handleUploadFile = (info: UploadChangeParam<UploadFile<File>>) => {
    const { file: rawFile } = info;
    if (rawFile) {
      const fileSizeInMB = rawFile.size && rawFile.size / (1024 * 1024);

      if (fileSizeInMB && fileSizeInMB > 30) {
        alert("El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB.");
        return;
      }

      if (rawFile.originFileObj) {
        updateFiles(rawFile.originFileObj);
      } else {
        console.warn("El archivo no contiene un File válido:", rawFile);
      }
    }
  };

  return (
    <div className={styles.mainDrawerBody}>
      <div onClick={onClose} className={styles.closeContainer}>
        <CaretDoubleRight size={20} />
      </div>
      <div className={styles.titleSection}>
        <div className={styles.titleContainer}>
          <Text className={styles.title}>Novedad</Text>
        </div>
        <div className={styles.btnContainer}>
          <Button
            onClick={handleCreateNovelty}
            type="text"
            className={`${styles.approbeBtn} ${isDisabled && styles.disabled}`}
            disabled={isDisabled}
          >
            <Check color="#141414" size={12} />
            <Text className={styles.approbeLabel}>
              {novelty && novelty.id ? "Actualizar novedad" : "Crear novedad"}
            </Text>
          </Button>
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.formContainer}>
        <div className={styles.leftSection}>
          <div>
            <div className={styles.formTitleContainer}>
              <ChartBar color="#666666" size={20} />
              <Text className={styles.formTitle}>Tipo de novedad</Text>
            </div>
            <Select
              className={styles.select}
              value={form.noeltyTypeId || undefined}
              onChange={(val) => setForm({ ...form, noeltyTypeId: val })}
              placeholder="Seleccionar novedad"
              options={novelties.map((novelty) => ({
                id: novelty.id,
                value: novelty.id,
                label: novelty.name
              }))}
            />
          </div>
          <div>
            <div className={styles.formTitleContainer}>
              <ChartBar color="#666666" size={20} />
              <Text className={styles.formTitle}>Tipo de sobrecosto</Text>
            </div>
            <Select
              className={styles.select}
              value={form.overcostId}
              onChange={(val) => setForm({ ...form, overcostId: val })}
              showSearch
              optionFilterProp="label"
              placeholder="seleccionar sobrecosto"
              popupMatchSelectWidth={false}
              loading={isLoadingOvercosts}
              options={overcosts?.map((oc) => ({
                id: oc.id,
                value: oc.id,
                label: oc.description
              }))}
            />
          </div>
        </div>
        <div className={styles.rightSection}>
          <div>
            <div className={styles.formTitleContainer}>
              <ChartLineUp color="#666666" size={20} />
              <Text className={styles.formTitle}>Cantidad</Text>
            </div>
            <NumericFormat
              className={styles.select}
              value={form.quantity}
              customInput={Input}
              thousandSeparator={"."}
              decimalSeparator=","
              decimalScale={1}
              onValueChange={(values) => setForm({ ...form, quantity: values.floatValue || 0 })}
              placeholder="Escribe la cantidad"
            />
          </div>
          <div>
            <div className={styles.formTitleContainer}>
              <Money color="#666666" size={20} />
              <Text className={styles.formTitle}>Sobrecosto</Text>
            </div>
            <NumericFormat
              className={styles.select}
              value={form.value}
              customInput={Input}
              thousandSeparator={"."}
              decimalSeparator=","
              decimalScale={0}
              prefix="$"
              suffix=""
              disabled
            />
          </div>
        </div>
      </div>
      <div style={{ marginTop: "24px" }}>
        <div className={styles.formTitleContainer}>
          <User color="#666666" size={20} />
          <Text className={styles.formTitle}>Observaciones</Text>
        </div>
        <Input
          value={form.observation}
          className={styles.input}
          onChange={(e) => setForm({ ...form, observation: e.target.value })}
          placeholder="Escribir observaciones"
        />
      </div>
      <div className={styles.divider} />
      <div className={styles.evidenceContainer}>
        <div className={styles.evidenceTitleContainer}>
          <Files size={20} color="#666666" />
          <Text className={styles.evidenceTitle}>Evidencia</Text>
        </div>
        <div className={styles.evidences}>
          {novelty?.evidences.map((evidence) => {
            const imageExtensions = ["jpg", "jpeg", "png"];
            const extension = evidence.url.split(".").pop()?.toLowerCase();
            if (extension && imageExtensions.includes(extension)) {
              return (
                <div
                  key={evidence.id}
                  className={styles.evidence}
                >
                  <Text className={styles.evidenceTitle}>{evidence.name}</Text>
                  <FileArrowDown color="#141414" size={20} />
                </div>
              );
            }
            return (
              <a
                key={`evidence-${evidence.id}`}
                className={styles.evidence}
                download={evidence.url}
                href={evidence.url}
                target="_blank"
              >
                <Text className={styles.evidenceTitle}>{evidence.name}</Text>
                <FileArrowDown color="#141414" size={20} />
              </a>
            );
          })}
          {formEvidences.map((file, index) => (
            <div key={`evidence-${index}`} className={styles.evidence}>
              <Text className={styles.evidenceTitle}>{file.name}</Text>
              <FileArrowDown color="#141414" size={20} />
            </div>
          ))}
          <Upload
            accept=".pdf, .png, .doc, .docx"
            showUploadList={false}
            onChange={handleUploadFile}
          >
            <div className={styles.createEvidenceContainer}>
              <PlusCircle size={24} color="#141414" />
              <Text className={styles.createEvidence}>Agregar documento</Text>
            </div>
          </Upload>
        </div>
      </div>
    </div>
  );
};
