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
  Modal,
  Spin
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
  IListData,
  ILocation,
  IMaterial,
  ITransferOrderRequest,
  ITransferOrderRequestMaterials,
  ITransferOrderRequestVehiclesAsignation,
  ITransferOrdersRequest
} from "@/types/logistics/schema";

//locations
import { getAllLocations } from "@/services/logistics/locations";

//interfaces
import { ICreatePayload } from "@/types/projects/IProjects";

//vars
import { CREATED } from "@/utils/constants/globalConstants";
import { useRouter as useNextRouter } from "next/router";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  PlusCircle,
  Calendar,
  Package,
  UserList,
  NewspaperClipping,
  Pencil,
  Trash,
  DotsSixVertical,
  CaretDoubleRight,
  Radioactive,
  Warning,
  Truck,
  Check,
  CraneTower,
  Users,
  Eye,
  CheckCircle
} from "@phosphor-icons/react";

import "../../../../../styles/_variables_logistics.css";

import "./createtransferrequest.scss";
import { UploadDocumentButton } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import TextArea from "antd/es/input/TextArea";
import TabPane from "antd/es/tabs/TabPane";

import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";
import { formatDatePlaneWithoutComma } from "@/utils/utils";
import { useTransferRequest } from "../../hooks/useTransferRequest";
import { transferOrderMerge } from "@/services/logistics/transfer-request";

const { Title, Text } = Typography;

interface CreateTransferOrderRequestProps {
  params: { id: string };
}

export const CreateTransferRequest = ({ params }: CreateTransferOrderRequestProps) => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  /* Data first page*/
  const [ordersId, setOrdersId] = useState<number[]>([]);
  const [orders, setOrders] = useState<ITransferOrdersRequest>();
  const [orderRequest, setOrderRequest] = useState<ITransferOrderRequest>();
  const [dataCarga, setDataCarga] = useState<IMaterial[]>([]);

  /*Data second page */
  const [vehiclesSelection, setVehiclesSelection] =
    useState<ITransferOrderRequestVehiclesAsignation>();

  /* Tipo de viaje */
  const [typeactive, setTypeActive] = useState("1");

  /* Agendamiento */
  const origin = useRef<any>([]);
  const destination = useRef<any>([]);
  const [origenIzaje, setOrigenIzaje] = useState(false);
  const [destinoIzaje, setDestinoIzaje] = useState(false);
  const [fechaInicial, setFechaInicial] = useState<Dayjs | null>(null);
  const [horaInicial, setHoraInicial] = useState<Dayjs | null>(null);

  const optionsFlexible = [
    { value: 0, label: "Exacto" },
    { value: 1, label: "+/- 1 día" },
    { value: 2, label: "+/- 2 días" },
    { value: 3, label: "+/- 3 días" }
  ];

  /*Steps */
  const [view, setView] = useState<"solicitation" | "vehicles" | "carrier">("solicitation");
  const [isNextStepActive, setIsNextStepActive] = useState<boolean>(true);
  const steps = [
    { title: "Solicitud de transferencia" },
    { title: "Seleccion de vehiculos" },
    { title: "Seleccion de proveedor" }
  ];
  const currentStepIndex = view === "solicitation" ? 0 : view === "vehicles" ? 1 : 2;

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
  //const directions = routeInfo.length > 0 ? routeInfo[0]["legs"][0]["steps"] : [];

  /*Service loader */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const decodedParam = params ? decodeURIComponent(params.id) : "";
    const numbers = decodedParam ? decodedParam.split(",").map(Number) : [];
    setOrdersId(numbers);
  }, [params]);

  useEffect(() => {
    if (ordersId.length > 0) {
      loadRequests();
    }
  }, [ordersId]);

  const loadRequests = async () => {
    setIsLoading(true);
    const res = await transferOrderMerge(ordersId);
    if (res.success) {
      setOrders(res.data);
    } else {
      messageApi.open({ content: res.message, type: "error" });
      router.push("/logistics/orders");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!!ordersId && !!orders) {
      orders.orders.find((a) => a.id === ordersId[0]) &&
        setOrderRequest(orders.orders.find((a) => a.id === ordersId[0]));
    }
  }, [ordersId, orders]);

  useEffect(() => {
    if (view === "vehicles") {
      setIsNextStepActive(false);
    }
  }, [isNextStepActive]);

  const onTabSelect = (id: string) => {
    setOrderRequest(orders?.orders.find((a) => a.id === Number(id)));
  };

  const handleToggleExpand = () => {
    setExpand(!expand);
  };

  const geocodingClient = MapboxGeocoding({
    accessToken: mapsAccessToken
  });

  const [openDrawer, setOpenDrawer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* MAPBOX */

  useEffect(() => {
    if (orderRequest !== undefined) {
      const routes = orderRequest?.geometry;
      setRouteInfo(routes);
      // Check if any routes are returned
      if (routes != undefined) {
        origin.current = [
          orderRequest?.start_location?.longitude,
          orderRequest?.start_location?.latitude
        ];
        destination.current = [
          orderRequest?.end_location?.longitude,
          orderRequest?.end_location?.latitude
        ];
        const { distance, duration, geometry } = routes[0];
        setRouteGeometry(geometry); // Set the route geometry
        setDistance(parseFloat((distance / 1000).toFixed(0)) + " Km");
        var date = new Date();
        date.setSeconds(duration);
        var hrs = date.toISOString().substr(11, 5);
        setTimeTravel(hrs);
      }
    }

    orderRequest?.transfer_order_material?.forEach(async (mat) => {
      mat?.material?.forEach(async (m) => {
        const newvalue: IMaterial = m;
        newvalue.quantity = mat.quantity;
        console.log(newvalue);
        await setDataCarga((dataCarga) => [...dataCarga, newvalue]);
      });
    });

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
  }, [mapStyle, routeGeometry, origin, destination, orderRequest]);

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

  /*Steps funcionality */

  const handleNext = async () => {
    if (view === "solicitation") {
      setView("vehicles");
    } else if (view === "vehicles") {
      setView("carrier");
    }
  };

  const handleBack = () => {
    if (view === "carrier") {
      setView("vehicles");
    } else if (view === "vehicles") {
      setView("solicitation");
    } else router.push("/logistics/orders");
  };

  /* Carga */

  const columnsCarga: TableProps<any>["columns"] = [
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "name",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.quantity - b.quantity,
      showSorterTooltip: false
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "age",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false
    },
    {
      title: "Nombre",
      dataIndex: "description",
      key: "address",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.description.localeCompare(b.description),
      showSorterTooltip: false
    },
    {
      title: "Volumen",
      dataIndex: "m3_volume",
      key: "address",
      render: (amount) => <Text>{amount}</Text>,
      sorter: (a, b) => a.m3_volume - b.m3_volume,
      showSorterTooltip: false
    },
    {
      title: "Alto",
      dataIndex: "mt_height",
      key: "address",
      render: (amount) => <Text>{amount} m</Text>,
      sorter: (a, b) => a.mt_height - b.mt_height,
      showSorterTooltip: false
    },
    {
      title: "Ancho",
      key: "address",
      dataIndex: "mt_length",
      render: (amount) => <Text>{amount} m</Text>,
      sorter: (a, b) => a.mt_length - b.mt_length,
      showSorterTooltip: false
    },
    {
      title: "Largo",
      key: "address",
      dataIndex: "mt_width",
      render: (amount) => <Text>{amount} m</Text>,
      sorter: (a, b) => a.mt_width - b.mt_width,
      showSorterTooltip: false
    },
    {
      title: "Peso",
      key: "address",
      dataIndex: "kg_weight",
      render: (amount) => <Text>{amount} kg</Text>,
      sorter: (a, b) => a.kg_weight - b.kg_weight,
      showSorterTooltip: false
    },
    {
      title: "Alertas",
      dataIndex: "address",
      key: "address",
      render: (text, record) => (
        <Flex style={{ gap: "6px", justifyContent: "flex-end" }}>
          <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Radioactive size={"1.3rem"} />} />
          <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Warning size={"1.3rem"} />} />
        </Flex>
      )
    }
  ];

  const columnsCargaPersonas: TableProps<any>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      showSorterTooltip: false
    },
    {
      title: "Telefono",
      dataIndex: "phone",
      key: "phone",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.contact_number - b.contact_number,
      showSorterTooltip: false
    },
    {
      title: "PSL",
      dataIndex: "psl",
      key: "psl",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.id_psl - b.id_psl,
      showSorterTooltip: false
    },
    {
      title: "CC",
      dataIndex: "typeid",
      key: "typeid",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.id_contact - b.id_contact,
      showSorterTooltip: false
    }
  ];

  const columnsVehiclesMaterial: TableProps<IMaterial>["columns"] = [
    {
      title: "CR",
      dataIndex: "quantity",
      key: "quantity",
      render: (total) => <Text>{total}</Text>,
      sorter: (a, b) => a.quantity - b.quantity,
      showSorterTooltip: false
    },
    {
      title: "Cantidad en el trayecto",
      dataIndex: "",
      key: "",
      render: () => <Text>a</Text>,
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false
    },
    {
      title: "SKU",
      key: "sku",
      dataIndex: "sku",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.quantity - b.quantity,
      showSorterTooltip: false
    },
    {
      title: "Nombre",
      key: "name",
      dataIndex: "description",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.description.localeCompare(b.description),
      showSorterTooltip: false
    },
    {
      title: "Dimensiones",
      key: "dimensions",
      dataIndex: ["mt_height", "mt_length", "mt_width"],
      render: (text, record) => (
        <>
          <Text>W {record.mt_width}</Text>
          <Text>H {record.mt_height}</Text>
          <Text>D {record.mt_length}</Text>
        </>
      ),
      sorter: (a, b) => a.mt_width - b.mt_width,
      showSorterTooltip: false
    },
    {
      title: "Volumen",
      key: "m3_volume",
      dataIndex: "m3_volume",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => Number(a.m3_volume) - Number(b.m3_volume),
      showSorterTooltip: false
    },
    {
      title: "Peso",
      key: "kg_weight",
      dataIndex: "kg_weight",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.kg_weight - b.kg_weight,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "",
      key: "buttonSee",
      width: 64,
      dataIndex: "id",
      render: (id) => (
        <Flex style={{ gap: "6px", justifyContent: "flex-end" }}>
          <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Warning size={"1.3rem"} />} />
          <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Eye size={"1.3rem"} />} />
        </Flex>
      )
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

  /*Acoordion selection */
  const actionsOptions = [
    {
      key: 0,
      style: { border: "1px solid #dddddd", borderRadius: "4px" },
      label: (
        <div className="collapseByAction__label">
          <Title className="collapseByAction__label__text" level={4}>
            Datos del viaje
          </Title>
        </div>
      ),
      children: (
        <Flex vertical className="travelDataWrapper">
          <Flex>
            <Row style={{ width: "100%" }}>
              <Col span={12} style={{ width: "100%" }}>
                <Flex vertical style={{ width: "90%" }}>
                  <Row className="travelDataInfoBox">
                    <Col span={12} className="travelDataTitles">
                      <p>
                        <label>Distancia Total</label>
                      </p>
                      <p>
                        <label>Tiempo Estimado</label>
                      </p>
                      {orderRequest?.id_service_type !== 3 ? (
                        <>
                          <p>
                            <label>Volumen</label>
                          </p>
                          <p>
                            <label>Peso</label>
                          </p>
                        </>
                      ) : (
                        <p>Personas</p>
                      )}
                    </Col>
                    <Col span={12} className="travelDataValues">
                      <p>
                        <label>{distance}</label>
                      </p>
                      <p>
                        <label>{timetravel} hr</label>
                      </p>
                      {orderRequest?.id_service_type !== 3 ? (
                        <>
                          <p>
                            <label>{/*travelData?.volume*/}00</label>
                          </p>
                          <p>
                            <label>{/*travelData?.weight*/}00</label>
                          </p>
                        </>
                      ) : (
                        <p>{orderRequest?.transfer_order_persons?.length}</p>
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12} style={{ paddingTop: "0.5rem" }}>
                      <p style={{ paddingTop: "1rem" }}>
                        <label>
                          <b>Tipo de viaje</b>
                        </label>
                      </p>
                    </Col>
                    <Col span={12} style={{ paddingTop: "0.5rem", textAlign: "right" }}>
                      <p style={{ paddingTop: "1rem" }}>
                        <label>
                          <b>{orderRequest?.service_type_desc}</b>
                        </label>
                      </p>
                    </Col>
                    <Col span={24} style={{ paddingTop: "1rem" }}>
                      <hr style={{ borderTop: "1px solid #f7f7f7" }}></hr>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12} style={{ paddingTop: "0.5rem" }}>
                      <p style={{ paddingTop: "1rem" }}>
                        <b>Punto Origen</b>
                      </p>
                    </Col>
                    <Col span={12} style={{ paddingTop: "0.5rem", textAlign: "right" }}>
                      <p style={{ paddingTop: "0.5rem" }}>
                        <label>
                          <b>{orderRequest?.start_location?.description}</b>
                        </label>
                      </p>
                    </Col>
                    <Col span={24} style={{ paddingTop: "1rem" }}>
                      <hr style={{ borderTop: "1px solid #f7f7f7" }}></hr>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12} style={{ paddingTop: "0.5rem" }}>
                      <p style={{ paddingTop: "1rem" }}>
                        <label>
                          <b>Punto Destino</b>
                        </label>
                      </p>
                    </Col>
                    <Col span={12} style={{ paddingTop: "0.5rem", textAlign: "right" }}>
                      <p style={{ paddingTop: "0.5rem" }}>
                        <label>
                          <b>{orderRequest?.end_location?.description}</b>
                        </label>
                      </p>
                    </Col>
                    <Col span={24} style={{ paddingTop: "1rem" }}>
                      <hr style={{ borderTop: "1px solid #f7f7f7" }}></hr>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12} style={{ paddingTop: "0.5rem" }}>
                      <p style={{ paddingTop: "1rem" }}>
                        <label>
                          <b>Fecha y hora inicial</b>
                        </label>
                      </p>
                      <p style={{ paddingTop: "0.5rem" }}>
                        <label>
                          <b>
                            {
                              optionsFlexible.find(
                                (x) => x.value == orderRequest?.start_date_flexible
                              )?.label
                            }
                          </b>
                        </label>
                      </p>
                    </Col>
                    <Col span={12} style={{ paddingTop: "0.5rem", textAlign: "right" }}>
                      <p style={{ paddingTop: "1rem" }}>
                        <label>
                          <b>{orderRequest?.start_date?.split("T")[1].substring(0, 5)} h</b>
                        </label>
                      </p>
                      <p style={{ paddingTop: "0.5rem" }}>
                        {orderRequest?.start_date ? (
                          <b>
                            {formatDatePlaneWithoutComma(
                              new Date(orderRequest?.start_date?.split("T")[0]).toString()
                            )}
                          </b>
                        ) : (
                          <p>No date</p>
                        )}
                      </p>
                    </Col>
                    <Col span={24} style={{ paddingTop: "1rem" }}>
                      <hr style={{ borderTop: "1px solid #f7f7f7" }}></hr>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12} style={{ paddingTop: "0.5rem" }}>
                      <p style={{ paddingTop: "1rem" }}>
                        <label>
                          <b>Fecha y hora final</b>
                        </label>
                      </p>
                      <p style={{ paddingTop: "0.5rem" }}>
                        <label>
                          <b>
                            {
                              optionsFlexible.find(
                                (x) => x.value == orderRequest?.start_date_flexible
                              )?.label
                            }
                          </b>
                        </label>
                      </p>
                    </Col>
                    <Col span={12} style={{ paddingTop: "0.5rem", textAlign: "right" }}>
                      <p style={{ paddingTop: "1rem" }}>
                        <label>
                          <b>{orderRequest?.end_date?.split("T")[1].substring(0, 5)} h</b>
                        </label>
                      </p>
                      <p style={{ paddingTop: "0.5rem" }}>
                        {orderRequest?.start_date ? (
                          <b>
                            {formatDatePlaneWithoutComma(
                              new Date(orderRequest?.start_date?.split("T")[0]).toString()
                            )}
                          </b>
                        ) : (
                          <p>No date</p>
                        )}
                      </p>
                    </Col>
                  </Row>
                </Flex>
              </Col>
              <Col span={12}>
                <Flex vertical className="travelDataMapResume" style={{ width: "100%" }}>
                  <div
                    ref={mapContainerRef}
                    style={{
                      width: "100%",
                      height: "50vh",
                      border: "1px #F7F7F7 solid"
                    }}
                  />
                </Flex>
              </Col>
            </Row>
          </Flex>
        </Flex>
      )
    },
    {
      key: 1,
      style: { border: "1px solid #dddddd", borderRadius: "4px" },
      label: (
        <div className="collapseByAction__label">
          <Title className="collapseByAction__label__text" level={4}>
            Responsables
          </Title>
        </div>
      ),
      children: (
        <Flex>
          <Row style={{ width: "100%", marginBottom: "18px" }}>
            <Col span={24}>
              <Flex vertical className="productsContainer" style={{ width: "100%" }}>
                <Row>
                  <Col span={12}>
                    <p style={{ paddingTop: "1rem" }}>
                      <label>
                        <b>PSL:</b> Product service line 1
                      </label>
                    </p>
                    <p style={{ paddingTop: "0.5rem" }}>
                      <label>
                        &nbsp;&nbsp;&nbsp;<b>CC:</b> Centro de costos 1
                      </label>
                    </p>
                  </Col>
                  <Col span={12} style={{ paddingTop: "0.5rem", textAlign: "right" }}>
                    <p style={{ paddingTop: "1rem" }}>
                      <label>
                        <b>100%</b>
                      </label>
                    </p>
                    <p style={{ paddingTop: "0.5rem" }}>
                      <label>
                        <b>100%</b>
                      </label>
                    </p>
                  </Col>
                  <Col span={24} style={{ paddingTop: "1rem" }}>
                    <hr style={{ borderTop: "1px solid #f7f7f7" }}></hr>
                  </Col>
                  <Col span={12}>
                    <p style={{ paddingTop: "1rem" }}>
                      <label>
                        <b>PSL:</b> Product service line 1
                      </label>
                    </p>
                    <p style={{ paddingTop: "0.5rem" }}>
                      <label>
                        &nbsp;&nbsp;&nbsp;<b>CC:</b> Centro de costos 1
                      </label>
                    </p>
                  </Col>
                  <Col span={12} style={{ paddingTop: "0.5rem", textAlign: "right" }}>
                    <p style={{ paddingTop: "1rem" }}>
                      <label>
                        <b>100%</b>
                      </label>
                    </p>
                    <p style={{ paddingTop: "0.5rem" }}>
                      <label>
                        <b>100%</b>
                      </label>
                    </p>
                  </Col>
                </Row>
              </Flex>
            </Col>
          </Row>
        </Flex>
      )
    },
    {
      key: 2,
      style: { border: "1px solid #dddddd", borderRadius: "4px" },
      label: (
        <div className="collapseByAction__label">
          <Title className="collapseByAction__label__text" level={4}>
            Información adicional
          </Title>
        </div>
      ),
      children: (
        <Flex style={{ marginBottom: "24px" }}>
          <Row style={{ width: "100%" }}>
            <Col span={24}>
              <Flex vertical style={{ width: "100%", marginTop: "24px" }}>
                <h4 style={{ fontSize: "20px", lineHeight: "32px", fontWeight: "400" }}>
                  Documentos
                </h4>
                <Row className="mainUploadDocuments">
                  {orderRequest?.transfer_order_documents?.map((file) => (
                    <Col span={12} style={{ padding: "15px" }} key={`file-${file.id}`}>
                      <UploadDocumentButton
                        key={file.id}
                        title={file.document_type_desc}
                        isMandatory={!file.active}
                        aditionalData={file.id}
                        setFiles={() => {}}
                        disabled
                      >
                        {file?.url_document ? (
                          <UploadDocumentChild
                            linkFile={file.url_document}
                            nameFile={file.url_document.split("-").pop() || ""}
                            onDelete={() => {}}
                            showTrash={false}
                          />
                        ) : undefined}
                      </UploadDocumentButton>
                    </Col>
                  ))}
                  <Col span={24} style={{ paddingTop: "1rem" }}>
                    <hr style={{ borderTop: "1px solid #f7f7f7" }}></hr>
                  </Col>
                </Row>
                <Row style={{ marginTop: "2rem" }}>
                  <Col span={12}>
                    <h3>Datos de contacto</h3>
                    <p>&nbsp;</p>
                    <h4>Contacto inicial</h4>
                    {orderRequest?.transfer_order_contacts
                      ?.filter((x) => x.contact_type == 1)
                      .map((contact) => (
                        <Row style={{ paddingTop: "0.5rem" }} key={contact.id}>
                          <Col span={12} style={{ paddingLeft: "25px" }}>
                            {contact.name}
                          </Col>
                          <Col span={8} style={{ textAlign: "right" }}>
                            {contact.contact_number}
                          </Col>
                        </Row>
                      ))}
                    <p>&nbsp;</p>
                    <h4>Contacto final</h4>
                    {orderRequest?.transfer_order_contacts
                      ?.filter((x) => x.contact_type == 2)
                      .map((contact) => (
                        <Row style={{ paddingTop: "0.5rem" }} key={contact.id}>
                          <Col span={12} style={{ paddingLeft: "25px" }}>
                            {contact.name}
                          </Col>
                          <Col span={8} style={{ textAlign: "right" }}>
                            {contact.contact_number}
                          </Col>
                        </Row>
                      ))}
                    <p>&nbsp;</p>
                    <Row style={{ paddingTop: "1rem" }}>
                      <Col span={12}>
                        <h4>Cliente final</h4>
                      </Col>
                      <Col span={8} style={{ textAlign: "right" }}>
                        {orderRequest?.client_desc}
                      </Col>
                    </Row>
                    <p>&nbsp;</p>
                    <h4>Requerimientos adicionales</h4>
                    <Row style={{ paddingTop: "1rem" }}>
                      <Col span={24}>
                        {orderRequest?.transfer_order_other_requeriments?.map((req) => (
                          <div className="selected" key={req.id}>
                            {req.other_requirement_desc} <small>{req.quantity}</small>
                          </div>
                        ))}
                      </Col>
                    </Row>
                  </Col>
                  <Col span={12}>
                    <h3>Instrucciones especiales</h3>
                    <p>&nbsp;</p>
                    <p style={{ minHeight: "250px" }}>{orderRequest?.observation}</p>
                  </Col>
                </Row>
              </Flex>
            </Col>
          </Row>
        </Flex>
      )
    },
    {
      key: 3,
      style: { border: "1px solid #dddddd", borderRadius: "4px" },
      label: (
        <div className="collapseByAction__label">
          <Title className="collapseByAction__label__text" level={4}>
            {(orderRequest?.id_service_type == 1 || orderRequest?.id_service_type == 2) &&
              `Materiales`}
            {orderRequest?.id_service_type == 3 && `Personas`}
          </Title>
        </div>
      ),
      children: (
        <div>
          <div>
            <label className="locationLabels" style={{ display: "flex" }}>
              <text>Vehículo Sugerido</text>
            </label>
            {orderRequest?.transfer_order_vehicles ? (
              orderRequest?.transfer_order_vehicles.map((a) => (
                <div className="vehicles_sugested" key={a.id}>
                  {a.vehicle_type_desc}
                </div>
              ))
            ) : (
              <p></p>
            )}
          </div>
          {(orderRequest?.id_service_type == 1 || orderRequest?.id_service_type == 2) && (
            <>
              <Table columns={columnsCarga} dataSource={dataCarga} pagination={false} />
            </>
          )}
          {orderRequest?.id_service_type == 3 && (
            <>
              <Table
                columns={columnsCargaPersonas}
                dataSource={
                  orderRequest.transfer_order_persons ? orderRequest.transfer_order_persons : []
                }
              />
            </>
          )}
        </div>
      )
    }
  ];

  /*Acordion to vehicles selection */
  const actionsOptionsVehiclesSelection = [
    {
      key: 0,
      style: { border: "1px solid #dddddd", borderRadius: "4px" },
      label: (
        <Flex className="collapseByActionVehicles__label">
          <Flex style={{ paddingTop: "1rem" }}>
            <Flex>
              <div className="serviceTypeLabel">
                {vehiclesSelection?.stepOne.transferRequest.map((a) =>
                  a.id_service_type === 0 ? <Truck /> : <CraneTower />
                )}{" "}
                <Truck /> Camion C-100
              </div>
            </Flex>
            {vehiclesSelection?.stepOne.transferRequest.map(
              (a) =>
                a.id_service_type === 0 && (
                  <Flex>
                    <Users />
                  </Flex>
                )
            )}
            <Flex>
              <CheckCircle color="#CBE71E" />
            </Flex>
          </Flex>
          <Flex>
            <Flex>
              <Flex>
                <div>Origen</div>
                <div>Centro empresarial dorado plaza</div>
              </Flex>
            </Flex>
            {vehiclesSelection?.stepOne.transferRequest.map(
              (a) =>
                a.id_service_type === 0 && (
                  <>
                    <hr style={{ borderTop: "1px solid #DDDDD" }} />
                    <Flex>
                      <Flex>
                        <div>Destino</div>
                        <div>Base barrancabermeja</div>
                      </Flex>
                    </Flex>
                  </>
                )
            )}
            <hr style={{ borderTop: "1px solid #DDDDD" }} />
            <Col>
              <Flex>
                <div>Destino</div>
                <div>Base barrancabermeja</div>
              </Flex>
            </Col>
          </Flex>
        </Flex>
      ),
      children: (
        <Flex className="informationContainer">
          {/*Top section */}
          <Flex className="topSection">
            <div>Input</div>
            <Trash />
          </Flex>
          <Flex>
            <div>Volumen utilizado</div>
            <div>40%</div>
          </Flex>
          <hr style={{ borderTop: "1px solid #DDDDD" }} />
          <Flex>
            <div>Volumen máximo</div>
            <div>00 m3</div>
          </Flex>
          <hr style={{ borderTop: "1px solid #DDDDD" }} />
          <Flex>
            <div>Peso utilizado</div>
            <div>10%</div>
          </Flex>
          <hr style={{ borderTop: "1px solid #DDDDD" }} />
          <Flex>
            <div>Peso máximo</div>
            <div>00 kg</div>
          </Flex>
          {/*Second section */}
          <Flex>
            <div>Input</div>
            <Trash />
          </Flex>
          <Flex>
            <div>Volumen productos</div>
            <div>00</div>
          </Flex>
          <hr style={{ borderTop: "1px solid #DDDDD" }} />
          <Flex>
            <div>Peso productos</div>
            <div>00 kg</div>
          </Flex>
          <hr style={{ borderTop: "1px solid #DDDDD" }} />
          <Flex>
            <div>Productos</div>
            <div>20/40</div>
          </Flex>
          <hr style={{ borderTop: "1px solid #DDDDD" }} />
          <Flex>
            <Button disabled>Embalaje</Button>
          </Flex>
          <Table columns={columnsVehiclesMaterial} dataSource={dataCarga} pagination={false} />
          {/**Buttons */}
          <Flex>
            <Button>Agregar vehíchulo</Button>
            <Button>Guardar</Button>
          </Flex>
        </Flex>
      )
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
      <Flex className="mainCreateOrder">
        <Row className="orderContainer">
          <Col>
            <Row style={{ width: "100%", justifyContent: "center" }}>
              <Col span={16} style={{ padding: "16px 0" }}>
                <Flex className="stepper">
                  <Col span={16}>
                    <Flex justify="space-evenly" style={{ width: "100%" }}>
                      {steps.map((step, index) => {
                        const isCurrentStep = index === currentStepIndex;
                        const isCompletedStep = index < currentStepIndex;
                        const stepColor = isCurrentStep
                          ? "#141414"
                          : isCompletedStep
                            ? "#CBE71E"
                            : "#969696";
                        const fontWeight = isCurrentStep ? "bold" : "normal";
                        return (
                          <Flex>
                            <Flex>
                              {index > 0 && <span style={{ margin: "0 8px", width: "" }}>-</span>}
                            </Flex>
                            <Flex key={index} align="center">
                              <Flex align="center">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 24,
                                    height: 24,
                                    borderRadius: "50%",
                                    background: stepColor,
                                    color: "white",
                                    fontWeight: fontWeight
                                  }}
                                >
                                  {isCompletedStep ? index + 1 : index + 1}
                                </div>
                                <div style={{ marginLeft: 8, fontWeight: fontWeight }}>
                                  {step.title}
                                </div>
                              </Flex>
                            </Flex>
                          </Flex>
                        );
                      })}
                    </Flex>
                  </Col>
                </Flex>
              </Col>
            </Row>
            <Row style={{ display: "flex", flexDirection: "column", padding: "32px 0" }}>
              <Col style={{ display: "flex", justifyContent: "space-between" }}>
                <Flex>
                  <Title style={{ fontWeight: "700", fontSize: "24px", lineHeight: "36px" }}>
                    {view === "solicitation"
                      ? "Solicitud de transferencia"
                      : view === "vehicles"
                        ? "Asignación de vehículos"
                        : "Selección de proveedor"}
                  </Title>
                </Flex>
                <Flex>
                  <Button
                    style={{
                      width: "146px",
                      height: "48px",
                      padding: "12px 24px"
                    }}
                    type="default"
                    className="active"
                    onClick={() => {
                      setOpenDrawer(true);
                    }}
                  >
                    <text style={{ fontSize: "16px", lineHeight: "24px", fontWeight: "600" }}>
                      Tracking
                    </text>
                    <CaretDoubleRight size={16} />
                  </Button>
                </Flex>
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
                          className={["tripTypes", typeactive === "1" ? "active" : undefined].join(
                            " "
                          )}
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
                          className={["tripTypes", typeactive === "2" ? "active" : undefined].join(
                            " "
                          )}
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
                          className={["tripTypes", typeactive === "3" ? "active" : undefined].join(
                            " "
                          )}
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
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option!
                                    .children!.toString()
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              ></Select>
                            </Row>
                            {typeactive != "2" && (
                              <Row style={{ marginTop: "1rem" }}>
                                <label className="locationLabels">Punto Destino</label>
                                <Select
                                  showSearch
                                  placeholder="Buscar dirección final"
                                  className="puntoOrigen"
                                  style={{ width: "100%" }}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option!
                                      .children!.toString()
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                ></Select>
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
                                    <label>{distance}</label>
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
                          {mockFiles.map((file) => (
                            // eslint-disable-next-line react/jsx-key
                            <Col span={24} style={{ padding: "15px" }} key={file.id}>
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
            {!!isLoading ? (
              <Spin style={{ display: "flex", justifyContent: "center", marginTop: "10%" }} />
            ) : view === "solicitation" ? (
              <Row style={{ width: "100%", flexDirection: "column" }}>
                <Col>
                  <Tabs defaultActiveKey={String(ordersId[0])} onChange={onTabSelect}>
                    {ordersId.map((a) => (
                      <TabPane key={a} tab={<h4>{a}</h4>}>
                        <Row style={{ width: "100%" }} className="contentRow">
                          <Col span={24} style={{ marginBottom: "1.5rem" }}>
                            <Flex>
                              <h5
                                style={{
                                  fontWeight: "600",
                                  fontSize: "24px",
                                  lineHeight: "32px"
                                }}
                              >
                                {a}
                              </h5>
                            </Flex>
                          </Col>

                          <Col span={24}>
                            <Collapse
                              defaultActiveKey={"0"}
                              className="collapseByAction"
                              style={{ width: "100%" }}
                              expandIconPosition="end"
                              accordion={false}
                              bordered={false}
                              ghost
                              items={actionsOptions}
                            />
                          </Col>
                        </Row>
                      </TabPane>
                    ))}
                  </Tabs>
                </Col>
              </Row>
            ) : view === "vehicles" ? (
              <Row>
                <Col>
                  <Flex>
                    <label>
                      <p>Vehículos sugeridos</p>
                    </label>
                    <Row style={{ paddingTop: "1rem" }}>
                      <Col span={24}>
                        <div className="vehicles">
                          Camion C-100 <small>01</small>
                        </div>
                      </Col>
                      <Col span={24}>
                        <Collapse
                          defaultActiveKey={"0"}
                          className="collapseByAction"
                          style={{ width: "100%" }}
                          expandIconPosition="end"
                          accordion={false}
                          bordered={false}
                          ghost
                          items={actionsOptionsVehiclesSelection}
                        />
                      </Col>
                    </Row>
                  </Flex>
                </Col>
              </Row>
            ) : (
              <p>Seleccion de proveedor</p>
            )}
          </Col>
        </Row>
        <Flex justify="space-between" style={{ marginTop: "24px" }}>
          <Flex align="flex-start">
            <Button className="backButton" onClick={handleBack}>
              Atras
            </Button>
          </Flex>
          <Flex gap="middle" align="flex-end">
            {view === "vehicles" && <Button className="saveButton">Guardar como draft</Button>}
            <Button disabled={!isNextStepActive} className="nextButton" onClick={handleNext}>
              Siguiente
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};
