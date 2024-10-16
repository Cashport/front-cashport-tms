import {
  Flex,
  Tabs,
  TabsProps,
  Typography,
  message,
  Collapse,
  Row,
  Col,
  Select,
  Switch,
  DatePicker,
  DatePickerProps,
  GetProps,
  TimePicker,
  Table,
  TableProps,
  AutoComplete,
  Input,
  ConfigProvider,
  InputNumber,
  Button,
  Steps,
  Drawer,
  Card,
  Modal
} from "antd";
import React, { useRef, useEffect, useState, useContext } from "react";

// dayjs locale
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es-us";
dayjs.locale("es");

// mapbox
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

// components
import { SideBar } from "@/components/molecules/SideBar/SideBar";
import { NavRightSection } from "@/components/atoms/NavRightSection/NavRightSection";

import { ProjectFormTab } from "@/components/molecules/tabs/Projects/ProjectForm/ProjectFormTab";
import { addProject } from "@/services/projects/projects";

//schemas
import {
  IFormTransferOrder,
  IListData,
  ILocation,
  TransferOrderDocumentType
} from "@/types/logistics/schema";

//locations
import { getAllLocations } from "@/services/logistics/locations";

//interfaces
import { ICreatePayload } from "@/types/projects/IProjects";

//vars
import { CREATED, SUCCESS } from "@/utils/constants/globalConstants";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Calendar,
  Package,
  UserList,
  NewspaperClipping,
  Pencil,
  Trash,
  DotsSixVertical
} from "@phosphor-icons/react";

import "../../../../../styles/_variables_logistics.css";

import "./createtransferorder.scss";
import { UploadDocumentButton } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import TextArea from "antd/es/input/TextArea";
import TabPane from "antd/es/tabs/TabPane";

import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import { addTransferOrder } from "@/services/logistics/transfer-orders";
import { formatNumber } from "@/utils/utils";

const { Title, Text } = Typography;

export const CreateTransferOrderView = () => {
  const { push } = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  /* Tipo de viaje */
  const [typeactive, setTypeActive] = useState("1");

  /* Agendamiento */
  const origin = useRef<any>([]);
  const destination = useRef<any>([]);
  const [origenIzaje, setOrigenIzaje] = useState(false);
  const [destinoIzaje, setDestinoIzaje] = useState(false);
  const [fechaInicial, setFechaInicial] = useState<Dayjs | null>(null);
  const [horaInicial, setHoraInicial] = useState<Dayjs | null>(null);

  /* MAPBOX */
  const mapsAccessToken =
    "pk.eyJ1IjoiamNib2JhZGkiLCJhIjoiY2x4aWgxejVsMW1ibjJtcHRha2xsNjcxbCJ9.CU7FHmPR635zv6_tl6kafA"; //import.meta.env.VITE_MAP_BOX_ACCESS_TOKEN,

  const mapContainerRef = useRef(null);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/streets-v12");
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState([]);
  const [distance, setDistance] = useState<any>(null);
  const [timetravel, setTimeTravel] = useState<any>(null);
  const [suggestions, setSuggestions] = useState([]);

  const [expand, setExpand] = useState(false);
  const initialItemCount = 4;
  const directions = routeInfo.length > 0 ? routeInfo[0]["legs"][0]["steps"] : [];
  const displayedDirections = expand ? directions : directions.slice(0, initialItemCount);

  const [locations, setLocations] = useState<ILocation[]>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);

  const handleToggleExpand = () => {
    setExpand(!expand);
  };

  const geocodingClient = MapboxGeocoding({
    accessToken: mapsAccessToken
  });

  const [openDrawer, setOpenDrawer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("routeInfo==>", routeInfo);

  useEffect(() => {
    loadLocations();
  });

  const loadLocations = async () => {
    if (locations.length > 0) return;
    const result = await getAllLocations();
    if (result.data.data.length > 0) {
      console.log(result.data.data);

      const listlocations: any[] | ((prevState: ILocation[]) => ILocation[]) = [];
      const listlocationoptions: { label: any; value: any }[] = [];

      result.data.data.forEach((item) => {
        listlocations.push(item);
        listlocationoptions.push({ label: item.description, value: item.id });
      });

      setLocations(listlocations);
      setLocationOptions(listlocationoptions);
    }
  };

  /* Event Handlers */
  const onCreateTransferOrder = async (data: IFormTransferOrder) => {
    console.log("DATA PARA POST: ", data);
    try {
      const response = await addTransferOrder(data.body, data?.files || []);
      if (response.status === SUCCESS) {
        messageApi.open({
          type: "success",
          content: "El viaje fue creado exitosamente."
        });
        //push("/");
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Oops, hubo un error por favor intenta mas tarde."
      });
    }
  };

  // Cambia origen
  const onChangeOrigin = (value: any) => {
    console.log("origen:" + value);
    locations.forEach(async (item, index) => {
      if (item.id == value) {
        console.log(item);
        origin.current = [item.latitude, item.longitude];
        calcRouteDirection();
      }
    });
  };

  // Cambia destino
  const onChangeDestino = async (value: any) => {
    console.log("destino:" + value);
    locations.forEach(async (item, index) => {
      if (item.id == value) {
        console.log(item);
        destination.current = [item.latitude, item.longitude];
        calcRouteDirection();
      }
    });
  };

  /* MAPBOX */

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = mapsAccessToken;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: { lon: -74.07231699675322, lat: 4.66336863727521 }, // longitude and latitude
      zoom: 12,
      attributionControl: false
    });

    map.on("style.load", () => {
      // Add the compass control
      const compassControl = new mapboxgl.NavigationControl({
        showCompass: true
      });
      map.addControl(compassControl, "top-right");

      // Create a marker at the starting position
      if (origin) {
        const startMarker = new mapboxgl.Marker().setLngLat(origin.current).addTo(map);
      }

      // Create a marker at the finish position
      if (destination) {
        const finalMarker = new mapboxgl.Marker().setLngLat(destination.current).addTo(map);
      }

      if (routeGeometry) {
        routeGeometry.legs = [];
        console.log(routeGeometry);

        const datajson: GeoJSON.Feature = {
          type: "Feature",
          geometry: routeGeometry,
          properties: {}
        };

        map.addSource("route", {
          type: "geojson",
          data: datajson
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": "#3FB1CE",
            "line-width": 6
          }
        });
      }
      // Get the route bounds
      const bounds = routeGeometry.coordinates.reduce(
        (bounds: any, coord: any) => bounds.extend(coord),
        new mapboxgl.LngLatBounds()
      );

      // Zoom out to fit the route within the map view
      map.fitBounds(bounds, {
        padding: 50
      });
    });

    // return () => {
    //   map.remove();
    // };
  }, [mapStyle, routeGeometry, origin, destination]);

  // calculate direction
  const calcRouteDirection = async () => {
    //if (origin.length > 2) {
    console.log("entro0");
    console.log("entro1:" + origin.current.length);
    console.log("entro2:" + destination.current.length);
    if (origin.current.length == 0 || destination.current.length == 0) return;

    try {
      // const originp = 'Bogotá';
      // try {
      //   console.log('entro1');
      //   const response = await geocodingClient
      //     .forwardGeocode({
      //       query: originp,
      //       types: ["place"],
      //       limit: 1,
      //     })
      //     .send();

      //   const destinationCoordinates = response.body.features[0].center;
      //   console.log(destinationCoordinates);
      //   //originCoordinates = destinationCoordinates;
      //   setOrigin(destinationCoordinates);
      // } catch (error) {
      //   console.error("Error calculating directions:", error);
      //   throw error;
      // }

      //setOrigin([-74.07231699675322, 4.66336863727521]);
      //setDestination([-74.027990000000000, 4.918570000000000]);

      console.log(origin);
      console.log(destination);

      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.current[0]},${origin.current[1]};${destination.current[0]},${destination.current[1]}?steps=true&geometries=geojson&access_token=${mapsAccessToken}`
      );

      const routes = response.data.routes;
      console.log("routes=>", routes);
      setRouteInfo(routes);
      // Check if any routes are returned
      if (routes.length > 0) {
        const { distance, duration, geometry } = routes[0];

        // Valid directions, use the distance and duration for further processing
        const directions = {
          distance,
          duration
        };
        setRouteGeometry(geometry); // Set the route geometry
        setDistance(distance);
        setTimeTravel(duration);
        return directions;
      } else {
        // No routes found
        throw new Error("Unable to calculate directions");
      }
    } catch (error) {
      // Handle error
      console.error("Error calculating directions:", error);
      throw error;
    }
    //}
  };

  /* Tipo de viaje */
  const handleTypeClick = (event: any) => {
    setTypeActive(event.target.id);
    origin.current = [];
    destination.current = [];
    setRouteGeometry(null);
    setRouteInfo([]);
    setDistance(null);
    setTimeTravel(null);
    if (event.target.id == "2") {
      setOrigenIzaje(true);
    } else {
      setOrigenIzaje(false);
    }
  };

  /* Carga */

  const columnsCarga = [
    {
      title: "Cantidad",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "SKU",
      dataIndex: "age",
      key: "age"
    },
    {
      title: "Nombre",
      dataIndex: "address",
      key: "address"
    },
    {
      title: "Volumen",
      dataIndex: "address",
      key: "address"
    },
    {
      title: "Alto",
      dataIndex: "address",
      key: "address"
    },
    {
      title: "Ancho",
      dataIndex: "address",
      key: "address"
    },
    {
      title: "Largo",
      dataIndex: "address",
      key: "address"
    },
    {
      title: "Peso",
      dataIndex: "address",
      key: "address"
    },
    {
      title: "Alertas",
      dataIndex: "address",
      key: "address"
    }
  ];

  const columnsCargaPersonas = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone"
    },
    {
      title: "PSL",
      dataIndex: "psl",
      key: "psl"
    },
    {
      title: "CC",
      dataIndex: "typeid",
      key: "typeid"
    }
  ];

  const columnsCargaVehiculo = [
    {
      title: "Vehiculo",
      dataIndex: "vehicle",
      key: "vehicle"
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity"
    }
  ];

  /* Responsables */

  /* informacion adicional */
  interface FileObject {
    docReference: string;
    file: File | undefined;
  }
  const [files, setFiles] = useState<FileObject[] | any[]>([]);

  const mockFiles = [
    { id: 1, title: "archivo 1", isMandatory: true },
    { id: 2, title: "archivo 2", isMandatory: true },
    { id: 3, title: "archivo 3", isMandatory: false }
  ];

  const columnsRequerimientosAdicionales = [
    {
      title: "Nombre",
      dataIndex: "namereq",
      key: "namereq"
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity"
    }
  ];

  /* acoordion */
  const actionsOptions = [
    {
      key: 3,
      label: (
        <div className="collapseByAction__label">
          <Package size={16} />
          <Title className="collapseByAction__label__text" level={4}>
            Carga
          </Title>
        </div>
      ),
      children: (
        <div>
          {(typeactive == "1" || typeactive == "2") && (
            <>
              <label className="locationLabels" style={{ display: "flex", marginTop: "2rem" }}>
                <text>Material</text>
              </label>
              <p>&nbsp;</p>
              <AutoComplete
                popupClassName="certain-category-search-dropdown"
                popupMatchSelectWidth={500}
                style={{ width: 250 }}
                size="large"
              >
                <Input.Search size="large" placeholder="Buscar material" />
              </AutoComplete>
              <Table columns={columnsCarga} />
            </>
          )}
          {typeactive == "3" && (
            <>
              <label className="locationLabels" style={{ display: "flex", marginTop: "2rem" }}>
                <text>Personas</text>
              </label>
              <p>&nbsp;</p>
              <AutoComplete
                popupClassName="certain-category-search-dropdown"
                popupMatchSelectWidth={500}
                style={{ width: 250 }}
                size="large"
              >
                <Input.Search size="large" placeholder="Buscar persona" />
              </AutoComplete>
              <Table columns={columnsCargaPersonas} />
            </>
          )}
          <>
            <label className="locationLabels" style={{ display: "flex", marginTop: "2rem" }}>
              <text>Vehículo Sugerido</text>
            </label>
            <p>&nbsp;</p>
            <AutoComplete
              popupClassName="certain-category-search-dropdown"
              popupMatchSelectWidth={500}
              style={{ width: 250 }}
              size="large"
            >
              <Input.Search size="large" placeholder="Agregar vehículo" />
            </AutoComplete>
            <Table columns={columnsCargaVehiculo} />
          </>
        </div>
      )
    }
  ];

  const tabitems: TabsProps["items"] = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1"
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2"
    },
    {
      key: "3",
      label: "Tab 3",
      children: "Content of Tab Pane 3"
    }
  ];

  const handleComplete = () => {
    console.log("Form completed!");
    // Handle form completion logic here
  };
  const tabChanged = ({ prevIndex, nextIndex }: { prevIndex: number; nextIndex: number }) => {
    console.log("prevIndex", prevIndex);
    console.log("nextIndex", nextIndex);
  };

  return (
    <>
      {contextHolder}
      <main className="mainCreateOrder">
        <SideBar />
        <Flex vertical className="containerCreateOrder">
          <Flex className="infoHeaderOrder">
            <Flex gap={"2rem"}>
              <Title level={2} className="titleName">
                Asignación de ordenes
              </Title>
            </Flex>
            <Flex component={"navbar"} align="center" justify="space-between">
              <NavRightSection />
            </Flex>
          </Flex>
          {/* ------------Main Info Order-------------- */}
          <Row className="orderContainer">
            <Col>
              <Row style={{ width: "100%" }}>
                <Col span={16}>
                  <Flex justify="space-evenly">
                    <Steps
                      style={{ width: "100%" }}
                      size="small"
                      current={0}
                      items={[
                        {
                          title: "Solicitud de transferencia"
                        },
                        {
                          title: "Seleccion de vehiculos"
                        },
                        {
                          title: "Seleccion de proveedor"
                        }
                      ]}
                    />
                  </Flex>
                </Col>
                <Col span={8} style={{ textAlign: "right" }}>
                  <Button
                    type="default"
                    className="active"
                    onClick={() => {
                      setOpenDrawer(true);
                    }}
                  >
                    <text>Tracking &gt;&gt;</text>
                  </Button>
                  <Drawer
                    title="Tracking"
                    placement="right"
                    open={openDrawer}
                    onClose={() => {
                      setOpenDrawer(false);
                    }}
                    closable={true}
                    key="right"
                    footer={
                      <>
                        <button
                          onClick={() => {
                            setIsModalOpen(true);
                          }}
                          className="active"
                          style={{
                            borderRadius: "10px",
                            padding: "10px",
                            border: "none",
                            float: "right"
                          }}
                        >
                          Agregar
                        </button>
                      </>
                    }
                  >
                    <Card style={{ width: "100%", padding: "0px" }}>
                      <Row>
                        <Col span={2}>
                          <DotsSixVertical style={{ fontSize: "20px" }} />
                        </Col>
                        <Col span={18}>
                          <p>Izaje</p>
                          <p>Bogotá Centro</p>
                          <p>
                            <b>Inicio</b> 27 Junio 2024 - 02:15
                          </p>
                          <p>
                            <b>Inicio</b> 28 Junio 2024 - 14:30
                          </p>
                        </Col>
                        <Col span={4} style={{ textAlign: "right" }}>
                          <p>
                            <button
                              className="active"
                              style={{ width: "24px", border: "none", borderRadius: "5px" }}
                            >
                              1
                            </button>{" "}
                          </p>
                          <p>&nbsp;</p>
                          <p>&nbsp;</p>
                          <p>
                            <Pencil style={{ fontSize: "20px" }} />
                            <Trash style={{ fontSize: "20px" }} />
                          </p>
                        </Col>
                      </Row>
                    </Card>
                    <div className="carddivider"></div>
                    <Card style={{ width: "100%", padding: "0px" }}>
                      <Row>
                        <Col span={2}>
                          <DotsSixVertical style={{ fontSize: "20px" }} />
                        </Col>
                        <Col span={18}>
                          <p>Carga</p>
                          <p>Bogotá Centro</p>
                          <p>Cajica Plaza</p>
                          <p>
                            <b>Inicio</b> 27 Junio 2024 - 02:15
                          </p>
                          <p>
                            <b>Inicio</b> 28 Junio 2024 - 14:30
                          </p>
                        </Col>
                        <Col span={4} style={{ textAlign: "right" }}>
                          <p>
                            <button
                              className="active"
                              style={{ width: "24px", border: "none", borderRadius: "5px" }}
                            >
                              2
                            </button>{" "}
                          </p>
                          <p>&nbsp;</p>
                          <p>&nbsp;</p>
                          <p>&nbsp;</p>
                          <p>
                            <Pencil style={{ fontSize: "20px" }} />
                            <Trash style={{ fontSize: "20px" }} />
                          </p>
                        </Col>
                      </Row>
                    </Card>
                  </Drawer>
                  <Modal
                    width={"60%"}
                    footer=""
                    open={isModalOpen}
                    onOk={() => {
                      setIsModalOpen(false);
                    }}
                    onCancel={() => {
                      setIsModalOpen(false);
                    }}
                  >
                    <FormWizard
                      shape="circle"
                      color="#e74c3c"
                      stepSize="xs"
                      onComplete={handleComplete}
                      onTabChange={tabChanged}
                      nextButtonText="Siguiente"
                      backButtonText="Anterior"
                      finishButtonText="Finalizar"
                    >
                      <FormWizard.TabContent title="Tipo de Viaje" icon="ti-user">
                        <Title className="collapseByAction__label__text" level={4}>
                          Tipo de Viaje
                        </Title>
                        <Flex gap="middle">
                          <button
                            type="button"
                            id={"1"}
                            className={[
                              "tripTypes",
                              typeactive === "1" ? "active" : undefined
                            ].join(" ")}
                            onClick={handleTypeClick}
                          >
                            <div className="tripTypeIcons">
                              <img
                                className="icon"
                                loading="lazy"
                                alt=""
                                src="/images/logistics/truck.svg"
                              />
                              <div className="text">Carga</div>
                            </div>
                          </button>
                          <button
                            type="button"
                            id={"2"}
                            className={[
                              "tripTypes",
                              typeactive === "2" ? "active" : undefined
                            ].join(" ")}
                            onClick={handleTypeClick}
                          >
                            <div className="tripTypeIcons">
                              <img
                                className="icon"
                                loading="lazy"
                                alt=""
                                src="/images/logistics/izaje.svg"
                              />
                              <div className="text">Izaje</div>
                            </div>
                          </button>
                          <button
                            type="button"
                            id={"3"}
                            className={[
                              "tripTypes",
                              typeactive === "3" ? "active" : undefined
                            ].join(" ")}
                            onClick={handleTypeClick}
                          >
                            <div className="tripTypeIcons">
                              <img
                                className="icon"
                                loading="lazy"
                                alt=""
                                src="/images/logistics/users.svg"
                              />
                              <div className="text">Personal</div>
                            </div>
                          </button>
                        </Flex>
                      </FormWizard.TabContent>
                      <FormWizard.TabContent title="Agendamiento" icon="ti-settings">
                        <>
                          <Title className="collapseByAction__label__text" level={4}>
                            Agendamiento
                          </Title>
                          <Row>
                            <Col span={24} style={{ padding: "25px" }}>
                              <Row>
                                <label className="locationLabels">Punto Origen</label>
                                <br></br>

                                <Select
                                  showSearch
                                  placeholder="Buscar dirección inicial"
                                  className="puntoOrigen"
                                  style={{ width: "100%" }}
                                  onChange={onChangeOrigin}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option!
                                      .children!.toString()
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {locationOptions.map(
                                    (option: {
                                      value: React.Key | null | undefined;
                                      label: string | null | undefined;
                                    }) => (
                                      <Select.Option value={option.value} key={option.value}>
                                        {option.label}
                                      </Select.Option>
                                    )
                                  )}
                                </Select>
                              </Row>
                              {typeactive != "2" && (
                                <Row style={{ marginTop: "1rem" }}>
                                  <label className="locationLabels">Punto Destino</label>
                                  <Select
                                    showSearch
                                    placeholder="Buscar dirección final"
                                    className="puntoOrigen"
                                    style={{ width: "100%" }}
                                    onChange={onChangeDestino}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      option!
                                        .children!.toString()
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                    }
                                  >
                                    {locationOptions.map(
                                      (option: {
                                        value: React.Key | null | undefined;
                                        label: string | null | undefined;
                                      }) => (
                                        <Select.Option value={option.value} key={option.value}>
                                          {option.label}
                                        </Select.Option>
                                      )
                                    )}
                                  </Select>
                                </Row>
                              )}
                              <Row style={{ marginTop: "1.5rem" }}>
                                <Col span={24}>
                                  <label className="locationLabels">Fecha y hora inicial</label>
                                </Col>
                                <Col span={8}>
                                  <DatePicker
                                    placeholder="Seleccione fecha"
                                    onChange={(value, dateString) => {
                                      //console.log('Selected Time: ', value);
                                      //console.log('Formatted Selected Time: ', dateString);
                                      setFechaInicial(value);
                                    }}
                                  />
                                </Col>
                                <Col span={8}>
                                  <TimePicker
                                    placeholder="Seleccione hora"
                                    format={"HH:mm"}
                                    minuteStep={15}
                                    hourStep={1}
                                    needConfirm={false}
                                    type={"time"}
                                    onChange={(value) => {
                                      console.log(value);
                                      setHoraInicial(value);
                                    }}
                                  />
                                </Col>
                                <Col span={8}>
                                  <Select
                                    placeholder="Seleccione"
                                    className="puntoOrigen"
                                    style={{ width: "100%" }}
                                    options={[{ value: "2", label: "Exacto" }]}
                                  />
                                </Col>
                              </Row>
                              <Row style={{ marginTop: "1.5rem" }}>
                                <Col span={24}>
                                  <label className="locationLabels">Fecha y hora final</label>
                                </Col>
                                <Col span={8}>
                                  <DatePicker
                                    placeholder="Seleccione fecha"
                                    onChange={(value, dateString) => {
                                      console.log("Selected Time: ", value);
                                      console.log("Formatted Selected Time: ", dateString);
                                    }}
                                  />
                                </Col>
                                <Col span={8}>
                                  <TimePicker
                                    placeholder="Seleccione hora"
                                    format={"HH:mm"}
                                    minuteStep={15}
                                    hourStep={1}
                                    needConfirm={false}
                                    type={"time"}
                                    onChange={(value) => console.log(value)}
                                  />
                                </Col>
                                <Col span={8}>
                                  <Select
                                    placeholder="Seleccione"
                                    className="puntoOrigen"
                                    style={{ width: "100%" }}
                                    options={[{ value: "2", label: "Exacto" }]}
                                  />
                                </Col>
                              </Row>
                              {routeGeometry && (
                                <Row className="divdistance">
                                  <Col span={12}>
                                    <p>
                                      <label>Distancia Total</label>
                                    </p>
                                    <p>
                                      <label>Tiempo Estimado</label>
                                    </p>
                                  </Col>
                                  <Col span={12} className="text-right">
                                    <p>
                                      <label>{formatNumber(distance)} km</label>
                                    </p>
                                    <p>
                                      <label>{timetravel}</label>
                                    </p>
                                  </Col>
                                </Row>
                              )}
                            </Col>
                            <Col span={24}>
                              <div
                                ref={mapContainerRef}
                                style={{
                                  width: "100%",
                                  height: "30vh",
                                  border: "1px #F7F7F7 solid"
                                }}
                              />
                            </Col>
                          </Row>
                        </>
                      </FormWizard.TabContent>
                      <FormWizard.TabContent title="Responsables" icon="ti-check">
                        <>
                          <Title className="collapseByAction__label__text" level={4}>
                            Responsables
                          </Title>
                          <label
                            className="locationLabels"
                            style={{ display: "flex", marginTop: "2rem" }}
                          >
                            <text>Company Code</text>
                          </label>
                          <Select
                            style={{ width: "350px" }}
                            options={[
                              { value: "1", label: "Halliburton" },
                              { value: "2", label: "Halliburton zona franca" }
                            ]}
                          />
                          <div className="divdistance">
                            <Row>
                              <Col span={10}>
                                <label
                                  className="locationLabels"
                                  style={{ display: "flex", marginTop: "2rem" }}
                                >
                                  <text>Product Service Line (PSL)</text>
                                </label>
                                <Select
                                  style={{ width: "100%" }}
                                  options={[{ value: "1", label: "PSL 1" }]}
                                />
                              </Col>
                              <Col span={8} style={{ paddingLeft: "30px" }}>
                                <label
                                  className="locationLabels"
                                  style={{ display: "flex", marginTop: "2rem" }}
                                >
                                  <text>Porcentaje PSL</text>
                                </label>
                                <InputNumber<number>
                                  style={{ width: "100%" }}
                                  defaultValue={100}
                                  min={0}
                                  max={100}
                                  formatter={(value) => `${value}%`}
                                  parser={(value) => value?.replace("%", "") as unknown as number}
                                />
                              </Col>
                            </Row>
                            <Row>
                              <Col span={10} style={{ paddingLeft: "30px" }}>
                                <label
                                  className="locationLabels"
                                  style={{ display: "flex", marginTop: "2rem" }}
                                >
                                  <text>Centro de costos</text>
                                </label>
                                <Select
                                  style={{ width: "100%" }}
                                  options={[{ value: "1", label: "Centro de costos 1" }]}
                                />
                              </Col>
                              <Col span={8} style={{ paddingLeft: "30px" }}>
                                <label
                                  className="locationLabels"
                                  style={{ display: "flex", marginTop: "2rem" }}
                                >
                                  <text>Porcentaje CC</text>
                                </label>
                                <InputNumber<number>
                                  style={{ width: "100%" }}
                                  defaultValue={100}
                                  min={0}
                                  max={100}
                                  formatter={(value) => `${value}%`}
                                  parser={(value) => value?.replace("%", "") as unknown as number}
                                />
                              </Col>
                              <Col span={6} style={{ textAlign: "center" }}>
                                <p>&nbsp;</p>
                                <p>&nbsp;</p>
                                <PlusCircle></PlusCircle>
                                <text>Agregar centro de costos</text>
                              </Col>
                            </Row>
                          </div>
                          <Row>
                            <Col span={24} className="text-right">
                              <PlusCircle></PlusCircle>
                              <text>Agregar PSL</text>
                            </Col>
                          </Row>
                        </>
                      </FormWizard.TabContent>
                      <FormWizard.TabContent title="Informacion Adicional" icon="ti-check">
                        <>
                          <Title className="collapseByAction__label__text" level={4}>
                            Informacion Adicional
                          </Title>
                          <label
                            className="locationLabels"
                            style={{ display: "flex", marginTop: "2rem" }}
                          >
                            <text>Documentos</text>
                          </label>
                          <Row className="mainUploadDocuments">
                            {mockFiles.map((file, index) => (
                              // eslint-disable-next-line react/jsx-key
                              <Col span={24} style={{ padding: "15px" }} key={index}>
                                <UploadDocumentButton
                                  key={file.id}
                                  title={file.title}
                                  isMandatory={file.isMandatory}
                                  setFiles={setFiles}
                                />
                              </Col>
                            ))}
                          </Row>
                          <Row>
                            <Col span={24} className="text-right">
                              <PlusCircle></PlusCircle>
                              <text>Agregar otro documento</text>
                            </Col>
                          </Row>
                          <Row>
                            <Col span={24}>
                              <label
                                className="locationLabels"
                                style={{ display: "flex", marginTop: "2rem" }}
                              >
                                <text>Instrucciones especiales</text>
                              </label>
                              <TextArea rows={4} />
                            </Col>
                          </Row>
                          <Row>
                            <Col span={24}>
                              <label
                                className="locationLabels"
                                style={{ display: "flex", marginTop: "2rem" }}
                              >
                                <text>Datos de Contacto</text>
                              </label>
                              <Row style={{ paddingLeft: "30px" }}>
                                <Col span={24}>
                                  <label
                                    className="locationLabels"
                                    style={{ display: "flex", marginTop: "2rem" }}
                                  >
                                    <text>Contacto punto origen</text>
                                  </label>
                                  <Row>
                                    <Col span={12} style={{ paddingRight: "15px" }}>
                                      <Input placeholder="Nombre del contacto" />
                                    </Col>
                                    <Col span={12} style={{ paddingLeft: "15px" }}>
                                      <Input placeholder="Teléfono: 000 000 0000 " />
                                    </Col>
                                  </Row>
                                </Col>
                                <Col span={24}>
                                  <label
                                    className="locationLabels"
                                    style={{ display: "flex", marginTop: "2rem" }}
                                  >
                                    <text>Contacto punto origen</text>
                                  </label>
                                  <Row>
                                    <Col span={12} style={{ paddingRight: "15px" }}>
                                      <Input placeholder="Nombre del contacto" />
                                    </Col>
                                    <Col span={12} style={{ paddingLeft: "15px" }}>
                                      <Input placeholder="Teléfono: 000 000 0000 " />
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                              <Row style={{ marginTop: "2rem" }}>
                                <Col span={24} className="text-right">
                                  <PlusCircle></PlusCircle>
                                  <text>Agregar otro contacto</text>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        </>
                      </FormWizard.TabContent>
                    </FormWizard>
                    {/* add style */}
                    <style>{`
                            @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
                        `}</style>
                  </Modal>
                </Col>
              </Row>
              <Row style={{ width: "100%" }}>
                <Col>
                  <Tabs defaultActiveKey="1">
                    <TabPane key={"1"} tab={<h4>0000001</h4>}>
                      <Row style={{ width: "100%" }}>
                        <Col span={24} style={{ marginBottom: "1.5rem" }}></Col>

                        <Col span={24}>
                          <Collapse
                            className="collapseByAction"
                            expandIconPosition="end"
                            accordion={false}
                            ghost
                            items={actionsOptions}
                            defaultActiveKey={["2"]}
                          />
                        </Col>
                        <Col
                          span={6}
                          offset={18}
                          className="text-right"
                          style={{ marginTop: "2rem", marginBottom: "2rem" }}
                        >
                          <Flex gap="middle" align="flex-end">
                            <Button type="primary">Guardar como drfat</Button>
                            <Button disabled>Siguiente</Button>
                          </Flex>
                        </Col>
                      </Row>
                    </TabPane>
                  </Tabs>
                </Col>
              </Row>
            </Col>
          </Row>
        </Flex>
      </main>
    </>
  );
};
