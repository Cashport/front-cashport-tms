import { useEffect, useRef, useState } from "react";
import { Button, Card, Col, Flex, Row, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { ArrowsClockwise, CaretLeft, FileArrowUp, Pencil, XCircle } from "phosphor-react";
import { auth } from "../../../../../../firebase";

// components
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

//interfaces
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import {
  normalizeLocationData,
  validationButtonText,
  LocationFormTabProps
} from "./locationFormTab.mapper";
import "./locationformtab.scss";
import {
  ICity,
  IFormLocation,
  IGroupLocation,
  ILocationTypes,
  IState
} from "@/types/logistics/schema";
import ModalDocuments from "@/components/molecules/modals/ModalDocuments/ModalDocuments";
// get deptos munis, grups , tipos
import { getAllCitiesByState } from "@/services/logistics/locations";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";
import Link from "next/link";
import dayjs from "dayjs";
import SubmitFormButton from "@/components/atoms/SubmitFormButton/SubmitFormButton";
import LoadDocumentsButton from "@/components/atoms/LoadDocumentsButton/LoadDocumentsButton";
import { SelectInputForm } from "@/components/molecules/logistics/SelectInputForm/SelectInputForm";
import ModalDocumentsType from "@/components/molecules/modals/ModalDocumentsType/ModalDocumentsType";
import useSWR from "swr";

const { Title } = Typography;

export const LocationFormTab = ({
  data,
  handleFormState = () => {},
  onEditLocation = () => {},
  onSubmitForm = () => {},
  statusForm = "create",
  onActiveLocation = () => {},
  onDesactivateLocation = () => {},
  params,
  isLoadingSubmit,
  documentsType,
  statesData,
  locationTypesData,
  groupLocationData
}: LocationFormTabProps) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenModalDocuments, setIsOpenModalDocuments] = useState(false);
  const [imageError, setImageError] = useState(false);
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
      if (name == "general.latitude") {
        setLatitude(data.general?.latitude);
        if (data.general?.latitude != undefined && data.general?.longitude != undefined) {
          markerRef.current.setLngLat([data.general?.longitude, data.general?.latitude]);
          mapRef.current.flyTo({
            center: [data.general?.longitude, data.general?.latitude]
          });
          setCoordinates([
            `Longitude: ${Number(data.general?.longitude).toFixed(6)}`,
            `Latitude: ${Number(data.general?.latitude).toFixed(6)}`
          ]);
        }
      }
      if (name == "general.longitude") {
        setLongitude(data.general?.longitude);
        if (data.general?.latitude != undefined && data.general?.longitude != undefined) {
          markerRef.current.setLngLat([data.general?.longitude, data.general?.latitude]);
          mapRef.current.flyTo({
            center: [data.general?.longitude, data.general?.latitude]
          });
          setCoordinates([
            `Longitude: ${Number(data.general?.longitude).toFixed(6)}`,
            `Latitude: ${Number(data.general?.latitude).toFixed(6)}`
          ]);
        }
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

  /* MAPBOX */
  const mapsAccessToken =
    "pk.eyJ1IjoiamNib2JhZGkiLCJhIjoiY2x4aWgxejVsMW1ibjJtcHRha2xsNjcxbCJ9.CU7FHmPR635zv6_tl6kafA"; //import.meta.env.VITE_MAP_BOX_ACCESS_TOKEN,

  const mapContainerRef = useRef(null);
  const mapRef: any = useRef(null);
  const markerRef: any = useRef(null);
  const [coordinates, setCoordinates] = useState(["", ""]);
  const [longitude, setLongitude] = useState<any>(-74.07231699675322);
  const [latitude, setLatitude] = useState<any>(4.66336863727521);

  useEffect(() => {
    mapboxgl.accessToken = mapsAccessToken;

    if (!mapContainerRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: 12
    });

    markerRef.current = new mapboxgl.Marker({
      draggable: true
    })
      .setLngLat([longitude, latitude])
      .addTo(mapRef.current);

    function onDragEnd() {
      const lngLat = markerRef.current.getLngLat();
      setCoordinates([
        `Longitude: ${Number(lngLat.lng).toFixed(6)}`,
        `Latitude: ${Number(lngLat.lat).toFixed(6)}`
      ]);
      setValue("general.latitude", Number(Number(lngLat.lat).toFixed(6)));
      setValue("general.longitude", Number(Number(lngLat.lng).toFixed(6)));
      markerRef.current.setLngLat(lngLat);
      mapRef.current.flyTo({
        center: lngLat
      });
    }

    markerRef.current.on("dragend", onDragEnd);
    return () => {
      mapRef.current.remove();
    };
  }, []);

  /*archivos*/
  interface FileObject {
    docReference: string;
    file: File | undefined;
  }
  const [files, setFiles] = useState<FileObject[] | any[]>([]);
  const [listFiles, setListFiles] = useState<DocumentCompleteType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<DocumentCompleteType[]>([]);

  useEffect(() => {
    if (Array.isArray(documentsType)) {
      const isFirstLoad = data?.documents?.length && selectedFiles.length === 0;
      if (isFirstLoad) {
        // const docsWithLink =
        //   documentsType
        //     ?.filter((f) => data.documents?.find((d) => d.id_document_type === f.id))
        //     .map((f) => ({
        //       ...f,
        //       file:  undefined,
        //       link: data.documents?.find((d) => d.id_document_type === f.id)?.url_archive,
        //       expirationDate: dayjs(
        //         data.documents?.find((d) => d.id_document_type === f.id)?.expiration_date
        //       )
        //     })) || [];
        // setSelectedFiles(docsWithLink);
      } else {
        // const documentsFiltered = documentsType?.filter((f) => !f?.optional || selectedFiles?.find((f2) => f2.id === f.id))
        // const docsWithFile =  documentsFiltered.map((f) => {
        //     const prevFile = selectedFiles.find((f2) => f2.id === f.id);
        //     return {
        //       ...f,
        //       link: prevFile?.link || undefined,
        //       file: prevFile?.link ? undefined : files.find((f2) => f2.aditionalData === f.id)?.file,
        //       expirationDate: prevFile?.expirationDate
        //     };
        //   });
        // if (docsWithFile?.length) {
        //   setSelectedFiles([...docsWithFile]);
        // } else {
        //   setSelectedFiles([]);
        // }
      }
    }
  }, [files, documentsType]);

  useEffect(() => {
    if (statusForm === "review") {
      setIsOpenModal(false);
      setLatitude(data?.latitude);
      setLongitude(data?.longitude);
      markerRef.current.setLngLat([data?.longitude, data?.latitude]);
      mapRef.current.flyTo({
        center: [data?.longitude, data?.latitude]
      });

      setTimeout(() => {
        //const group_location:number = Number(data?.group_location?.valueOf());
        setValue("general.group_location", data?.group_location);

        const location_type: number = Number(data?.location_type?.valueOf());
        setValue("general.location_type", location_type);

        const state_id: number = Number(data?.state_id?.valueOf());
        setValue("general.state_id", data?.state_id);
        setIsSelectedState(true);
        setSelectedState(state_id);

        setTimeout(() => {
          const city_id: number = Number(data?.city_id?.valueOf());
          setValue("general.city_id", city_id);
        }, 500);

        setTimeout(() => {
          const docsWithLink =
            documentsType
              ?.filter((f) => data?.documents?.find((d) => d.id === f.id))
              .map((f) => ({
                ...f,
                file: undefined,
                link: data?.documents?.find((d) => d.id === f.id)?.template,
                expirationDate: dayjs(data?.documents?.find((d) => d.id === f.id)?.expiration_date)
              })) || [];
          setSelectedFiles(docsWithLink);
        }, 500);
      }, 500);
    }
  }, [statusForm, documentsType, data, groupLocationData]);

  //add file
  const handleChange = (value: string[]) => {
    const sf = documentsType?.filter((file) => value.includes(file.id.toString()));
    if (sf) {
      console.log(sf);
      setSelectedFiles((prevState) => {
        return sf.map((file) => {
          const prevFile = prevState.find((f) => f.id === file.id);
          return {
            ...file,
            file: prevFile?.template ? undefined : prevFile?.file,
            link: prevFile?.template || undefined,
            expirationDate: prevFile?.expirationDate
          };
        });
      });
    }
  };

  //remove file
  const handleRemoveFile = (idfile: number) => {
    // eslint-disable-next-line no-unused-vars
    let newData = selectedFiles.filter((item) => item.id !== idfile);
    setSelectedFiles(newData);
    setSelectedFiles((prevdata) => {
      newData = [...prevdata];
      return prevdata;
    });
  };

  const onSubmit = async (data: any) => {
    onSubmitForm({ ...data.general, files: selectedFiles });
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

  const convertLocationTypesToSelectOptions = (locationTypes: ILocationTypes[]) => {
    return locationTypes?.map((locationType) => ({
      value: locationType.description,
      id: locationType.id
    }));
  };

  const convertGroupLocationsToSelectOptions = (groupLocations: IGroupLocation[]) => {
    return groupLocations?.map((groupLocation) => ({
      value: groupLocation.description,
      id: groupLocation.id
    }));
  };

  return (
    <>
      <form className="locationFormTab" onSubmit={handleSubmit(onSubmit)}>
        <Flex component={"header"} className="headerProyectsForm">
          <Link href={`/logistics/configuration/locations/all`} passHref>
            <Button
              type="text"
              size="large"
              className="buttonGoBack"
              icon={<CaretLeft size={"1.45rem"} />}
            >
              Ver Ubicaciones
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
              {/* Columna Mapa */}
              <Title className="title" level={4}>
                Mapa
              </Title>
              <Row>
                <Col span={24}>
                  <div
                    id="map"
                    ref={mapContainerRef}
                    style={{
                      width: "100%",
                      height: "37vh",
                      border: "1px #F7F7F7 solid"
                    }}
                  />
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.5)",
                      color: "#fff",
                      position: "absolute",
                      bottom: "20px",
                      left: "10px",
                      padding: "5px 10px",
                      margin: 0,
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      fontSize: "11px",
                      lineHeight: "18px",
                      borderRadius: "3px",
                      display: coordinates ? "block" : "none"
                    }}
                  >
                    {coordinates &&
                      coordinates.map((coord, idx) => (
                        <p key={idx} style={{ marginBottom: 0 }}>
                          {coord}
                        </p>
                      ))}
                  </div>
                </Col>
              </Row>
            </Col>
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
                <Col span={12}>
                  <InputForm
                    titleInput="Longitud"
                    placeholder="0°"
                    nameInput="general.longitude"
                    control={control}
                    disabled={statusForm === "review"}
                    error={errors?.general?.longitude}
                  />
                </Col>
                <Col span={12}>
                  <InputForm
                    titleInput="Latitud"
                    placeholder="0°"
                    nameInput="general.latitude"
                    control={control}
                    disabled={statusForm === "review"}
                    error={errors?.general?.latitude}
                  />
                </Col>
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
                        options={convertCitiesToSelectOptions(citiesData ?? [])}
                        showSearch={true}
                        loading={isLoadingCities}
                      />
                    )}
                  />
                </Col>
                <Col span={12} className="selectButton">
                  <Title className="title" level={5}>
                    Tipo de ubicación
                  </Title>
                  <Controller
                    name="general.location_type"
                    control={control}
                    disabled={statusForm === "review"}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <SelectInputForm
                        placeholder="Seleccionar"
                        error={errors?.general?.location_type}
                        field={field}
                        options={convertLocationTypesToSelectOptions(locationTypesData)}
                      />
                    )}
                  />
                </Col>
                <Col span={12} className="selectButton">
                  <Title className="title" level={5}>
                    Grupo de ubicación
                  </Title>
                  <Controller
                    name="general.group_location"
                    control={control}
                    disabled={statusForm === "review"}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <SelectInputForm
                        placeholder="Seleccionar"
                        error={errors?.general?.group_location}
                        field={field}
                        options={convertGroupLocationsToSelectOptions(groupLocationData)}
                        allowClear={true}
                        showSearch={true}
                      />
                    )}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: "1rem" }}>
            {" "}
            {/* Fila Informacion Adicional */}
            <Col span={24}>
              <Title className="title" level={4}>
                Informacion Adicional
              </Title>
              <InputForm
                placeholder="Escribir información adicional"
                titleInput=""
                nameInput="general.additional_info"
                control={control}
                validationRules={{ required: false }}
                disabled={statusForm === "review"}
                error={errors.general?.additional_info}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: "1rem" }}>
            {" "}
            {/* Fila Datos de Contacto */}
            <Col span={12}>
              <Title className="title" level={4}>
                Datos de contacto
              </Title>
              <Row>
                <Col span={12}>
                  <InputForm
                    placeholder="Ingrese nombre"
                    titleInput="Nombres y apellidos"
                    nameInput="general.contact_name"
                    control={control}
                    validationRules={{ required: false }}
                    disabled={statusForm === "review"}
                    error={errors.general?.contact_name}
                  />
                </Col>
                <Col span={10} offset={1}>
                  <InputForm
                    placeholder="Ingrese teléfono"
                    titleInput="Teléfono"
                    nameInput="general.contact_number"
                    typeInput="number"
                    control={control}
                    validationRules={{ required: false, maxLength: 10 }}
                    disabled={statusForm === "review"}
                    error={errors.general?.contact_number}
                    oninputInterceptor={(e) => (e.target.value = e.target.value.slice(0, 10))}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ marginTop: "2rem", marginBottom: "2rem" }}>
            {" "}
            {/* Fila Documentos */}
            <Col span={8}>
              <Title className="title" level={4}>
                Documentos
              </Title>
            </Col>
            <Col span={8} offset={8} style={{ display: "flex", justifyContent: "flex-end" }}>
              {(statusForm === "create" || statusForm === "edit") && (
                <LoadDocumentsButton
                  text="Cargar documentos"
                  onClick={() => setIsOpenModalDocuments(true)}
                />
              )}
            </Col>
            <Row style={{ marginTop: "1rem", width: "100%" }}>
              {selectedFiles.map((file, index) => (
                <Col
                  span={8}
                  key={`file-${file.id}`}
                  style={{ marginBottom: "16px", paddingRight: "16px" }}
                >
                  <Card key={file.id} className="filecard">
                    <Row>
                      <Col span={23}>{file.description}</Col>
                      <Col span={1}>
                        {(statusForm === "create" || statusForm === "edit") && (
                          <XCircle
                            size={16}
                            onClick={() => {
                              handleRemoveFile(file.id);
                            }}
                          />
                        )}
                      </Col>
                      <Col span={24}>{file.entity_type_desc}</Col>
                      <Col>
                        {file?.template ? (
                          <UploadDocumentChild
                            linkFile={file.template}
                            nameFile={file.template.split("-").pop() ?? ""}
                            onDelete={() => {}}
                            showTrash={false}
                          />
                        ) : (
                          <FileArrowUp size={16} />
                        )}
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          </Row>
          {["edit", "create"].includes(statusForm) && (
            <Row justify={"end"}>
              <SubmitFormButton
                text={validationButtonText(statusForm)}
                disabled={!isSubmitButtonEnabled}
                onClick={handleSubmit(onSubmit)}
                loading={isLoadingSubmit}
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
      <ModalDocumentsType
        isOpen={isOpenModalDocuments}
        mockFiles={selectedFiles}
        setFiles={setFiles}
        documentsType={documentsType}
        isLoadingDocuments={false}
        onClose={() => setIsOpenModalDocuments(false)}
        handleChange={handleChange}
        setSelectedFiles={setSelectedFiles}
      />
    </>
  );
};
