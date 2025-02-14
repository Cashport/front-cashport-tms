import { useEffect, useState } from "react";
import { Button, Col, Flex, Form, Row, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { ArrowsClockwise, CaretLeft, Pencil } from "phosphor-react";

// components
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import { UploadImg } from "@/components/atoms/UploadImg/UploadImg";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import "./materialformtab.scss";
import {
  dataToProjectFormData,
  validationButtonText,
  MaterialFormTabProps
} from "./materialFormTab.mapper";
import { IFormMaterial, IMaterialType, IMaterialTransportType } from "@/types/logistics/schema";
import Link from "next/link";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import MultiSelectTags from "@/components/ui/multi-select-tags/MultiSelectTags";

const { Title, Text } = Typography;

interface OptionType {
  value: number;
  label: string;
}

export const MaterialFormTab = ({
  onEditProject = () => {},
  onSubmitForm = () => {},
  statusForm = "review",
  data,
  params,
  handleFormState = () => {},
  onActiveMaterial = () => {},
  onDesactivateMaterial = () => {},
  isLoadingSubmit,
  materialsTransportTypesData: transportFeaturesOptions,
  materialsTypesData: securityFeaturesOptions
}: MaterialFormTabProps) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  //const [selectedFiles, setSelectedFiles] = useState<DocumentCompleteType[]>([]);

  interface ImageState {
    file: File | undefined;
  }

  const [images, setImages] = useState<ImageState[]>(
    Array(5).fill({ file: undefined, error: false })
  );

  const defaultValues = statusForm === "create" ? {} : dataToProjectFormData(data);
  const {
    watch,
    setValue,
    getValues,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<IFormMaterial>({
    defaultValues,
    disabled: statusForm === "review"
  });
  const formImages = watch("images");

  const hasImages = () => {
    return images.some((img) => img.file) || (formImages && formImages.length > 0);
  };
  const isFormCompleted = () => {
    return isValid; //&& hasImages();
  };

  const isSubmitButtonEnabled = isFormCompleted() && !isLoadingSubmit;

  const convertToSelectOptions = (options: IMaterialTransportType[] | IMaterialType[]) => {
    if (!Array.isArray(options)) return [];
    return options?.map((option) => ({
      label: option.description,
      value: option.id
    }));
  };

  const convertToSelectDefaults = (
    options: IMaterialTransportType[] | IMaterialType[],
    type: "transport" | "security"
  ): any => {
    if (options.length == 0) return [];
    const results: OptionType[] = [];
    const dataFromAPI: any = type === "transport" ? data?.material_transport : data?.material_type;
    const propToFilterName =
      type === "transport" ? "id_material_transport_type" : "id_material_type";
    dataFromAPI?.forEach((d: any) => {
      const matfilter = options?.filter((option) => option.id == d[propToFilterName]);
      const option: OptionType = {
        value: matfilter[0].id,
        label: matfilter[0].description
      };
      results.push(option);
    });
    return results;
  };

  const onSubmit = async (data: any) => {
    const formImages: any[] = data.images ? [...data.images] : [];
    setImages(Array(5).fill({ file: undefined }));
    setImageError(false);
    onSubmitForm({ ...data, images: formImages });
  };
  useEffect(() => {
    if (data?.material_transport) {
      setValue(
        "general.material_transport",
        convertToSelectDefaults(transportFeaturesOptions, "transport")
      );
    }
  }, [data, transportFeaturesOptions, setValue]);

  useEffect(() => {
    if (data?.material_type) {
      setValue(
        "general.material_type",
        convertToSelectDefaults(securityFeaturesOptions, "security")
      );
    }
  }, [data, securityFeaturesOptions, setValue]);

  return (
    <>
      <Form className="materialFormTab">
        <Flex component={"header"} className="headerProyectsForm">
          <Link href={`/logistics/configuration`} passHref>
            <Button
              type="text"
              size="large"
              className="buttonGoBack"
              icon={<CaretLeft size={"1.45rem"} />}
            >
              Ver Materiales
            </Button>
          </Link>
          <Flex gap={"1rem"}>
            {(statusForm === "review" || statusForm === "edit") && (
              <Button
                className="buttons"
                htmlType="button"
                disabled={statusForm === "review"}
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpenModal(true);
                }}
              >
                Cambiar Estado
                <ArrowsClockwise size={"1.2rem"} />
              </Button>
            )}
            {statusForm === "review" ? (
              <Button
                className="buttons -edit"
                htmlType="button"
                onClick={(e) => {
                  handleFormState("edit");
                  e.preventDefault();
                }}
              >
                {validationButtonText(statusForm)}
                <Pencil size={"1.2rem"} />
              </Button>
            ) : (
              ""
            )}
            {statusForm === "edit" ? (
              <Button
                className="buttons -edit"
                htmlType="button"
                onClick={(e) => {
                  handleFormState("review");
                  e.preventDefault();
                  reset();
                }}
              >
                {"Cancelar edición"}
              </Button>
            ) : (
              ""
            )}
          </Flex>
        </Flex>
        <Flex component={"main"} flex="1" vertical style={{ paddingRight: "1rem" }}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              {" "}
              {/* Columna Fotos del Vehiculo */}
              <Title className="title" level={4}>
                Fotos del material
              </Title>
              {/* ------------Image Project-------------- */}
              <Row>
                <Col span={24} className="colfoto">
                  <UploadImg
                    disabled={statusForm === "review"}
                    imgDefault={formImages ? formImages[0]?.url_archive : undefined}
                    setImgFile={(file) => {
                      const currentUrlArchive = formImages ? formImages[0]?.url_archive : undefined; // obtener el valor actual de url_archive
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
                        //console.log(file)
                        setImageError(false);
                      }
                    }}
                  />
                  {imageError && (
                    <Text className="textError">{"Al menos 1 imagen debe ser cargada *"}</Text>
                  )}
                </Col>
              </Row>
              <Row gutter={16}>
                {images.slice(1).map((image, index) => (
                  <Col xs={24} sm={12} lg={6} className="colfotomin" key={index + 1}>
                    <UploadImg
                      disabled={statusForm === "review"}
                      imgDefault={formImages ? formImages[index + 1]?.url_archive : undefined}
                      setImgFile={(file) => {
                        const currentUrlArchive = formImages
                          ? formImages[index + 1]?.url_archive
                          : undefined; // obtener el valor actual de url_archive
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
                        // if (file) {
                        //   setImageError(false);
                        // }
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </Col>
            <Col span={18}>
              {" "}
              {/* Columna Informacion general*/}
              <Row>
                <Col span={24}>
                  <Title className="title" level={4}>
                    Datos del material
                  </Title>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                {" "}
                {/* Fila campos info gral*/}
                <Col span={12}>
                  <InputForm
                    titleInput="Código"
                    nameInput="general.code_sku"
                    control={control}
                    error={errors?.general?.code_sku}
                  />
                </Col>
                <Col span={12}>
                  <InputForm
                    titleInput="Nombre"
                    nameInput="general.description"
                    control={control}
                    error={errors?.general?.description}
                  />
                </Col>
                <Col span={6}>
                  <InputForm
                    typeInput="number"
                    titleInput="Alto (m)"
                    nameInput="general.mt_height"
                    control={control}
                    error={errors?.general?.mt_height}
                  />
                </Col>
                <Col span={6}>
                  <InputForm
                    typeInput="number"
                    titleInput="Largo (m)"
                    nameInput="general.mt_width"
                    control={control}
                    error={errors?.general?.mt_width}
                  />
                </Col>
                <Col span={6}>
                  <InputForm
                    typeInput="number"
                    titleInput="Ancho (m)"
                    nameInput="general.mt_length"
                    control={control}
                    error={errors?.general?.mt_length}
                  />
                </Col>
                <Col span={6}>
                  <InputForm
                    typeInput="number"
                    titleInput="Peso (kg)"
                    nameInput="general.kg_weight"
                    control={control}
                    error={errors?.general?.kg_weight}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          {/* ----------------------------------Vehiculos--------------------------------- */}

          <Row style={{ width: "100%", marginTop: "2rem" }}>
            <Col span={24}>
              <Title className="title" level={4}>
                Características
              </Title>
              <Row style={{ width: "100%", marginTop: "2rem" }}>
                <Col span={12}>
                  <Controller
                    name="general.material_transport"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <MultiSelectTags
                        field={field}
                        placeholder="Seleccionar"
                        title="Características de transporte"
                        errors={errors?.general?.material_transport}
                        defaultValue={null}
                        options={convertToSelectOptions(transportFeaturesOptions)}
                        disabled={statusForm === "review"}
                        layout="vertical"
                      />
                    )}
                  />
                </Col>
                <Col span={12}>
                  <Controller
                    name="general.material_type"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <MultiSelectTags
                        field={field}
                        placeholder="Seleccionar"
                        title="Características de seguridad"
                        errors={errors?.general?.material_type}
                        defaultValue={null}
                        options={convertToSelectOptions(securityFeaturesOptions)}
                        disabled={statusForm === "review"}
                        layout="vertical"
                      />
                    )}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          {["edit", "create"].includes(statusForm) && (
            <Row justify={"end"} style={{ marginTop: "2rem" }}>
              <SubmitFormButton
                text={validationButtonText(statusForm)}
                disabled={!isSubmitButtonEnabled}
                onClick={handleSubmit(onSubmit)}
                loading={isLoadingSubmit}
              />
            </Row>
          )}
        </Flex>
      </Form>
      <ModalChangeStatus
        isActiveStatus={true}
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onActive={onActiveMaterial}
        onDesactivate={onDesactivateMaterial}
      />
    </>
  );
};
