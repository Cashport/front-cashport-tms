import { useEffect, useState } from "react";
import { Button, Col, Flex, Row, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { ArrowsClockwise, CaretLeft, Pencil, PlusCircle } from "phosphor-react";
import { auth } from "../../../../../../firebase";

// components
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";

//interfaces
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import {
  normalizeLocationData,
  validationButtonText,
  LocationGroupFormTabProps
} from "./grouplocationFormTab.mapper";
import "./grouplocationformtab.scss";
import { ICity, IFormLocation, IState } from "@/types/logistics/schema";
import useSWR from "swr";
// get deptos munis, grups , tipos
import { getAllCitiesByState } from "@/services/logistics/locations";
import Link from "next/link";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import { SelectInputForm } from "@/components/molecules/logistics/SelectInputForm/SelectInputForm";

const { Title } = Typography;

export const GroupLocationFormTab = ({
  data,
  handleFormState = () => {},
  onEditLocation = () => {},
  onSubmitForm = () => {},
  statusForm = "create",
  onActiveLocation = () => {},
  onDesactivateLocation = () => {},
  params,
  statesData,
  isLoadingSubmit
}: LocationGroupFormTabProps) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isSelectedState, setIsSelectedState] = useState(false);
  const [selectedState, setSelectedState] = useState<any>(null);

  const { data: citiesData, isLoading: isLoadingCities } = useSWR(
    isSelectedState ? "city-" + selectedState : null,
    getAllCitiesByState,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  useEffect(() => {
    const subscription = watch((data, { name, type }) => {
      //console.log(data, name, type);
      if (name == "general.state_id") {
        setIsSelectedState(true);
        setSelectedState(data.general?.state_id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const defaultValues = statusForm === "create" ? {} : normalizeLocationData(data as any);
  const {
    watch,
    control,
    handleSubmit,
    resetField,
    reset,
    setValue,
    getValues,
    trigger,
    formState: { errors, isValid }
  } = useForm<IFormLocation>({
    defaultValues,
    disabled: statusForm === "review",
    mode: "onChange"
  });

  const cuser = auth.currentUser;
  const username: string = String(cuser?.email);
  setValue("general.user", username);

  const isFormCompleted = () => {
    return isValid;
  };
  const isSubmitButtonEnabled = isFormCompleted() && !isLoadingSubmit;

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  useEffect(() => {
    if (statusForm === "review") {
      setIsOpenModal(false);

      setTimeout(() => {
        const state_id: number = Number(data?.state_id?.valueOf());
        setValue("general.state_id", data?.state_id);
        setIsSelectedState(true);
        setSelectedState(state_id);

        setTimeout(() => {
          const city_id: number = Number(data?.city_id?.valueOf());
          setValue("general.city_id", city_id);
        }, 500);
      }, 500);
    }
  }, [statusForm, data]);

  const onSubmit = async (data: any) => {
    const locationData: any = {
      ...data.general
    };
    onSubmitForm({ ...locationData });
  };

  const convertStatesToSelectOptions = (states: IState[]) => {
    return states?.map((state) => ({
      value: state.description,
      id: state.id
    }));
  };

  const convertCitiesToSelectOptions = (cities: ICity[]) => {
    return cities?.map((city) => ({
      value: city.description,
      id: city.id
    }));
  };

  return (
    <>
      <form className="locationFormTab" onSubmit={handleSubmit(onSubmit)}>
        <Flex component={"header"} className="headerProyectsForm">
          <Link href={`/logistics/configuration/grouplocations/all`} passHref>
            <Button
              type="text"
              size="large"
              className="buttonGoBack"
              icon={<CaretLeft size={"1.45rem"} />}
            >
              Ver Grupos de ubicación
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
        <Flex component={"main"} flex="3" vertical>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              {" "}
              {/* Columna Informacion general */}
              <Title className="title" level={4}>
                Informacion General
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <InputForm
                    titleInput="Nombre"
                    placeholder="Ingresar nombre"
                    nameInput="general.description"
                    control={control}
                    disabled={statusForm === "review"}
                    error={errors.general?.description}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ marginTop: "1rem" }}>
            {" "}
            {/* Fila Informacion Adicional */}
            <Col span={24}>
              <Title className="title" level={4}>
                Ubicaciones
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={12} className="selectButton">
                  <Title className="title" level={5}>
                    Departamento
                  </Title>
                  <Controller
                    name="general.state_id"
                    control={control}
                    disabled={statusForm === "review"}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <SelectInputForm
                        placeholder="Selecciona departamento"
                        error={errors?.general?.state_id}
                        field={field}
                        options={convertStatesToSelectOptions(statesData)}
                        showSearch={true}
                      />
                    )}
                  />
                </Col>
                <Col span={12} className="selectButton">
                  <Title className="title" level={5}>
                    Municipio
                  </Title>
                  <Controller
                    name="general.city_id"
                    control={control}
                    disabled={statusForm === "review"}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <SelectInputForm
                        placeholder="Selecciona ciudad"
                        error={errors?.general?.city_id}
                        field={field}
                        loading={isLoadingCities}
                        options={convertCitiesToSelectOptions(citiesData ?? [])}
                        showSearch={true}
                      />
                    )}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ marginTop: "2rem", marginBottom: "2rem" }}>
            <Col span={24} style={{ display: "flex", justifyContent: "flex-end" }}>
              <Flex align="center" justify="center">
                <PlusCircle size={24} />
                <button onClick={() => alert()} className="btnagregarpsl">
                  Agregar Ubicación
                </button>
              </Flex>
            </Col>
          </Row>
          {["edit", "create"].includes(statusForm) && (
            <Row justify={"end"}>
              <SubmitFormButton
                loading={isLoadingSubmit}
                text={validationButtonText(statusForm)}
                disabled={!isSubmitButtonEnabled}
                onClick={handleSubmit(onSubmit)}
              />
            </Row>
          )}
        </Flex>
      </form>
      <ModalChangeStatus
        isActiveStatus={true}
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onActive={onActiveLocation}
        onDesactivate={onDesactivateLocation}
      />
    </>
  );
};
