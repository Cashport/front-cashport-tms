import React from "react";
import { Controller, Control, FieldErrors, UseFormWatch } from "react-hook-form";
import runes from "runes2";

// Components
import { Col, Flex, Row, Typography } from "antd";
import { UploadImg } from "@/components/atoms/UploadImg/UploadImg";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import MultiSelectTags from "@/components/ui/multi-select-tags/MultiSelectTags";
import InputPhone from "@/components/atoms/inputs/InputPhone/InputPhone";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import { SelectInputForm } from "@/components/molecules/logistics/SelectInputForm/SelectInputForm";

// Utils

// Types
import { IFormDriver, VehicleType, ITripType } from "@/types/logistics/schema";

// Styles
import "../../driverformtab.scss";
import {
  bloodTypesOptions,
  documentTypesOptions,
  glassesOptions,
  licencesOptions
} from "../../../formSelectOptions";

const { Title, Text } = Typography;

export interface DriverFormAndInputsProps {
  // Form control from react-hook-form
  control: Control<IFormDriver>;

  // Form errors
  errors: FieldErrors<IFormDriver>;

  // Watch function to observe field values
  watch: UseFormWatch<IFormDriver>;

  // Form status
  statusForm: "review" | "create" | "edit";

  // Data dependencies
  vehiclesTypesList: VehicleType[];
  tripTypes: ITripType[];

  // Image handling state and setters
  imageFile: any | undefined;
  // eslint-disable-next-line no-unused-vars
  setImageFile: (file: any) => void;
  resetTrigger: boolean;
  imageError: boolean;
}

export const DriverFormAndInputs: React.FC<DriverFormAndInputsProps> = ({
  control,
  errors,
  watch,
  statusForm,
  vehiclesTypesList,
  tripTypes,
  setImageFile,
  resetTrigger,
  imageError
}) => {
  // Helper function to convert vehicle types to select options
  const convertToSelectOptions = (vehicleTypes: VehicleType[]) => {
    if (!Array.isArray(vehicleTypes)) return [];
    return vehicleTypes?.map((vehicleType) => ({
      label: vehicleType.description,
      value: vehicleType.id
    }));
  };

  return (
    <>
      <Row gutter={16}>
        <Col span={5}>
          {" "}
          {/* Columna Foto de conductor*/}
          <Title className="title" level={4}>
            Foto de conductor
          </Title>
          <UploadImg
            disabled={statusForm === "review"}
            imgDefault={
              watch("general.photo") ||
              "https://cdn.icon-icons.com/icons2/1622/PNG/512/3741756-bussiness-ecommerce-marketplace-onlinestore-store-user_108907.png"
            }
            setImgFile={setImageFile}
            uploadInstructionsText="*Sube la foto del conductor"
            resetTrigger={resetTrigger}
          />
          {imageError && !watch("general.photo") && (
            <Text className="textError">{"foto del conductor es obligatorio *"}</Text>
          )}
        </Col>
        <Col span={19}>
          {" "}
          {/* Columna Informacion general*/}
          <Title className="title" level={4}>
            Información General
          </Title>
          <Row gutter={[16, 16]}>
            {" "}
            {/* Fila campos info gral*/}
            <Col span={8}>
              <InputForm
                titleInput="Nombres"
                nameInput="general.name"
                control={control}
                error={errors?.general?.name}
              />
            </Col>
            <Col span={8}>
              <InputForm
                titleInput="Apellidos"
                nameInput="general.last_name"
                control={control}
                error={errors?.general?.last_name}
              />
            </Col>
            <Col span={8}>
              <Flex vertical className="selectButton">
                <Title className="title" level={5}>
                  Tipo de Sangre
                </Title>
                <Controller
                  name="general.rh"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Selecciona Tipo de Sangre"
                      error={errors?.general?.rh}
                      field={field}
                      options={bloodTypesOptions}
                    />
                  )}
                />
              </Flex>
            </Col>
            <Col span={8}>
              <Flex vertical className="selectButton">
                <InputDateForm
                  titleInput="Fecha de nacimiento"
                  nameInput="general.birth_date"
                  placeholder="Seleccionar fecha de nacimiento"
                  disabled={statusForm === "review"}
                  control={control}
                  error={errors?.general?.birth_date}
                />
              </Flex>
            </Col>
            <Col span={8}>
              <Flex vertical className="selectButton">
                <Title className="title" level={5}>
                  Tipo de documento
                </Title>
                <Controller
                  name="general.document_type"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Selecciona Tipo de documento"
                      error={errors?.general?.document_type}
                      field={field}
                      options={documentTypesOptions}
                    />
                  )}
                />
              </Flex>
            </Col>
            <Col span={8}>
              <InputForm
                titleInput="Numero de documento"
                nameInput="general.document"
                control={control}
                error={errors?.general?.document}
              />
            </Col>
            <Col span={8}>
              <InputPhone
                name="general.phone"
                control={control}
                titleInput="Teléfono"
                placeholder="Ingrese un teléfono"
                error={errors?.general?.phone}
                validationRules={{
                  required: "El número de teléfono es obligatorio",
                  minLength: {
                    value: 10,
                    message: "El número debe tener al menos 10 dígitos"
                  },
                  maxLength: {
                    value: 10,
                    message: "El número no puede tener más de 10 dígitos"
                  }
                }}
                count={{
                  show: statusForm !== "review",
                  max: 10,
                  strategy: (txt: any) => runes(txt).length,
                  exceedFormatter: (txt: any, { max }: { max: number }): string => {
                    return runes(txt).slice(0, max).join("");
                  }
                }}
              />
            </Col>
            <Col span={8}>
              <InputForm
                titleInput="Correo"
                nameInput="general.email"
                control={control}
                error={errors?.general?.email}
              />
            </Col>
            <Col span={8}>
              <Flex vertical className="selectButton">
                <Title className="title" level={5}>
                  Usas lentes
                </Title>
                <Controller
                  name="general.glasses"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Selecciona"
                      error={errors?.general?.glasses}
                      field={field}
                      options={glassesOptions}
                      selected={watch("general.glasses")}
                    />
                  )}
                />
              </Flex>
            </Col>
          </Row>
          <Title className="title" level={4} style={{ marginTop: "1rem" }}>
            Datos de la licencia
          </Title>
          <Row gutter={[16, 16]}>
            {" "}
            {/* Fila Datos de la licencia*/}
            <Col span={8}>
              <InputForm
                titleInput="Licencia"
                nameInput="general.license"
                control={control}
                error={errors?.general?.license}
              />
            </Col>
            <Col span={8}>
              <Flex vertical className="selectButton">
                <Title className="title" level={5}>
                  Categoria
                </Title>
                <Controller
                  name="general.license_category"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectInputForm
                      placeholder="Selecciona categoria de la licencia"
                      error={errors?.general?.license_category}
                      field={field}
                      options={licencesOptions}
                    />
                  )}
                />
              </Flex>
            </Col>
            <Col span={8}>
              <Flex vertical className="selectButton">
                <InputDateForm
                  titleInput="Fecha de expiración"
                  nameInput="general.license_expiration"
                  placeholder="Seleccionar fecha de expiración"
                  disabled={statusForm === "review"}
                  control={control}
                  validationRules={{ required: true }}
                  error={errors?.general?.license_expiration}
                />
              </Flex>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* ----------------------------------Vehiculos--------------------------------- */}
      <Row style={{ width: "100%", marginTop: "2rem" }}>
        <Title className="title" level={4}>
          Vehículos
        </Title>
        <Controller
          name="general.vehicle_type"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <MultiSelectTags
              field={field}
              placeholder="Seleccione vehículos"
              title="Vehículos que está autorizados a manejar"
              errors={errors?.general?.vehicle_type}
              options={convertToSelectOptions(vehiclesTypesList || [])}
              disabled={statusForm === "review"}
            />
          )}
        />
      </Row>
      {/* ----------------------------------Tipos de viaje--------------------------------- */}
      <Row style={{ width: "100%", marginTop: "2rem" }}>
        <Title className="title" level={4}>
          Tipos de viaje
        </Title>
        <Controller
          name="general.trip_type"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <MultiSelectTags
              field={field}
              placeholder="Seleccione"
              title="Tipos de viaje que esta autorizado"
              errors={errors?.general?.trip_type}
              options={tripTypes.map((tripType) => ({
                label: tripType.description,
                value: tripType.id
              }))}
              disabled={statusForm === "review"}
            />
          )}
        />
      </Row>
      {/* -----------------------------------Contact----------------------------------- */}
      <Row style={{ width: "100%", marginTop: "2rem" }}>
        <Col span={24}>
          <Title className="title" level={4}>
            Datos de Contacto
          </Title>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <InputForm
                titleInput="Nombres y apellidos"
                nameInput="general.emergency_contact"
                control={control}
                error={errors?.general?.emergency_contact}
              />
            </Col>
            <Col span={6}>
              <InputPhone
                name="general.emergency_number"
                control={control}
                titleInput="Teléfono"
                placeholder="Ingrese un teléfono"
                error={errors?.general?.emergency_number}
                validationRules={{
                  required: "Obligatorio",
                  minLength: {
                    value: 10,
                    message: "El número debe tener al menos 10 dígitos"
                  },
                  maxLength: {
                    value: 10,
                    message: "El número no puede tener más de 10 dígitos"
                  }
                }}
                count={{
                  show: statusForm !== "review",
                  max: 10,
                  strategy: (txt: any) => runes(txt).length,
                  exceedFormatter: (txt: any, { max }: { max: number }): string => {
                    return runes(txt).slice(0, max).join("");
                  }
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};
