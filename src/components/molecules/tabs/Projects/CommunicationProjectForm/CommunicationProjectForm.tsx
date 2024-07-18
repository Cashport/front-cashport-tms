import { Button, Flex, Radio, RadioChangeEvent, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { CaretLeft } from "phosphor-react";

import styles from "./communicationProjectForm.module.scss";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { useState } from "react";
import { ISelectedBussinessRules } from "@/types/bre/IBRE";
import { SelectZone } from "@/components/molecules/selects/SelectZone/SelectZone";
import { SelectStructure } from "@/components/molecules/selects/SelectStructure/SelectStructure";
import { SelectClientsGroup } from "@/components/molecules/selects/SelectClientsGroup/SelectClientsGroup";
import GeneralSelect from "@/components/ui/general-select";
import GeneralSearchSelect from "@/components/ui/general-search-select";
import SelectOuterTags from "@/components/ui/select-outer-tags";

const { Title } = Typography;

interface Props {
  showCommunicationDetails: {
    communicationId: number;
    active: boolean;
  };
  onGoBackTable: () => void;
}
export const CommunicationProjectForm = ({ onGoBackTable }: Props) => {
  const [radioValue, setRadioValue] = useState(0);
  const [zones, setZones] = useState([] as number[]);
  const [selectedBusinessRules, setSelectedBusinessRules] = useState<ISelectedBussinessRules>(
    initDatSelectedBusinessRules
  );
  const [assignedGroups, setAssignedGroups] = useState([] as any[]);

  const handleChangeRadio = (e: RadioChangeEvent) => {
    setRadioValue(parseInt(e.target.value));
  };

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<any>({});

  const handleCreateCommunication = (data: any) => {
    console.log(data);
  };

  return (
    <main className={styles.communicationProjectForm}>
      <Flex>
        <Button
          className={styles.goBackButton}
          type="text"
          size="large"
          onClick={onGoBackTable}
          icon={<CaretLeft size={"1.45rem"} />}
        >
          Información de la comunicación
        </Button>
      </Flex>
      <div className={styles.generalInfo}>
        <InputForm
          titleInput="Nombre"
          control={control}
          nameInput="name"
          // error={errors.name}
        />
        <InputForm
          titleInput="Descripción"
          control={control}
          nameInput="description"
          // error={errors.description}
        />
      </div>

      <div className={styles.forwardType}>
        <Title className={styles.forwardType__title} level={5}>
          Tipo de envio
        </Title>
        <Radio.Group className={styles.radioGroup} onChange={handleChangeRadio} value={radioValue}>
          <Radio key={1} value={1}>
            <div className={styles.radioGroup__label}>
              input
              {/* <p>{discount.discount}</p>
              {discount.isReached && <p className={styles.reachedDiscount}>Descuento Alcanzado</p>} */}
            </div>
          </Radio>
        </Radio.Group>
      </div>

      <div className={styles.businessRules}>
        <Title className={styles.businessRules__title} level={5}>
          Reglas de negocio
        </Title>
        <SelectZone zones={zones} setZones={setZones} />
        <SelectStructure
          selectedBusinessRules={selectedBusinessRules}
          setSelectedBusinessRules={setSelectedBusinessRules}
          disabled={false}
        />
        <SelectClientsGroup assignedGroups={assignedGroups} setAssignedGroups={setAssignedGroups} />
      </div>

      <div className={styles.communicationTemplate}>
        <Title className={styles.communicationTemplate__title} level={5}>
          Plantilla comunicado
        </Title>
        <Controller
          name="via"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <GeneralSelect
              errors={errors.via}
              field={field}
              title="Via"
              placeholder="Seleccionar via"
              options={mockVias}
              customStyleContainer={{ width: "25%", paddingRight: "0.25rem" }}
            />
          )}
        />
        <Controller
          name="forward"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <GeneralSearchSelect
              errors={errors.forward}
              field={field}
              title="Para"
              placeholder="Enviar a"
              options={mockForward}
            />
          )}
        />
        <Controller
          name="forward_copy"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <GeneralSearchSelect
              errors={errors.forward_copy}
              field={field}
              title="Copia"
              placeholder="Copia a"
              options={mockForward}
            />
          )}
        />
        <Flex gap={"1rem"}>
          <Controller
            name="tags"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <GeneralSelect
                errors={errors.tags}
                field={field}
                title="Tags"
                placeholder="Seleccionar tag"
                options={mockTags}
                customStyleContainer={{ width: "25%" }}
              />
            )}
          />
          <InputForm
            customStyle={{ width: "75%" }}
            titleInput="Asunto"
            control={control}
            nameInput="subject"
            // error={errors.description}
          />
        </Flex>
        <Controller
          name="body"
          control={control}
          render={({ field }) => (
            <div className={styles.textArea}>
              <p className={styles.textArea__label}>Cuerpo</p>
              <textarea
                {...field}
                placeholder="Ingresar cuerpo del correo"
                style={errors.comment ? { borderColor: "red" } : {}}
              />
            </div>
          )}
        />
        <Controller
          name="attached"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <SelectOuterTags
              title="Adjunto"
              placeholder="Seleccionar adjunto"
              options={mockAttachments}
              errors={errors.attached}
              field={field}
            />
          )}
        />
      </div>

      <Flex justify="end">
        <PrincipalButton onClick={handleSubmit(handleCreateCommunication)}>
          Crear comunicación
        </PrincipalButton>
      </Flex>
    </main>
  );
};

const mockVias = [
  { id: 1, value: 1, label: "Email" },
  { id: 2, value: 2, label: "SMS" },
  { id: 3, value: 3, label: "WhatsApp" }
];

const mockTags = [
  { id: 1, value: 1, label: "Nombre_Cliente" },
  { id: 2, value: 2, label: "Nombre_Usuario" },
  { id: 3, value: 3, label: "Nombre_KAM" }
];

const mockAttachments = [
  { id: 1, value: 1, label: "PDF Estado de cuenta" },
  { id: 2, value: 2, label: "Excel cartera" },
  { id: 3, value: 3, label: "PDF Factura" },
  { id: 4, value: 4, label: "PDF Estado de cuenta" },
  { id: 5, value: 5, label: "Excel cartera" },
  { id: 6, value: 6, label: "PDF Factura" },
  { id: 7, value: 7, label: "PDF Estado de cuenta" },
  { id: 8, value: 8, label: "Excel cartera" },
  { id: 9, value: 9, label: "PDF Factura" },
  { id: 10, value: 10, label: "PDF Estado de cuenta" },
  { id: 11, value: 11, label: "Excel cartera" },
  { id: 12, value: 12, label: "PDF Factura" }
];

const mockForward = [
  { value: 1, label: "Santiago Pachon" },
  { value: 2, label: "Miguel Martinez" },
  { value: 3, label: "Felipe Angarita" },
  { value: 4, label: "Juan Perez" },
  { value: 5, label: "Carlos Sanchez" },
  { value: 6, label: "Jhon Doe" },
  { value: 7, label: "Maria Perez" },
  { value: 8, label: "Laura Martinez" },
  { value: 9, label: "Sara Perez" },
  { value: 10, label: "Camila Sanchez" }
];

const initDatSelectedBusinessRules: ISelectedBussinessRules = {
  channels: [],
  lines: [],
  sublines: []
};
