import React, { useEffect, useState } from "react";
import { Controller, Control, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { CaretUp, CaretDown } from "phosphor-react";

// Components
import { Button, Col, Flex, Row, Switch, Typography } from "antd";
import { UploadImg } from "@/components/atoms/UploadImg/UploadImg";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import MultiSelectTags from "@/components/ui/multi-select-tags/MultiSelectTags";
import { SelectInputForm } from "@/components/molecules/logistics/SelectInputForm/SelectInputForm";

// Types
import { IFormVehicle, VehicleType, ITripType } from "@/types/logistics/schema";

// Utils
import useScreenWidth from "@/components/hooks/useScreenWidth";

// Styles
import "./vehicleFormAndInputs.scss";

const { Title, Text } = Typography;

interface ImageState {
  file: File | undefined;
}

export interface VehicleFormAndInputsProps {
  // Form control from react-hook-form
  control: Control<IFormVehicle>;

  // Form errors
  errors: FieldErrors<IFormVehicle>;

  // Watch function to observe field values
  watch: UseFormWatch<IFormVehicle>;

  // setValue function to set field values
  setValue: UseFormSetValue<IFormVehicle>;

  // Form status
  statusForm: "review" | "create" | "edit";

  // Data dependencies
  vehiclesTypesList: VehicleType[];
  features: ITripType[];

  // Image handling state and setters
  images: ImageState[];
  // eslint-disable-next-line no-unused-vars
  setImages: (images: ImageState[] | ((prev: ImageState[]) => ImageState[])) => void;
  imageError: boolean;
  // eslint-disable-next-line no-unused-vars
  setImageError: (error: boolean) => void;

  // GPS state
  hasGPS: boolean;
  // eslint-disable-next-line no-unused-vars
  setHasGPS: (hasGPS: boolean) => void;
}

export const VehicleFormAndInputs: React.FC<VehicleFormAndInputsProps> = ({
  control,
  errors,
  watch,
  setValue,
  statusForm,
  vehiclesTypesList,
  features,
  images,
  setImages,
  imageError,
  setImageError,
  hasGPS,
  setHasGPS
}) => {
  const width = useScreenWidth();
  const isMobile = width && width <= 768;
  const [showAllFields, setShowAllFields] = useState(!isMobile);

  useEffect(() => {
    if (isMobile) {
      setShowAllFields(false);
    } else {
      setShowAllFields(true);
    }
  }, [isMobile]);

  const formImages = watch("general.images");

  // Helper function to convert vehicle types to select options
  const convertToSelectOptions = (vehicleTypes: VehicleType[]) => {
    if (!Array.isArray(vehicleTypes)) return [];
    const newValues = vehicleTypes?.map((vehicleType) => ({
      value: vehicleType.description,
      id: Number(vehicleType.id)
    }));
    return newValues;
  };

  return (
    <>
      <div className="vehicle-form-inputs__container">
        {!isMobile ? (
          <div className="vehicle-form-inputs__photo-column">
            <Title className="title" level={4}>
              Fotos de vehículo
            </Title>
            {/* Main photo */}
            <div className="vehicle-form-inputs__main-photo">
              <UploadImg
                disabled={statusForm === "review"}
                imgDefault={formImages ? formImages[0]?.url_archive : undefined}
                setImgFile={(file) => {
                  const currentUrlArchive = formImages ? formImages[0]?.url_archive : undefined;
                  if (currentUrlArchive) {
                    (file as any).url_archive = currentUrlArchive;
                    setValue(`images.${0}`, file);
                  } else {
                    setValue(`images.${0}`, file);
                  }
                  setImages((prev) =>
                    prev.map((img, index) => (index === 0 ? { ...img, file } : img))
                  );
                  if (file) {
                    setImageError(false);
                  }
                }}
              />
              {imageError && (
                <Text className="textError">{"Al menos 1 imagen debe ser cargada *"}</Text>
              )}
            </div>
            {/* Mini photos */}
            <div className="vehicle-form-inputs__mini-photos">
              {images.slice(1).map((image, index) => (
                <div className="vehicle-form-inputs__mini-photo" key={index + 1}>
                  <UploadImg
                    disabled={statusForm === "review"}
                    imgDefault={formImages ? formImages[index + 1]?.url_archive : undefined}
                    setImgFile={(file) => {
                      const currentUrlArchive = formImages
                        ? formImages[index + 1]?.url_archive
                        : undefined;
                      if (currentUrlArchive) {
                        (file as any).url_archive = currentUrlArchive;
                        setValue(`images.${index + 1}`, file);
                      } else {
                        setValue(`images.${index + 1}`, file);
                      }
                      setImages((prev) =>
                        prev.map((img, imgIndex) =>
                          imgIndex === index + 1 ? { ...img, file } : img
                        )
                      );
                      if (file) {
                        setImageError(false);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="vehicle-form-inputs__info-column">
          <Title className="title" level={4}>
            Información General
          </Title>
          <div className="vehicle-form-inputs__fields-grid">
            {isMobile && !showAllFields ? (
              <>
                <div className="selectButton">
                  <Title className="title" level={5}>
                    Tipo de vehículo
                  </Title>
                  <Controller
                    name="general.id_vehicle_type"
                    control={control}
                    disabled={statusForm === "review"}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <SelectInputForm
                        placeholder="Selecciona tipo de vehículo"
                        error={errors?.general?.id_vehicle_type}
                        field={field}
                        options={convertToSelectOptions(vehiclesTypesList || [])}
                      />
                    )}
                  />
                </div>
                <InputForm
                  titleInput="Placa"
                  nameInput="general.plate_number"
                  control={control}
                  disabled={statusForm === "review"}
                  error={errors.general?.plate_number}
                />
                <InputForm
                  titleInput="Marca"
                  nameInput="general.brand"
                  control={control}
                  disabled={statusForm === "review"}
                  error={errors?.general?.brand}
                />
              </>
            ) : (
              <>
                <div className="selectButton">
                  <Title className="title" level={5}>
                    Tipo de vehículo
                  </Title>
                  <Controller
                    name="general.id_vehicle_type"
                    control={control}
                    disabled={statusForm === "review"}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <SelectInputForm
                        placeholder="Selecciona tipo de vehículo"
                        error={errors?.general?.id_vehicle_type}
                        field={field}
                        options={convertToSelectOptions(vehiclesTypesList || [])}
                      />
                    )}
                  />
                </div>
                <InputForm
                  titleInput="Placa"
                  nameInput="general.plate_number"
                  control={control}
                  disabled={statusForm === "review"}
                  error={errors.general?.plate_number}
                />
                <InputForm
                  titleInput="Marca"
                  nameInput="general.brand"
                  control={control}
                  disabled={statusForm === "review"}
                  error={errors?.general?.brand}
                />
                <InputForm
                  titleInput="Modelo"
                  nameInput="general.model"
                  control={control}
                  disabled={statusForm === "review"}
                  error={errors?.general?.model}
                />
                <InputForm
                  titleInput="Linea"
                  nameInput="general.line"
                  control={control}
                  disabled={statusForm === "review"}
                  error={errors.general?.line}
                />
                <InputForm
                  titleInput="Año"
                  nameInput="general.year"
                  control={control}
                  disabled={statusForm === "review"}
                  error={errors.general?.year}
                />
                <InputForm
                  titleInput="Color"
                  nameInput="general.color"
                  control={control}
                  disabled={statusForm === "review"}
                  error={errors.general?.color}
                />
                <InputForm
                  titleInput="Ciudad"
                  nameInput="general.country"
                  control={control}
                  disabled={statusForm === "review"}
                  error={errors.general?.country}
                />
              </>
            )}
          </div>

          {isMobile && !showAllFields ? null : (
            <>
              {/* GPS Section */}
              <Flex
                component={"section"}
                className="vehicle-form-inputs__gps-switch"
                justify="flex-start"
                align="center"
              >
                <Switch
                  disabled={statusForm === "review"}
                  checked={hasGPS}
                  onChange={() => setHasGPS(!hasGPS)}
                />
                <h5 className="ant-typography input-form-title">&nbsp;&nbsp;Equipado por GPS</h5>
              </Flex>
              <div className="vehicle-form-inputs__fields-grid">
                <InputForm
                  titleInput="Usuario"
                  nameInput="general.gps_user"
                  control={control}
                  disabled={statusForm === "review" || !hasGPS}
                  error={errors.general?.gps_user}
                />
                <InputForm
                  titleInput="Contraseña"
                  nameInput="general.gps_password"
                  control={control}
                  disabled={statusForm === "review" || !hasGPS}
                  error={errors.general?.gps_password}
                />
                <InputForm
                  titleInput="Link"
                  nameInput="general.gps_link"
                  control={control}
                  disabled={statusForm === "review" || !hasGPS}
                  error={errors.general?.gps_link}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {isMobile && !showAllFields ? null : (
        <>
          {/* ----------------------------------Tipos de viaje--------------------------------- */}
          <div className="vehicle-form-inputs__section">
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
                  options={features.map((f) => ({ label: f.description, value: f.id }))}
                  disabled={statusForm === "review"}
                  layout={isMobile ? "vertical" : undefined}
                />
              )}
            />
          </div>
          {/* ----------------------------------Informacion Adicional--------------------------------- */}
          <div className="vehicle-form-inputs__section">
            <Title className="title" level={4}>
              Informacion Adicional
            </Title>
            <InputForm
              placeholder="Escribir información adicional"
              titleInput=""
              nameInput="general.aditional_info"
              control={control}
              validationRules={{ required: false }}
              disabled={statusForm === "review"}
              error={errors.general?.aditional_info}
            />
          </div>
        </>
      )}

      {isMobile ? (
        <Button
          type="text"
          onClick={() => setShowAllFields(!showAllFields)}
          className="show-more-btn"
        >
          {showAllFields ? <CaretUp size={22} /> : <CaretDown size={22} />}
          {showAllFields ? "Ver menos" : "Ver todo"}
        </Button>
      ) : null}
    </>
  );
};
