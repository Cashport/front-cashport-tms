import { Divider, Flex, message, Skeleton } from "antd";
import { useState } from "react";
import styles from "./PreauthorizeTrip.module.scss";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { FieldError, useFieldArray, useForm, useWatch } from "react-hook-form";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import { MessageInstance } from "antd/es/message/interface";
import { yupResolver } from "@hookform/resolvers/yup";
import UploadFileButton from "../../ModalBillingAction/UploadFileButton/UploadFileButton";
import FooterButtons from "../../ModalBillingAction/FooterButtons/FooterButtons";
import { Plus, Trash } from "phosphor-react";
import { Preauthorization, PreauthorizeTripForm } from "./controllers/preauthorizetrip.types";
import { preautorizationsFormSchema } from "./controllers/formSchema";
import { formatNumber } from "@/utils/utils";
import { BillingByCarrier } from "@/types/logistics/billing/billing";
import { downloadCSVFromEndpoint } from "@/services/logistics/download_csv";
import { sendPreauthorizations } from "@/services/billings/billings";
import { useRouter } from "next/navigation";
import { TabEnum } from "@/components/organisms/logistics/transfer-orders/TransferOrders";

interface PAtrip {
  idTR: string;
  carrier: BillingByCarrier;
  onClose: () => void;
  messageApi: MessageInstance;
}
const defaultPA: Preauthorization = {
  idPA: "",
  date: null,
  value: null,
  evidence: undefined
};
const defaultValueForm = {
  preauthorizations: [defaultPA]
};
const PreauthorizeTrip = ({ idTR, carrier, onClose, messageApi }: PAtrip) => {
  const { subtotal: totalValue, id: billingId, carrier: carrierName } = carrier;
  const [isLoading, setIsLoading] = useState(false);
  const [defaultValues, setDefaultValues] = useState<PreauthorizeTripForm>(defaultValueForm);
  const { push } = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger
  } = useForm<PreauthorizeTripForm>({
    defaultValues,
    resolver: yupResolver(preautorizationsFormSchema) as any
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "preauthorizations"
  });

  const formValues = useWatch({ control });

  //Handle form submission
  async function sendForm(form: PreauthorizeTripForm) {
    setIsLoading(true);
    try {
      const response = await sendPreauthorizations(form, billingId);
      if (response) {
        setIsLoading(false);
        onClose();
        message.success(`TR No. ${idTR} preautorizada`, 2, () =>
          push(`/logistics/transfer-orders?tab=${TabEnum.COMPLETED}`)
        );
      }
    } catch (error: any) {
      setIsLoading(false);
      onClose();
      message.error("Hubo un error preautorizando la orden", 2);
    }
  }

  // Handle document changes
  const handleOnChangeDocument = (fileToSave: any, index: number) => {
    const { file: rawFile } = fileToSave;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        console.log(
          "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
        );
        return;
      }
      setValue(`preauthorizations.${index}.evidence.file`, rawFile);
      trigger(`preauthorizations.${index}.evidence`);
    }
  };

  const handleOnDeleteDocument = (index: number) => {
    setValue(`preauthorizations.${index}.evidence`, undefined);
    trigger(`preauthorizations.${index}.evidence`);
  };
  const onSubmit = (data: any) => {
    console.log("onSubmit", data);
    sendForm(data);
  };

  const getAlreadyPreautorized = (): number => {
    const preauthorizedValue =
      formValues.preauthorizations?.reduce((total: number, pa: any) => {
        if (pa.value) {
          return total + Number(pa.value);
        }
        return total;
      }, 0) ?? 0;
    return preauthorizedValue;
  };
  function getAllPAHaveEvidence() {
    return formValues.preauthorizations?.every((pa: any) => pa.evidence !== undefined);
  }
  const allPAHaveEvidence = getAllPAHaveEvidence();
  const pendingPAValue = totalValue - getAlreadyPreautorized();
  const isFormCompleted = pendingPAValue === 0 && allPAHaveEvidence && isValid;

  const handleDownloadCsv = () => {
    const endpoint = `logistic-billing/export-csv/${billingId}`;
    downloadCSVFromEndpoint(endpoint, `TR-${idTR}_Billing.csv`);
  };

  if (isLoading) {
    return <Skeleton active loading={isLoading} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex vertical gap={24} style={{ paddingBottom: 24 }}>
        <Flex gap={4} vertical>
          <Flex justify="space-between">
            <p className={styles.subtitle}>
              Total servicio <b>{carrierName}</b>
            </p>
            <p className={styles.subtitle}>
              <b>{`$${formatNumber(totalValue, 2)}`}</b>
            </p>
          </Flex>
          <Flex justify="space-between">
            <p className={styles.subtitle}>Pendiente preautorización</p>
            <p className={styles.subtitle}>{`$${formatNumber(pendingPAValue, 2)}`}</p>
          </Flex>
          <Flex justify="flex-end">
            <button className={styles.buttonDownload} onClick={handleDownloadCsv} type="button">
              Descargar CSV
            </button>
          </Flex>
        </Flex>
        {fields.map((field, index) => {
          const currentPA = formValues?.preauthorizations?.[index];
          return (
            <Flex vertical key={`preauthorizacion-${index}-${field.id}`}>
              <Flex vertical gap={16} style={{ paddingBottom: 24 }}>
                <Flex align="center" justify="space-between">
                  <p className={styles.subtitle}>
                    <b>PA #{index + 1}</b>
                  </p>
                  {index !== 0 && (
                    <Flex>
                      <button className={styles.addBtn} onClick={() => remove(index)}>
                        <Trash size={20} />
                      </button>
                    </Flex>
                  )}
                </Flex>
                <Flex gap={16}>
                  <InputForm
                    key={`pa-${index}-id-${field.id}`}
                    titleInput="Id Preautorización"
                    nameInput={`preauthorizations.${index}.idPA`}
                    control={control}
                    error={errors?.preauthorizations?.[index]?.idPA}
                  />
                  <InputDateForm
                    key={`pa-${index}-date-${field.id}`}
                    titleInput="Fecha"
                    nameInput={`preauthorizations.${index}.date`}
                    control={control}
                    error={(errors?.preauthorizations?.[index]?.date as FieldError) ?? undefined}
                  />
                  <InputForm
                    key={`pa-${index}-value-${field.id}`}
                    titleInput="Valor"
                    nameInput={`preauthorizations.${index}.value`}
                    control={control}
                    error={errors?.preauthorizations?.[index]?.value}
                    typeInput="number"
                  />
                </Flex>
                <UploadFileButton
                  key={`pa-${index}-doc-${field.id}`}
                  title={"Evidencia"}
                  handleOnDelete={() => handleOnDeleteDocument(index)}
                  handleOnChange={(file) => handleOnChangeDocument(file, index)}
                  fileName={currentPA?.evidence?.file?.name}
                  fileSize={currentPA?.evidence?.file?.size}
                  isMandatory={true}
                />
              </Flex>
              {index + 1 === fields.length ? (
                <Flex>
                  <button className={styles.addBtn} onClick={() => append(defaultPA)}>
                    <Plus size={12} />
                    <p>Agregar otra</p>
                  </button>
                </Flex>
              ) : (
                <Divider style={{ width: "100%" }} className={styles.divider} />
              )}
            </Flex>
          );
        })}
      </Flex>
      <FooterButtons
        isConfirmDisabled={!isFormCompleted}
        titleConfirm="Cargar Preautorización"
        onClose={onClose}
        handleOk={handleSubmit(onSubmit)}
      />
    </form>
  );
};
export default PreauthorizeTrip;
