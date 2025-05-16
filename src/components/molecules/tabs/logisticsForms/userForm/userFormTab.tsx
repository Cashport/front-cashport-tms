import { useEffect, useState } from "react";
import { Button, Col, Flex, Form, Row, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { ArrowsClockwise, CaretLeft, Pencil } from "phosphor-react";

// components
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import { UploadImg } from "@/components/atoms/UploadImg/UploadImg";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import "./userformtab.scss";
import {
  _onSubmit,
  dataToProjectFormData,
  validationButtonText,
  UserFormTabProps
} from "./userFormTab.mapper";
import { ICarrier, IFormUser, ITransferOrderPsls } from "@/types/logistics/schema";
import useSWR from "swr";
import Link from "next/link";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import { SelectInputForm } from "@/components/molecules/logistics/SelectInputForm/SelectInputForm";
import { getAllCostCenterByPsl, getAllPsl, getAllRoles } from "@/services/logistics/users";
import { IRol } from "@/types/roles/IRoles";
import { getAllCarriers } from "@/services/logistics/users";

const { Title, Text } = Typography;

export const UserFormTab = ({
  onEditProject = () => {},
  onSubmitForm = () => {},
  statusForm = "review",
  data,
  onActiveUser = () => {},
  onDesactivateUser = () => {},
  params,
  handleFormState = () => {},
  isLoadingSubmit
}: UserFormTabProps) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const { data: rolesType, isLoading: isLoadingRoles } = useSWR("getAllRoles", getAllRoles, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  const { data: carriersType, isLoading: isLoadingCarriers } = useSWR(
    "getAllCarriers",
    getAllCarriers,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );
  const { data: pslsType, isLoading: isLoadingPsls } = useSWR("getAllPsl", getAllPsl, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const [imageFile, setImageFile] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const defaultValues = statusForm === "create" ? {} : dataToProjectFormData(data);
  const {
    watch,
    setValue,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<IFormUser>({
    defaultValues,
    disabled: statusForm === "review"
  });

  const isFormCompleted = () => {
    return isValid; // && (imageFile || getValues("general.photo"));
  };
  const isSubmitButtonEnabled = isFormCompleted() && !loading && !isLoadingSubmit;

  useEffect(() => {
    if (statusForm === "review") {
      if (data?.carrier) {
        const carrier_id: string = data.carrier.id_carrier;
        setValue("general.carrier_id", carrier_id);
      }
      if (data?.psl) {
        const psl_id: string = data.psl.id_psl;
        setValue("general.psl_id", psl_id);
        getAllCostCenterByPsl(psl_id).then((cc) => {
          setCostCenters(convertCostCenterToSelectOptions(cc.data));
          setValue("general.cost_center_id", data.psl.id_cost_center);
        });
      }
      setIsActive(Boolean(data?.ACTIVE == "0" ? false : true));
    }
  }, [statusForm]);

  const converRolestToSelectOptions = (roleTypes: IRol[]) => {
    if (!Array.isArray(roleTypes)) return [];
    return roleTypes?.map((roleType) => ({
      value: roleType.ROL_NAME,
      id: roleType.ID
    }));
  };

  const converCarrierstToSelectOptions = (carrierTypes: ICarrier[]) => {
    if (!Array.isArray(carrierTypes)) return [];
    return carrierTypes?.map((carrierType) => ({
      value: carrierType.description,
      id: carrierType.id
    }));
  };

  const converPslstToSelectOptions = (pslTypes: ITransferOrderPsls[]) => {
    if (!Array.isArray(pslTypes)) return [];
    return pslTypes?.map((pslType) => ({
      value: pslType.description,
      id: pslType.id
    }));
  };

  const [costCenters, setCostCenters] = useState<any[]>([]);

  const convertCostCenterToSelectOptions = (costcenters: any[]) => {
    return costcenters?.map((costcenter) => ({
      value: costcenter.description,
      id: costcenter.id
    }));
  };

  useEffect(() => {
    const subscription = watch((data, { name, type }) => {
      //console.log(data, name, type);
      if (name == "general.psl_id") {
        const psl_id: any = data.general?.psl_id?.toString();
        getAllCostCenterByPsl(psl_id).then((cc) => {
          setCostCenters(convertCostCenterToSelectOptions(cc.data));
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [pslsType]);

  const onSubmit = (data: any) => {
    _onSubmit(
      data,
      imageFile ? [{ docReference: "imagen", file: imageFile }] : undefined,
      setImageError,
      setLoading,
      onSubmitForm
    );
  };

  return (
    <>
      <Form className="driverForm">
        <Flex component={"header"} className="headerProyectsForm">
          <Link href={`/logistics/configuration/users/all`} passHref>
            <Button
              type="text"
              size="large"
              className="buttonGoBack"
              icon={<CaretLeft size={"1.45rem"} />}
            >
              Ver Usuarios
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
          <Row gutter={16}>
            <Col span={5}>
              {" "}
              {/* Columna Foto de usuario*/}
              <Title className="title" level={4}>
                Foto del usuario
              </Title>
              <UploadImg
                disabled={statusForm === "review"}
                imgDefault={
                  watch("general.photo") ??
                  "https://cdn.icon-icons.com/icons2/1622/PNG/512/3741756-bussiness-ecommerce-marketplace-onlinestore-store-user_108907.png"
                }
                setImgFile={setImageFile}
                uploadInstructionsText="*Sube la foto del usuario"
              />
              {imageError && (
                <Text className="textError">{"foto del usuario es obligatorio *"}</Text>
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
                    nameInput="general.user_name"
                    control={control}
                    error={errors?.general?.user_name}
                    disabled={statusForm === "review"}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Correo electrónico"
                    nameInput="general.email"
                    control={control}
                    error={errors?.general?.email}
                    disabled={statusForm !== "create"}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Teléfono"
                    nameInput="general.phone"
                    control={control}
                    error={errors?.general?.phone}
                    typeInput="number"
                    validationRules={{ required: true, maxLength: 10 }}
                    oninputInterceptor={(e) => (e.target.value = e.target.value.slice(0, 10))}
                    disabled={statusForm === "review"}
                  />
                </Col>
                <Col span={8}>
                  <InputForm
                    titleInput="Cargo"
                    nameInput="general.position"
                    control={control}
                    error={errors?.general?.position}
                    disabled={statusForm === "review"}
                  />
                </Col>
                <Col span={8}>
                  <Flex vertical className="selectButton">
                    <Title className="title" level={5}>
                      Rol
                    </Title>
                    <Controller
                      name="general.rol_id"
                      control={control}
                      rules={{ required: true }}
                      disabled={statusForm === "review"}
                      render={({ field }) => (
                        <SelectInputForm
                          placeholder="Selecciona Rol"
                          error={errors?.general?.rol_id}
                          field={field}
                          loading={isLoadingRoles}
                          options={converRolestToSelectOptions((rolesType?.data as any) || [])}
                          showSearch={true}
                        />
                      )}
                    />
                  </Flex>
                </Col>
                <Col span={8}>
                  <Flex vertical className="selectButton">
                    <Title className="title" level={5}>
                      Proveedor
                    </Title>
                    <Controller
                      name="general.carrier_id"
                      control={control}
                      rules={{ required: false }}
                      disabled={statusForm === "review"}
                      render={({ field }) => (
                        <SelectInputForm
                          placeholder="Selecciona Proveedor"
                          error={errors?.general?.carrier_id}
                          field={field}
                          loading={isLoadingCarriers}
                          options={converCarrierstToSelectOptions(
                            (carriersType?.data as any) || []
                          )}
                          allowClear={true}
                          showSearch={true}
                        />
                      )}
                    />
                  </Flex>
                </Col>
                <Col span={8}>
                  <Flex vertical className="selectButton">
                    <Title className="title" level={5}>
                      PSL
                    </Title>
                    <Controller
                      name="general.psl_id"
                      control={control}
                      rules={{ required: true }}
                      disabled={statusForm === "review"}
                      render={({ field }) => (
                        <SelectInputForm
                          placeholder="Selecciona Psl"
                          error={errors?.general?.psl_id}
                          field={field}
                          loading={isLoadingPsls}
                          options={converPslstToSelectOptions((pslsType?.data as any) || [])}
                          showSearch={true}
                        />
                      )}
                    />
                  </Flex>
                </Col>
                <Col span={16}>
                  <Flex vertical className="selectButton">
                    <Title className="title" level={5}>
                      Centro de costos
                    </Title>
                    <Controller
                      name="general.cost_center_id"
                      control={control}
                      rules={{ required: true }}
                      disabled={statusForm === "review"}
                      render={({ field }) => (
                        <SelectInputForm
                          placeholder="Selecciona centro de costos"
                          error={errors?.general?.cost_center_id}
                          field={field}
                          options={costCenters}
                          showSearch={true}
                        />
                      )}
                    />
                  </Flex>
                </Col>
              </Row>
            </Col>
          </Row>
          {["edit", "create"].includes(statusForm) && (
            <Row justify={"end"}>
              <SubmitFormButton
                text={validationButtonText(statusForm)}
                disabled={!isSubmitButtonEnabled}
                onClick={handleSubmit(onSubmit)}
                loading={isLoadingSubmit || loading}
              />
            </Row>
          )}
        </Flex>
      </Form>
      <ModalChangeStatus
        isActiveStatus={isActive}
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onActive={onActiveUser}
        onDesactivate={onDesactivateUser}
      />
    </>
  );
};
