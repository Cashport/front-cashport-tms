import {
  Flex,
  Typography,
  message,
  Collapse,
  Row,
  Col,
  Select,
  Switch,
  DatePicker,
  TimePicker,
  Table,
  Input,
  InputNumber,
  Button
} from "antd";
import React, { useRef, useEffect, useState } from "react";
import { runes } from "runes2";

// dayjs locale
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
dayjs.locale("es");
dayjs.extend(utc);
dayjs.extend(tz);

// mapbox
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

// components
import { SideBar } from "@/components/molecules/SideBar/SideBar";
import { NavRightSection } from "@/components/atoms/NavRightSection/NavRightSection";

//schemas
import {
  CustomOptionType,
  IClient,
  ICompanyCode,
  IDocumentCompleted,
  IFormTransferOrder,
  ILocation,
  IOrderPsl,
  IOrderPslCostCenter,
  ITransferOrder,
  ITransferOrderContacts,
  PSLOptionType,
  TripType
} from "@/types/logistics/schema";

//locations
import { getAllLocations } from "@/services/logistics/locations";

//materials
import { getAllMaterials } from "@/services/logistics/materials";

//materials
import { getSuggestedVehicles } from "@/services/logistics/vehicles";

//vars
import { SUCCESS } from "@/utils/constants/globalConstants";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Calendar,
  Package,
  UserList,
  NewspaperClipping,
  Trash
} from "@phosphor-icons/react";

import "../../../../../styles/_variables_logistics.css";

import "./createorder.scss";
import {
  FileObject,
  UploadDocumentButton
} from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import TextArea from "antd/es/input/TextArea";
import { addTransferOrder, getAllUsers } from "@/services/logistics/transfer-orders";
import { getOtherRequirements } from "@/services/logistics/other-requirements";
import { getPsl } from "@/services/logistics/psl";
import { auth } from "../../../../../../firebase";
import useSWRInmutable from "swr/immutable";
import { Phone, UserPlus } from "phosphor-react";
import { RangePickerProps } from "antd/es/date-picker";
import ModalAddContact from "@/components/molecules/modals/ModalAddContact/ModalAddContact";
import { getCompanyCodes } from "@/services/logistics/company-codes";
import { getClients } from "@/services/logistics/clients";
import { getTravelDuration } from "@/utils/logistics/maps";
import CustomTimeSelector from "@/components/molecules/logistics/HourPicker/HourPicker";
import { formatNumber } from "@/utils/utils";
import MaterialTableFooter from "./components/MaterialTableFooter/MaterialTableFooter";
import { getCarrierDocumentsByMaterialsAndLocations } from "@/services/logistics/documents_by_materials_locations";
import { useMaterialManagement } from "./controllers/hooks/useMaterialManagment";
import { useVehicleManagement } from "./controllers/hooks/useVehicleManagment";
import { usePersonManagement } from "./controllers/hooks/usePersonManagment";
import createColumnsSuggestedVehicles from "./controllers/vehicles/columns";
import createColumnsMaterials from "./controllers/materials/columns";
import createColumnsPersons from "./controllers/persons/columns";
import { useRequirementManagement } from "./controllers/hooks/useRequirementManagment";
import createOtherRequirementsColumns from "./controllers/otherRequirements/columns";
import Container from "@/components/atoms/Container/Container";

const { Title, Text } = Typography;

export const CreateOrderView = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { push } = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  /* Tipo de viaje */
  const [typeactive, setTypeactive] = useState("1");

  /* Agendamiento */
  const origin = useRef<any>([]);
  const destination = useRef<any>([]);
  const [origenIzaje, setOrigenIzaje] = useState(false);
  const [horasOrigenIzaje, setHorasOrigenIzaje] = useState<number>(0);
  const [horasDestinoIzaje, setHorasDestinoIzaje] = useState<number>(0);
  const [destinoIzaje, setDestinoIzaje] = useState(false);
  const [fechaInicial, setFechaInicial] = useState<Dayjs | undefined>(undefined);
  const [horaInicial, setHoraInicial] = useState<Dayjs>();
  const [fechaFinal, setFechaFinal] = useState<Dayjs | undefined>(undefined);
  const [horaFinal, setHoraFinal] = useState<Dayjs>();
  const [fechaInicialFlexible, setFechaInicialFlexible] = useState<number | null>(null);
  const [fechaFinalFlexible, setFechaFinalFlexible] = useState<number | null>(null);
  const [company, setCompany] = useState(-1);
  const [client, setClient] = useState(-1);
  const [observation, setObservation] = useState<any>(null);

  const [originValid, setOriginValid] = useState(true);
  const [destinationValid, setdestinationValid] = useState(true);
  const [fechaInicialValid, setFechaInicialValid] = useState(true);
  const [horaInicialValid, setHoraInicialValid] = useState(true);
  const [fechaFinalValid, setFechaFinalValid] = useState(true);
  const [horaFinalValid, setHoraFinalValid] = useState(true);
  const [fechaInicialFlexibleValid, setFechaInicialFlexibleValid] = useState(true);
  const [fechaFinalFlexibleValid, setFechaFinalFlexibleValid] = useState(true);

  const [clientValid, setClientValid] = useState(true);
  const [companyValid, setCompanyValid] = useState(true);
  const isButtonSubmitEnabled = !isLoading;

  const disabledDate: RangePickerProps["disabledDate"] = (current: any) => {
    // Can not select days before today
    return current && current < dayjs().startOf("day");
  };

  useEffect(() => {
    if (!destinoIzaje) {
      setHorasDestinoIzaje(0);
    }
    if (!origenIzaje) {
      setHorasOrigenIzaje(0);
    }
  }, [origenIzaje, destinoIzaje]);

  const [isOpenModalContacts, setIsOpenModalContacts] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<IDocumentCompleted[]>([]);
  const [files, setFiles] = useState<FileObject[] | any[]>([]);

  /* MAPBOX */
  const mapsAccessToken =
    "pk.eyJ1IjoiamNib2JhZGkiLCJhIjoiY2x4aWgxejVsMW1ibjJtcHRha2xsNjcxbCJ9.CU7FHmPR635zv6_tl6kafA"; //import.meta.env.VITE_MAP_BOX_ACCESS_TOKEN,

  const mapContainerRef = useRef(null);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/streets-v12");
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState([]);
  const [distance, setDistance] = useState<any>(null);
  const [timetravel, setTimetravel] = useState<any>(null);
  const [timetravelInSecs, setTimetravelInSecs] = useState<number | null>(null);

  const [expand, setExpand] = useState(false);

  const [locations, setLocations] = useState<ILocation[]>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [locationOrigin, setLocationOrigin] = useState<ILocation | null>(null);
  const [locationDestination, setLocationDestination] = useState<ILocation | null>(null);

  const [optionsMaterial, setOptionsMaterial] = useState<CustomOptionType[]>([]);

  const { dataCarga, addMaterial, handleDeleteMaterial, handleQuantityMaterial } =
    useMaterialManagement();

  const { dataVehicles, setDataVehicles, addVehicle, handleDeleteVehicle, handleQuantityVehicle } =
    useVehicleManagement();

  const { dataPersons, setDataPersons, addPerson, handleDeletePerson } = usePersonManagement();

  const { dataRequirements, addRequirement, handleDeleteRequirement, handleQuantityRequirement } =
    useRequirementManagement();

  const shouldFetch =
    typeactive === "3"
      ? locationOrigin && locationDestination
      : locationOrigin && locationDestination && Array.isArray(dataCarga) && dataCarga.length > 0;

  const { data: documentsType, isLoading: isLoadingDocuments } = useSWRInmutable(
    shouldFetch ? ["carrierDocuments", locationOrigin, locationDestination, dataCarga] : null,
    () => getCarrierDocumentsByMaterialsAndLocations(locationOrigin, locationDestination, dataCarga)
  );

  const handleToggleExpand = () => {
    setExpand(!expand);
  };

  const geocodingClient = MapboxGeocoding({
    accessToken: mapsAccessToken
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    if (locations.length > 0) return;
    const result = await getAllLocations();
    if (result?.data?.data?.length > 0) {
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

  const setDefaultDocuments = () => {
    if (Array.isArray(documentsType)) {
      const fileSelected = documentsType?.map((f) => ({
        ...f,
        file: undefined,
        expirationDate: undefined
      }));
      if (fileSelected?.length) {
        setSelectedFiles([...fileSelected]);
      } else {
        setSelectedFiles([]);
      }
    }
  };

  useEffect(() => {
    setDefaultDocuments();
  }, [documentsType]);

  const setFilesInSelectedFiles = () => {
    setSelectedFiles((prevFiles) => {
      return prevFiles.map((prevFile) => ({
        ...prevFile,
        file: files.find((f2) => f2.aditionalData === prevFile.id_document_type)?.file,
        expirationDate: undefined,
        optional: false
      }));
    });
  };

  useEffect(() => {
    setFilesInSelectedFiles();
  }, [files]);

  // Cambia origen
  const onChangeOrigin = (value: any) => {
    locations.forEach(async (item) => {
      if (item.id == value) {
        setLocationOrigin(item);
        origin.current = [item.longitude, item.latitude];
        setOriginValid(true);
        if (typeactive == "2") {
          setLocationDestination(item);
          destination.current = [item.longitude, item.latitude];
          setdestinationValid(true);
        }
        calcRouteDirection();
      }
    });
  };

  // Cambia destino
  const onChangeDestino = async (value: any) => {
    locations.forEach(async (item) => {
      if (item.id == value) {
        setLocationDestination(item);
        destination.current = [item.longitude, item.latitude];
        setdestinationValid(true);
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

      if (locationOrigin?.id == locationDestination?.id) {
        map.setCenter(origin.current);
        map.setZoom(14);
      } else {
        // Get the route bounds
        const bounds = routeGeometry.coordinates.reduce(
          (bounds: any, coord: any) => bounds.extend(coord),
          new mapboxgl.LngLatBounds()
        );

        // Zoom out to fit the route within the map view
        map.fitBounds(bounds, {
          padding: 50
        });
      }
    });

    // return () => {
    //   map.remove();
    // };
  }, [mapStyle, routeGeometry, origin, destination]);

  // calculate direction
  const calcRouteDirection = async () => {
    if (origin.current.length == 0 || destination.current.length == 0) return;

    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.current[0]},${origin.current[1]};${destination.current[0]},${destination.current[1]}?steps=true&geometries=geojson&access_token=${mapsAccessToken}`
      );

      const routes = response.data.routes;
      console.log("routes=>", routes);
      if (routes != undefined && routes.length > 0) {
        routes[0].legs = [];
      }
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
        setDistance(parseFloat((distance / 1000).toFixed(2)) + " Km");
        calculateDuration(duration);
        return directions;
      } else {
        // No routes found
        throw new Error("No se encontraron rutas");
      }
    } catch (error) {
      // Handle error
      console.error("Error calculating directions:", error as any);
      if (error instanceof Error) {
        messageApi.error("Error calculando direcciones: " + error.message);
      } else {
        messageApi.error("Error calculando direcciones: " + error);
      }
    }
  };

  useEffect(() => {
    const init =
      fechaInicial
        ?.hour(horaInicial?.get("hour") || 0)
        .minute(horaInicial?.get("minute") || 0)
        .toDate() || new Date();
    const finish =
      fechaFinal
        ?.hour(horaFinal?.get("hour") || 0)
        .minute(horaFinal?.get("minute") || 0)
        .toDate() || new Date();
    const duration = (finish.getTime() - init.getTime()) / 1000;
    typeactive == "2" && calculateDuration(duration);
  }, [typeactive, fechaInicial, fechaFinal, horaInicial, horaFinal]);

  useEffect(() => {
    if (!fechaInicial || !horaInicial) {
      setHoraFinal(undefined);
      setFechaFinal(undefined);
      return;
    }
    const initialHour = horaInicial.get("h");
    const initialMinute = horaInicial.get("m");
    let fechaFin = fechaInicial.hour(initialHour).minute(initialMinute).add(horasOrigenIzaje, "h");

    if (typeactive !== "2" && timetravelInSecs !== null) {
      fechaFin = fechaFin.add(horasDestinoIzaje, "h").add(timetravelInSecs, "s");
    }

    setHoraFinal(fechaFin);
    setFechaFinal(fechaFin);
  }, [
    typeactive,
    fechaInicial,
    horaInicial,
    horasOrigenIzaje,
    horasDestinoIzaje,
    timetravelInSecs
  ]);

  const calculateDuration = (duration: number) => {
    const hrs = getTravelDuration(duration);
    setTimetravel(hrs + " Hrs");
    setTimetravelInSecs(duration);
  };

  const resetFormValues = () => {
    origin.current = [];
    destination.current = [];
    setRouteGeometry(null);
    setRouteInfo([]);
    setDistance(null);
    setTimetravel(null);
    setTimetravelInSecs(null);
    setLocationOrigin(null);
    setLocationDestination(null);
    setHorasOrigenIzaje(0);
    setHorasDestinoIzaje(0);
    setFechaInicial(undefined);
    setHoraInicial(undefined);
    setHoraFinal(undefined);
    setFechaFinal(undefined);
    setOrigenIzaje(false);
    setDestinoIzaje(false);
    setFechaInicialFlexible(null);
    setFechaFinalFlexible(null);
  };

  useEffect(() => {
    if (fechaInicialFlexible !== null) setFechaFinalFlexible(fechaInicialFlexible);
  }, [fechaInicialFlexible]);

  useEffect(() => {
    resetFormValues();
    if (typeactive == "2") setOrigenIzaje(true);
  }, [typeactive]);

  /* Tipo de viaje  */
  const handleTypeClick = (id: "1" | "2" | "3") => {
    setTypeactive(id);
  };

  /* Carga */
  const columnsCarga = createColumnsMaterials(
    dataCarga,
    handleQuantityMaterial,
    handleDeleteMaterial
  );

  const columnsCargaPersonas = createColumnsPersons(dataPersons, handleDeletePerson);

  const loadMaterials = async () => {
    if (optionsMaterial !== undefined && optionsMaterial.length > 0) return;

    const res = await getAllMaterials();
    const result: any = [];
    if (res?.data?.data?.length > 0) {
      res.data.data.forEach((item) => {
        const strlabel = (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Col span={20}>
              <Text>
                {item.type_description} - {item.description}
                <br></br>
                Volumen {item.m3_volume} m3 - Peso {item.kg_weight} Kg
              </Text>
            </Col>
            <Col span={4} style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btnagregar active" onClick={() => addMaterial(item)}>
                Agregar
              </button>
            </Col>
          </div>
        );
        result.push({ label: strlabel, value: item.description });
      });
    }

    setOptionsMaterial(result);
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const filteredMaterialOptions = optionsMaterial.filter(
    (option: any) => !dataCarga.some((material) => material.description === option.value)
  );

  // /* Vehiculos sugeridos */
  const columnsCargaVehiculo = createColumnsSuggestedVehicles(
    dataVehicles,
    handleQuantityVehicle,
    handleDeleteVehicle
  );

  const [optionsVehicles, setOptionsVehicles] = useState<CustomOptionType[]>([]);

  const loadSuggestedVehicles = async (typesActive: string[]) => {
    const promises = typesActive.map((type) => getSuggestedVehicles(type));
    const results = await Promise.all(promises);

    const combinedResults = results
      .map((result) => result?.data?.data)
      .reduce((acc, data) => acc.concat(data), []);
    const result: any = [];

    if (combinedResults?.length > 0) {
      combinedResults.forEach((item) => {
        const strlabel = (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Col span={20}>
              <Text>
                <b>{item?.description}</b>
                <br />
                Largo {item.length}m - Ancho {item.width}m - Alto {item.height}m - Máximo{" "}
                {item.kg_capacity}Tn
                <br />
                Vehículos {item.disponibility || 0} | Tarifas {item.rates || 0}
              </Text>
            </Col>
            <Col span={4} style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btnagregar active" onClick={() => addVehicle(item)}>
                Agregar
              </button>
            </Col>
          </div>
        );

        result.push({ value: item.description, label: strlabel });
      });
    }

    setOptionsVehicles(result);
  };

  useEffect(() => {
    loadSuggestedVehicles([typeactive]);
  }, []);

  useEffect(() => {
    setDataVehicles([]);
    const needLifting = origenIzaje || destinoIzaje;
    if (typeactive == "1" && needLifting) {
      loadSuggestedVehicles(["1", "2"]);
    } else loadSuggestedVehicles([typeactive]);
  }, [typeactive, origenIzaje, destinoIzaje]);

  const filteredVehiclesOptions = optionsVehicles.filter(
    (option: any) => !dataVehicles.some((vehicle) => vehicle.description === option.value)
  );

  /* Responsables */
  const dataPslDefault = [
    {
      key: 1,
      idpsl: 0,
      descpsl: "",
      percent: 100,
      costcenters: [
        {
          key: 1,
          idpslcostcenter: 0,
          descpslcostcenter: "",
          percent: 100
        }
      ]
    }
  ];

  const [optionsPSL, setOptionsPSL] = useState<PSLOptionType[]>([]);
  const [dataPsl, setDataPsl] = useState<IOrderPsl[]>(dataPslDefault);

  const loadPSL = async () => {
    if (optionsPSL !== undefined && optionsPSL.length > 0) return;

    const res = await getPsl();
    const result: any = [];
    if (res?.data?.data?.length > 0) {
      res.data.data.forEach((item) => {
        result.push({ value: item.id, label: item.description, costcenters: item.cost_center });
      });
    }
    setOptionsPSL(result);
  };

  useEffect(() => {
    loadPSL();
  }, []);

  const setOptionsCostCenter = (idPsl: number) => {
    const pslFinded = optionsPSL?.find((option) => option.value === idPsl);
    if (!pslFinded) return [];

    const pslInData = dataPsl.find((psl) => psl.idpsl === idPsl);

    const selectedCostCenterIds =
      pslInData?.costcenters.map((costCenter) => costCenter.idpslcostcenter) || [];

    const newCcArray = pslFinded.costcenters
      .map((c) => ({ value: c.id, label: c.description }))
      .filter((c) => !selectedCostCenterIds.includes(c.value));

    return newCcArray;
  };

  const filteredPsls = optionsPSL
    ? optionsPSL.filter((option) => !dataPsl.some((req) => req.idpsl === option.value))
    : [];

  const addPsl = async () => {
    const createNewPsl = (key: number) => {
      return {
        key,
        idpsl: 0,
        descpsl: "",
        percent: 0,
        costcenters: [
          {
            key: 1,
            idpslcostcenter: 0,
            descpslcostcenter: "",
            percent: 0
          }
        ]
      };
    };
    setDataPsl((dataPsl) => [...dataPsl, createNewPsl(dataPsl?.length ? dataPsl?.length + 1 : 1)]);
  };

  const addPslCostCenter = (key: React.Key) => {
    const createNewCC = (key: number) => {
      return {
        key,
        idpslcostcenter: 0,
        descpslcostcenter: "",
        percent: 0
      };
    };
    setDataPsl((prevDataPsl) =>
      prevDataPsl.map((item) =>
        item.key === key
          ? {
              ...item,
              costcenters: [...item.costcenters, createNewCC(item.costcenters.length + 1)]
            }
          : item
      )
    );
  };

  const adjustCostCenterPercentages = (
    costcenters: IOrderPslCostCenter[],
    oldPsdPercent: number,
    newPslPercent: number
  ) => {
    const newCCs = costcenters.map((cc) => {
      const oldCCPercent = cc.percent / oldPsdPercent;
      const newCCValue = newPslPercent * oldCCPercent;
      return { ...cc, percent: newCCValue };
    });
    return newCCs;
  };

  const handlePslPercentChange = (value: number, pslIndex: number) => {
    setDataPsl((prevDataPsl) => {
      // Calcula el total actual de los porcentajes de los PSLs excluyendo el seleccionado
      const totalPercentExcludingCurrent = prevDataPsl.reduce((total, psl, index) => {
        return index !== pslIndex ? total + psl.percent : total;
      }, 0);

      // Verifica si la suma total con el nuevo valor es mayor a 100
      const isOverTotal = totalPercentExcludingCurrent + value > 100;

      const remainingPercent = 100 - value;
      const otherPslCount = prevDataPsl.length - 1;

      // Actualiza los PSLs con la lógica correspondiente
      const updatedPsl = prevDataPsl.map((psl, i) => {
        if (i === pslIndex) {
          return { ...psl, percent: value };
        } else {
          const adjustedPercent = isOverTotal ? remainingPercent / otherPslCount : psl.percent;
          return {
            ...psl,
            percent: adjustedPercent,
            costcenters: isOverTotal
              ? adjustCostCenterPercentages(psl.costcenters, psl.percent, adjustedPercent)
              : psl.costcenters
          };
        }
      });

      return updatedPsl;
    });
  };

  const handleCcPercentChange = (value: number, pslIndex: number, ccIndex: number) => {
    setDataPsl((prevDataPsl) =>
      prevDataPsl.map((psl, i) => {
        if (i !== pslIndex) return psl;

        const currentPslPercent = psl.percent;

        if (value > currentPslPercent) {
          return psl;
        }

        const totalCCPercent = psl.costcenters.reduce(
          (total, cc, index) => (index !== ccIndex ? total + cc.percent : total),
          0
        );

        const otherCcCount = psl.costcenters.length - 1;
        let updatedCostCenters;

        if (value === 0) {
          updatedCostCenters = psl.costcenters.map((cc, j) =>
            j === ccIndex
              ? { ...cc, percent: value }
              : { ...cc, percent: currentPslPercent / otherCcCount }
          );
        } else if (totalCCPercent + value > currentPslPercent) {
          const remainingPercent = currentPslPercent - value;
          updatedCostCenters = psl.costcenters.map((cc, j) =>
            j === ccIndex
              ? { ...cc, percent: value }
              : { ...cc, percent: remainingPercent / otherCcCount }
          );
        } else {
          updatedCostCenters = psl.costcenters.map((cc, j) =>
            j === ccIndex ? { ...cc, percent: value } : cc
          );
        }

        return { ...psl, costcenters: updatedCostCenters };
      })
    );
  };

  const parser = (value: string | undefined) =>
    Number(value?.replace("%", "")) as unknown as number;

  const handleBlurPSL = (e: React.FocusEvent<HTMLInputElement>, pslIndex: number) => {
    const formattedValue = e.target.value;
    const numericValue = parser(formattedValue);
    if (numericValue !== undefined && !isNaN(numericValue)) {
      handlePslPercentChange(numericValue, pslIndex);
    }
  };

  const handleBlurCC = (
    e: React.FocusEvent<HTMLInputElement>,
    pslIndex: number,
    ccIndex: number
  ) => {
    const formattedValue = e.target.value;
    const numericValue = parser(formattedValue);
    if (numericValue !== undefined && !isNaN(numericValue)) {
      handleCcPercentChange(numericValue, pslIndex, ccIndex);
    }
  };

  const handleDeletePsl = (currentPslIndex: number) => {
    setDataPsl((prevData) => {
      return prevData.filter((pv, index) => currentPslIndex !== index);
    });
  };

  const handleDeleteCC = (currentPslIndex: number, currentCCIndex: number) => {
    setDataPsl((prevData) => {
      const newPsls = prevData.map((psl, pslindex) => {
        if (pslindex === currentPslIndex) {
          const filteredCostcenters = psl.costcenters.filter(
            (_, ccindex) => currentCCIndex !== ccindex
          );
          return { ...psl, costcenters: filteredCostcenters };
        } else return psl;
      });
      return newPsls;
    });
  };

  /*requerimientos adicionales*/

  const columnsRequerimientosAdicionales = createOtherRequirementsColumns(
    dataRequirements,
    handleQuantityRequirement,
    handleDeleteRequirement
  );

  const [optionsRequirements, setOptionsRequirements] = useState<CustomOptionType[]>([]);

  const loadRequirements = async () => {
    if (optionsRequirements !== undefined && optionsRequirements.length > 0) return;

    const res = await getOtherRequirements();
    const result: any = [];
    if (res?.data?.data?.length > 0) {
      res.data.data.forEach((item) => {
        const strlabel = (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Col span={20}>
              <Text>
                <b>{item.description}</b>
              </Text>
            </Col>
            <Col span={4} style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btnagregar active" onClick={() => addRequirement(item)}>
                Agregar
              </button>
            </Col>
          </div>
        );
        result.push({ value: item.description, label: strlabel });
      });
    }

    setOptionsRequirements(result);
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  const filteredOptionalRequirementssOptions = optionsRequirements
    ? optionsRequirements.filter(
        (option) => !dataRequirements.some((req) => req.description === option.value)
      )
    : [];

  /* Datos de contacto */
  const [dataContacts, setDataContacts] = useState<ITransferOrderContacts[]>([]);
  //default data
  const loadContacts = () => {
    if (dataContacts !== undefined && dataContacts.length > 0) return;

    const defaultorigin: ITransferOrderContacts = {
      key: 1,
      contact_type: 1,
      id: 0,
      id_transfer_order: 0,
      id_contact: 0,
      name: "",
      contact_number: "",
      active: "",
      created_at: new Date(),
      created_by: ""
    };

    setDataContacts((dataContacts) => [...dataContacts, defaultorigin]);

    const defaultdestiny: ITransferOrderContacts = {
      key: 2,
      contact_type: 2,
      id: 0,
      id_transfer_order: 0,
      id_contact: 0,
      name: "",
      contact_number: "",
      active: "",
      created_at: new Date(),
      created_by: ""
    };

    setDataContacts((dataContacts) => [...dataContacts, defaultdestiny]);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const updateContacts = (key: React.Key, field: "name" | "contact_number", ndata: string) => {
    const newData = [...dataContacts];
    newData.forEach((item) => {
      if (item.key === key) {
        item[field] = ndata;
      }
    });

    setDataContacts(newData);
  };

  /* Company Code */
  const [optionsCompanyCodes, setOptionsCompanyCodes] = useState<ICompanyCode[]>([]);

  const loadCompanyCodes = async () => {
    if (optionsCompanyCodes !== undefined && optionsCompanyCodes.length > 0) return;

    const res = await getCompanyCodes();
    let result: any = [];
    if (res?.data?.data?.length > 0) {
      result = res.data.data.map((item) => ({
        value: item.id.toString(),
        label: item.description
      }));
    }
    setOptionsCompanyCodes(result);
  };

  useEffect(() => {
    loadCompanyCodes();
  }, []);

  /* Clients */
  const [optionsClients, setOptionsClients] = useState<IClient[]>([]);

  const loadClients = async () => {
    if (optionsClients !== undefined && optionsClients.length > 0) return;

    const res = await getClients();
    let result: any = [];
    if (res?.data?.data?.length > 0) {
      result = res.data.data.map((item) => ({ value: item.id, label: item.description }));
    }
    setOptionsClients(result);
  };

  useEffect(() => {
    loadClients();
  }, []);

  /* Datos de personas */
  const [optionsPersons, setOptionsPersons] = useState<CustomOptionType[]>([]);

  const loadPersons = async () => {
    if (optionsPersons !== undefined && optionsPersons.length > 0) return;

    const res = await getAllUsers();
    const result: any = [];
    if (res?.data?.data?.length > 0) {
      res.data.data.forEach((item) => {
        const strlabel = (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Col span={20}>
              <Text>
                <b>{item.name}</b>
                <br />
                <Phone size={12} /> {item.contact_number}
                <br />
                {item.psl_desc} - {item.cost_center_desc}
              </Text>
            </Col>
            <Col span={4} style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btnagregar active" onClick={() => addPerson(item)}>
                Agregar
              </button>
            </Col>
          </div>
        );
        result.push({
          value: `${item.id} - ${item.name} - ${item.contact_number} - ${item.psl_desc} - ${item.cost_center_desc}`,
          label: strlabel
        });
      });
    }
    setOptionsPersons(result);
  };

  useEffect(() => {
    setDataPersons([]);
    loadPersons();
  }, [typeactive]);

  const filteredPersonsOptions = optionsPersons.filter(
    (option: any) => !dataPersons.some((person) => option?.value?.includes(String(person.id)))
  );

  /* Form Event Handlers */
  const onCreateOrder = async () => {
    //validate fields
    let isformvalid = true;
    //carga - izaje - personas
    if (typeactive == "1" || typeactive == "2" || typeactive == "3") {
      if (origin.current.length == 0) {
        setOriginValid(false);
        isformvalid = false;
        messageApi.error("Punto Origen es obligatorio");
      }
      if (typeactive == "1") {
        if (destination.current.length == 0) {
          setdestinationValid(false);
          isformvalid = false;
          messageApi.error("Punto Destino es obligatorio");
        }
      }
      if (fechaInicial == undefined || fechaInicial == null) {
        setFechaInicialValid(false);
        isformvalid = false;
        messageApi.error("Fecha Inicial es obligatorio");
      }
      if (horaInicial == undefined || horaInicial == null) {
        setHoraInicialValid(false);
        isformvalid = false;
        messageApi.error("Hora Inicial es obligatorio");
      }
      if (fechaFinal == undefined || fechaFinal == null) {
        setFechaFinalValid(false);
        isformvalid = false;
        messageApi.error("Fecha Final es obligatorio");
      }
      if (horaFinal == undefined || horaFinal == null) {
        setHoraFinalValid(false);
        isformvalid = false;
        messageApi.error("Hora Final es obligatorio");
      }
      if (!fechaInicialFlexible) {
        setFechaInicialFlexibleValid(false);
        isformvalid = false;
        messageApi.error("Fecha Inicial Flexible es obligatorio");
      } else {
        setFechaInicialFlexibleValid(true);
      }
      if (!fechaFinalFlexible) {
        setFechaFinalFlexibleValid(false);
        isformvalid = false;
        messageApi.error("Fecha Final Flexible es obligatorio");
      } else {
        setFechaFinalFlexibleValid(true);
      }

      if (company == -1) {
        setCompanyValid(false);
        isformvalid = false;
        messageApi.error("Company code es obligatorio");
      } else {
        setCompanyValid(true);
      }

      if (client == -1) {
        setClientValid(false);
        isformvalid = false;
        messageApi.error("Cliente final es obligatorio");
      } else {
        setClientValid(true);
      }

      //validacion grids
      //personal
      if (typeactive == "3") {
        if (dataPersons.length == 0) {
          isformvalid = false;
          messageApi.error("Debe agregar por lo menos una persona");
        }
      } else {
        if (dataCarga.length == 0) {
          isformvalid = false;
          messageApi.error("Debe agregar por lo menos un material");
        }
      }
      if (dataVehicles.length == 0) {
        isformvalid = false;
        messageApi.error("Debe agregar por lo menos un vehículo sugerido");
      }

      const checkPSLs = (psls: IOrderPsl[]) => {
        const hasValidPsl = psls.some(
          (psl) => psl.idpsl !== 0 && psl.costcenters.some((cc) => cc.idpslcostcenter !== 0)
        );

        if (!hasValidPsl) {
          isformvalid = false;
          messageApi.error("Debe haber al menos un PSL válido con un centro de costo válido");
          return;
        }

        const totalPslPercent = psls.reduce((total, psl) => total + psl.percent, 0);
        if (totalPslPercent !== 100) {
          isformvalid = false;
          messageApi.error("La totalidad de los PSLs debe ser 100%");
        }

        for (const psl of psls) {
          const totalCcPercent = psl.costcenters.reduce((total, cc) => total + cc.percent, 0);
          if (totalCcPercent !== psl.percent) {
            isformvalid = false;
            messageApi.error("La suma de los centros de costos debe ser igual al del PSL asociado");
          }
        }
      };

      checkPSLs(dataPsl);

      //datos de contacto
      dataContacts.forEach((contact) => {
        if (contact.contact_number.length === 0 || contact.name.length === 0) {
          const type = contact.contact_type == 1 ? "origen" : "destino";
          isformvalid = false;

          messageApi.error(`Debe registrar información del contacto de ${type}`);
        } else if (contact.contact_number.length < 10) {
          isformvalid = false;
          messageApi.error(`Los números de teléfono deben contener 10 dígitos`);
        }
      });
    }

    if (!isformvalid) {
      return;
    }

    const cuser = auth.currentUser;

    const inihour = horaInicial ? horaInicial.get("hour") : 0;
    const inimin = horaInicial ? horaInicial.get("minute") : 0;
    const finhour = horaFinal ? horaFinal.get("hour") : 0;
    const finmin = horaFinal ? horaFinal.get("minute") : 0;
    const fechaInicialToBody = fechaInicial?.hour(inihour).minute(inimin);
    const fechaFinalToBody = fechaFinal?.hour(finhour).minute(finmin);

    const datato: ITransferOrder = {
      id_start_location: locationOrigin ? locationOrigin?.id : 0,
      id_end_location: locationDestination ? locationDestination?.id : 0,
      id: 0,
      id_user: 1,
      user: cuser?.email,
      start_date: fechaInicialToBody?.tz("GMT", true).toISOString(),
      end_date: fechaFinalToBody?.tz("GMT", true).toISOString(),
      start_freight_equipment: String(origenIzaje ? 1 : 0),
      end_freight_equipment: String(destinoIzaje ? 1 : 0),
      freight_origin_time: origenIzaje ? horasOrigenIzaje : undefined,
      freight_destination_time: destinoIzaje ? horasDestinoIzaje : undefined,
      rotation: "0",
      start_date_flexible: fechaInicialFlexible ?? 0,
      end_date_flexible: fechaFinalFlexible ?? 0,
      id_route: "",
      id_company: company,
      active: "true",
      created_at: new Date().toISOString(),
      created_by: cuser?.email,
      geometry: routeInfo,
      id_service_type: typeactive,
      id_client: client,
      status: "",
      observation: observation,
      service_type_desc: TripType.Carga,
      client_desc: ""
    };

    //contactos
    datato.transfer_order_contacts = dataContacts;

    //materiales
    datato.transfer_order_material = [];
    dataCarga.forEach((material) => {
      datato.transfer_order_material?.push({
        id: 0,
        id_transfer_order: 0,
        id_material: material.id,
        quantity: material.quantity,
        created_at: new Date(),
        created_by: cuser?.email,
        modified_at: new Date(),
        modified_by: ""
      });
    });

    //otrosrequerimientos
    datato.transfer_order_other_requeriments = dataRequirements;

    //productos
    datato.transfer_order_products = [];
    //centros de costo
    datato.transfer_order_cost_center = [];

    dataPsl.forEach((psl) => {
      datato.transfer_order_products?.push({
        id: 0,
        id_transfer_order: 0,
        id_product: psl.idpsl,
        units: psl.percent,
        created_at: new Date(),
        created_by: cuser?.email,
        modified_at: new Date(),
        modified_by: "",
        active: "",
        product_desc: ""
      });

      psl.costcenters.forEach((cost) => {
        datato.transfer_order_cost_center?.push({
          id: 0,
          id_transfer_order: 0,
          id_psl: psl.idpsl,
          id_costcenter: cost.idpslcostcenter,
          percentage: cost.percent,
          active: "",
          created_at: new Date(),
          created_by: cuser?.email,
          cost_center_desc: ""
        });
      });
    });

    //vehiculos
    datato.transfer_order_vehicles = [];
    dataVehicles.forEach((vehicle) => {
      datato.transfer_order_vehicles?.push({
        id: 0,
        id_transfer_order: 0,
        id_vehicle_type: vehicle.id,
        quantity: vehicle.quantity,
        created_at: new Date(),
        created_by: cuser?.email,
        modified_at: new Date(),
        modified_by: "",
        vehicle_type_desc: ""
      });
    });

    //personas
    datato.transfer_order_persons = dataPersons || [];

    //documentos
    datato.transfer_order_documents = [];
    // archivos
    const data: IFormTransferOrder = {
      body: datato,
      files: selectedFiles
    };

    console.log("DATA PARA POST: ", data);

    setIsLoading(true);
    try {
      const newTO = await addTransferOrder(datato, data?.files || ([] as IDocumentCompleted[]));
      if (newTO) {
        message.open({
          type: "success",
          content: `TO No. ${newTO.id} ha sido creada`,
          duration: 2
        });
        push("/logistics/orders/details/" + newTO.id);
      }
    } catch (error) {
      message.open({
        type: "error",
        content: "La solicitud no ha sido creada"
      });
    } finally {
      setIsLoading(false);
    }
  };
  /* acoordion */
  const actionsOptions = [
    {
      key: 2,
      label: (
        <div className="collapseByAction__label">
          <Calendar size={16} />
          <Title className="collapseByAction__label__text" level={4}>
            Agendamiento
          </Title>
        </div>
      ),
      children: (
        <Row>
          <Col span={12} style={{ padding: "1.5rem" }}>
            <Row>
              <Text className="locationLabels">Punto Origen</Text>
              <Select
                showSearch
                placeholder="Buscar dirección inicial"
                className={
                  originValid ? "puntoOrigen dateInputForm" : "puntoOrigen dateInputFormError"
                }
                style={{ width: "100%" }}
                onChange={onChangeOrigin}
                value={locationOrigin?.id}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option!.children!.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
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
              {!originValid && (
                <>
                  <br />
                  <label className="textError">* Campo obligatorio</label>
                  <br />
                </>
              )}
              {typeactive != "3" && (
                <Flex style={{ marginTop: "0.5rem", width: "100%" }} align="center">
                  <Col span={12}>
                    <Flex gap={"0.5rem"}>
                      <Switch
                        disabled={typeactive === "2"}
                        checked={origenIzaje}
                        onChange={(event) => {
                          setOrigenIzaje(event);
                        }}
                      />
                      <Text>Requiere Izaje</Text>
                    </Flex>
                  </Col>
                  {origenIzaje && (
                    <Col span={12}>
                      <Flex gap={"0.5rem"} align="center" justify="end">
                        <Text>Cuantas horas de izaje</Text>
                        <CustomTimeSelector
                          initialValue={horasOrigenIzaje}
                          onTimeChange={(value) => setHorasOrigenIzaje(value)}
                        />
                      </Flex>
                    </Col>
                  )}
                </Flex>
              )}
            </Row>
            {typeactive != "2" && (
              <Row style={{ marginTop: "1rem" }}>
                <label className="locationLabels">Punto Destino</label>
                <Select
                  showSearch
                  placeholder="Buscar dirección final"
                  className={
                    destinationValid
                      ? "puntoOrigen dateInputForm"
                      : "puntoOrigen dateInputFormError"
                  }
                  style={{ width: "100%" }}
                  onChange={onChangeDestino}
                  value={locationDestination?.id}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option!.children!.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
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
                {!destinationValid && (
                  <>
                    <br />
                    <label className="textError">* Campo obligatorio</label>
                    <br />
                  </>
                )}
                {typeactive != "3" && (
                  <Flex style={{ marginTop: "0.5rem", width: "100%" }} align="center">
                    <Col span={12}>
                      <Flex gap={"0.5rem"}>
                        <Switch
                          checked={destinoIzaje}
                          onChange={(event) => {
                            setDestinoIzaje(event);
                          }}
                        />
                        <Text>Requiere Izaje</Text>
                      </Flex>
                    </Col>
                    {destinoIzaje && (
                      <Col span={12}>
                        <Flex gap={"0.5rem"} align="center" justify="end">
                          <Text>Cuantas horas de izaje</Text>
                          <CustomTimeSelector
                            initialValue={horasDestinoIzaje}
                            onTimeChange={(value) => setHorasDestinoIzaje(value)}
                          />
                        </Flex>
                      </Col>
                    )}
                  </Flex>
                )}
              </Row>
            )}
            <Row style={{ marginTop: "1rem" }}>
              <Col span={24}>
                <label className="locationLabels">Fecha y hora inicial</label>
                <Row gutter={[16, 16]} style={{ marginTop: "0.5rem" }}>
                  <Col span={8}>
                    <DatePicker
                      placeholder="Seleccione fecha"
                      disabledDate={disabledDate}
                      onChange={(value) => {
                        setFechaInicial(value);
                        setFechaInicialValid(true);
                      }}
                      value={fechaInicial}
                      className={fechaInicialValid ? "dateInputForm" : "dateInputFormError"}
                    />
                    {!fechaInicialValid && (
                      <>
                        <br />
                        <label className="textError">* Campo obligatorio</label>
                      </>
                    )}
                  </Col>
                  <Col span={8}>
                    <TimePicker
                      placeholder="Seleccione hora"
                      format={"HH:mm"}
                      minuteStep={15}
                      hourStep={1}
                      needConfirm={false}
                      type={"time"}
                      value={horaInicial}
                      onChange={(value) => {
                        setHoraInicial(value);
                        setHoraInicialValid(true);
                      }}
                      className={horaInicialValid ? "dateInputForm" : "dateInputFormError"}
                    />
                    {!horaInicialValid && (
                      <>
                        <br />
                        <label className="textError">* Campo obligatorio</label>
                      </>
                    )}
                  </Col>
                  <Col span={8}>
                    <Select
                      value={fechaInicialFlexible}
                      placeholder="Seleccione"
                      className={
                        fechaInicialFlexibleValid
                          ? "puntoOrigen dateInputForm"
                          : "puntoOrigen dateInputFormError"
                      }
                      options={[
                        { value: "0", label: "Exacto" },
                        { value: "1", label: "+/- 1 día" },
                        { value: "2", label: "+/- 2 días" },
                        { value: "3", label: "+/- 3 días" }
                      ]}
                      onChange={(value) => {
                        setFechaInicialFlexible(value);
                        setFechaInicialFlexibleValid(true);
                      }}
                    />
                    {!fechaInicialFlexibleValid && (
                      <>
                        <br />
                        <label className="textError">* Campo obligatorio</label>
                        <br />
                      </>
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row style={{ marginTop: "1rem" }}>
              <Col span={24}>
                <Text className="locationLabels">Fecha y hora final</Text>
                <Row gutter={[16, 16]} style={{ marginTop: "0.5rem" }}>
                  <Col span={8}>
                    <DatePicker
                      placeholder="Seleccione fecha"
                      disabledDate={disabledDate}
                      disabled={true}
                      value={fechaFinal}
                      onChange={(value) => {
                        setFechaFinal(value);
                        setFechaFinalValid(true);
                      }}
                      className={fechaFinalValid ? "dateInputForm" : "dateInputFormError"}
                    />
                    {!fechaFinalValid && (
                      <>
                        <br />
                        <label className="textError">* Campo obligatorio</label>
                      </>
                    )}
                  </Col>
                  <Col span={8}>
                    <TimePicker
                      placeholder="Seleccione hora"
                      format={"HH:mm"}
                      minuteStep={15}
                      needConfirm={false}
                      disabled={true}
                      hourStep={1}
                      type={"time"}
                      variant="filled"
                      value={horaFinal}
                      onChange={(value) => {
                        setHoraFinal(value);
                        setHoraFinalValid(true);
                      }}
                      className={horaFinalValid ? "dateInputForm" : "dateInputFormError"}
                    />
                    {!horaFinalValid && (
                      <>
                        <br />
                        <label className="textError">* Campo obligatorio</label>
                      </>
                    )}
                  </Col>
                  <Col span={8}>
                    <Select
                      value={fechaFinalFlexible}
                      placeholder="Seleccione"
                      disabled={true}
                      className={
                        fechaFinalFlexibleValid
                          ? "puntoOrigen dateInputForm"
                          : "puntoOrigen dateInputFormError"
                      }
                      options={[
                        { value: "0", label: "Exacto" },
                        { value: "1", label: "+/- 1 día" },
                        { value: "2", label: "+/- 2 días" },
                        { value: "3", label: "+/- 3 días" }
                      ]}
                      onChange={(value) => {
                        setFechaFinalFlexible(value);
                        setFechaFinalFlexibleValid(true);
                      }}
                    />
                    {!fechaFinalFlexibleValid && (
                      <>
                        <br />
                        <label className="textError">* Campo obligatorio</label>
                        <br />
                      </>
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
            {routeGeometry && (
              <Row className="divdistance" style={{ marginTop: "1rem" }}>
                <Col span={12} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <Text>Distancia Total</Text>
                  <Text>{typeactive == "2" ? "Tiempo de izaje" : "Tiempo de desplazamiento"}</Text>
                </Col>
                <Col
                  span={12}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    alignItems: "flex-end"
                  }}
                >
                  <Text>{formatNumber(distance)} km</Text>
                  <Text>{typeactive == "2" ? `${horasOrigenIzaje} Hrs` : timetravel}</Text>
                </Col>
              </Row>
            )}
          </Col>
          <Col span={12} style={{ padding: "1.5rem" }}>
            <div
              ref={mapContainerRef}
              style={{
                width: "100%",
                height: "100%",
                border: "1px #F7F7F7 solid"
              }}
            />
          </Col>
        </Row>
      )
    },
    {
      key: 3,
      label: (
        <div className="collapseByAction__label">
          <Package size={16} />
          <Title className="collapseByAction__label__text" level={4}>
            {typeactive == "3" ? "Personas y Vehículos" : "Carga"}
          </Title>
        </div>
      ),
      children: (
        <Row>
          <Col span={24} style={{ padding: "1.5rem" }}>
            {(typeactive == "1" || typeactive == "2") && (
              <Row style={{ marginBottom: "2rem" }}>
                <Col span={24}>
                  <Col span={12}>
                    <Text className="locationLabels" style={{ display: "flex" }}>
                      Material
                    </Text>
                    <Select
                      showSearch
                      allowClear
                      placeholder="Buscar material"
                      options={filteredMaterialOptions}
                      value={null}
                      style={{ width: "100%", height: "2.5rem" }}
                      optionFilterProp="value"
                      filterOption={(input: string, option) => {
                        if (option) {
                          return option.value.toLowerCase().includes(input.toLowerCase());
                        }
                        return false;
                      }}
                    />
                  </Col>
                  <Col span={12} />
                  <Col span={24}>
                    <Table
                      columns={columnsCarga}
                      dataSource={dataCarga}
                      pagination={false}
                      footer={() => {
                        const totalVolume = dataCarga.reduce(
                          (sum, material) => sum + material.m3_volume * material.quantity,
                          0
                        );
                        const totalWeight = dataCarga.reduce(
                          (sum, material) => sum + material.kg_weight * material.quantity,
                          0
                        );
                        return (
                          <MaterialTableFooter
                            totalVolume={totalVolume}
                            totalWeight={totalWeight}
                          />
                        );
                      }}
                      rowKey={"id"}
                    />
                  </Col>
                </Col>
              </Row>
            )}
            {typeactive == "3" && (
              <Row style={{ marginBottom: "2rem" }}>
                <Col span={24}>
                  <Col span={12}>
                    <Text className="locationLabels" style={{ display: "flex" }}>
                      Personas
                    </Text>
                    <Select
                      showSearch
                      allowClear
                      placeholder="Buscar persona"
                      options={filteredPersonsOptions}
                      value={null}
                      style={{ width: "100%", height: "2.5rem" }}
                      optionFilterProp="value"
                      filterOption={(input: string, option) => {
                        if (option) {
                          return option.value.toLowerCase().includes(input.toLowerCase());
                        }
                        return false;
                      }}
                    />
                  </Col>
                  <Col span={12} />
                  <Col span={24}>
                    <Table
                      columns={columnsCargaPersonas}
                      dataSource={dataPersons}
                      rowKey={"id"}
                      pagination={false}
                    />
                  </Col>
                </Col>
              </Row>
            )}
            <Row>
              <Col span={24}>
                <Col span={12}>
                  <Text className="locationLabels" style={{ display: "flex" }}>
                    Vehículo Sugerido
                  </Text>
                  <Select
                    showSearch
                    allowClear
                    placeholder="Agregar vehículo"
                    options={filteredVehiclesOptions}
                    value={null}
                    style={{ width: "100%", height: "2.5rem" }}
                    optionFilterProp="value"
                    filterOption={(input: string, option) => {
                      if (option) {
                        return option.value.toLowerCase().includes(input.toLowerCase());
                      }
                      return false;
                    }}
                  />
                </Col>
                <Col span={12} />
                <Col span={24}>
                  <Table
                    columns={columnsCargaVehiculo}
                    dataSource={dataVehicles}
                    pagination={false}
                    rowKey={"id"}
                  />
                </Col>
              </Col>
            </Row>
          </Col>
        </Row>
      )
    },
    {
      key: 4,
      label: (
        <div className="collapseByAction__label">
          <UserList size={16} />
          <Title className="collapseByAction__label__text" level={4}>
            Responsables
          </Title>
        </div>
      ),
      children: (
        <Row>
          <Col span={24} style={{ padding: "1.5rem" }}>
            <Row style={{ marginBottom: "1.5rem" }}>
              <Col span={12}>
                <Text className="locationLabels" style={{ display: "flex" }}>
                  Company Code
                </Text>
                <Select
                  className={
                    companyValid ? "puntoOrigen dateInputForm" : "puntoOrigen dateInputFormError"
                  }
                  options={optionsCompanyCodes}
                  onChange={(value) => {
                    setCompany(value);
                    setCompanyValid(true);
                  }}
                />
                {!companyValid && (
                  <>
                    <br />
                    <label className="textError">* Campo obligatorio</label>
                    <br />
                  </>
                )}
              </Col>
              <Col span={12} />
            </Row>
            {dataPsl.map((psl, pslIndex) => (
              <div
                className="divdistance"
                style={{
                  marginBottom: pslIndex + 1 === dataPsl.length ? 0 : "1rem",
                  position: "relative"
                }}
                key={`PSL-${pslIndex}-${psl.key}`}
              >
                <Row>
                  <Col span={10}>
                    <Text className="locationLabels" style={{ display: "flex" }}>
                      Product Service Line (PSL)
                    </Text>
                    <Select
                      showSearch
                      placeholder={"Selecciona PSL"}
                      options={filteredPsls}
                      className="puntoOrigen dateInputForm"
                      onChange={(e) => {
                        setDataPsl((prevDataPsl) =>
                          prevDataPsl.map((item, i) =>
                            i === pslIndex ? { ...item, idpsl: e, key: pslIndex + 1 } : item
                          )
                        );
                      }}
                      optionFilterProp="label"
                      filterOption={(input: string, option) => {
                        if (option) {
                          return option.label?.toLowerCase().includes(input.toLowerCase());
                        }
                        return false;
                      }}
                    />
                  </Col>
                  <Col span={6} style={{ paddingLeft: "30px" }}>
                    <Text className="locationLabels" style={{ display: "flex" }}>
                      Porcentaje PSL
                    </Text>
                    <InputNumber<number>
                      className="puntoOrigen dateInputForm"
                      defaultValue={psl.percent}
                      min={0}
                      max={100}
                      addonAfter="%"
                      formatter={(value) => `${Math.floor(value || 0)}`}
                      value={psl.percent}
                      onBlur={(e) => handleBlurPSL(e, pslIndex)}
                      step={1}
                    />
                  </Col>
                  <Col span={8} />
                </Row>
                {psl.costcenters.map((cc, ccIndex: number) => (
                  <Row key={cc.key}>
                    <Col span={10} style={{ paddingLeft: "30px" }}>
                      <Text
                        className="locationLabels"
                        style={{ display: "flex", marginTop: "0.5rem" }}
                      >
                        Centro de costos
                      </Text>
                      <Select
                        showSearch
                        placeholder={"Selecciona Centro de costos"}
                        options={setOptionsCostCenter(psl.idpsl)}
                        className="puntoOrigen dateInputForm"
                        onChange={(e) => {
                          setDataPsl((prevDataPsl) =>
                            prevDataPsl.map((psl, pslIndexMap) => {
                              if (pslIndexMap === pslIndex) {
                                return {
                                  ...psl,
                                  costcenters: psl.costcenters.map((cc, ccIndexMap) =>
                                    ccIndexMap === ccIndex
                                      ? { ...cc, idpslcostcenter: e, key: ccIndex + 1 }
                                      : cc
                                  )
                                };
                              }
                              return psl;
                            })
                          );
                        }}
                        optionFilterProp="label"
                        filterOption={(input: string, option) => {
                          if (option) {
                            return option?.label?.toLowerCase().includes(input.toLowerCase());
                          }
                          return false;
                        }}
                      />
                    </Col>
                    <Col span={6} style={{ paddingLeft: "30px" }}>
                      <Text
                        className="locationLabels"
                        style={{ display: "flex", marginTop: "0.5rem" }}
                      >
                        Porcentaje CC
                      </Text>
                      <InputNumber<number>
                        className="puntoOrigen dateInputForm"
                        defaultValue={cc.percent}
                        value={cc.percent}
                        min={0}
                        max={psl.percent}
                        addonAfter="%"
                        step={1}
                        formatter={(value) => `${Math.floor(value || 0)}`}
                        onBlur={(e) => handleBlurCC(e, pslIndex, ccIndex)}
                      />
                    </Col>
                    <Col
                      span={8}
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        alignItems: "flex-end"
                      }}
                    >
                      {ccIndex + 1 === psl.costcenters.length && psl.costcenters.length > 1 && (
                        <Flex align="center" justify="center">
                          <button
                            key={`delete-cc-${ccIndex}`}
                            onClick={() => handleDeleteCC(pslIndex, ccIndex)}
                            className="btnTrash"
                          >
                            <Trash size={24} />
                          </button>
                        </Flex>
                      )}
                      {ccIndex + 1 === psl.costcenters.length && (
                        <Flex align="center" justify="center">
                          <PlusCircle size={24} />
                          <button
                            onClick={() => addPslCostCenter(psl.key)}
                            className="btnagregarpsl"
                          >
                            Agregar centro de costos
                          </button>
                        </Flex>
                      )}
                    </Col>
                  </Row>
                ))}
                {pslIndex + 1 === dataPsl.length && dataPsl.length > 1 && (
                  <div
                    style={{ display: "flex", position: "absolute", top: "1rem", right: "1rem" }}
                    key={`delete-psl-${pslIndex}`}
                  >
                    <button onClick={() => handleDeletePsl(pslIndex)} className="btnTrash">
                      <Trash size={24} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            <Row style={{ marginTop: "2rem" }}>
              <Col span={24} style={{ display: "flex", justifyContent: "flex-end" }}>
                <Flex align="center" justify="center">
                  <PlusCircle size={24} />
                  <button onClick={() => addPsl()} className="btnagregarpsl">
                    Agregar PSL
                  </button>
                </Flex>
              </Col>
            </Row>
          </Col>
        </Row>
      )
    },
    {
      key: 5,
      label: (
        <div className="collapseByAction__label">
          <NewspaperClipping size={16} />
          <Title className="collapseByAction__label__text" level={4}>
            Información adicional
          </Title>
        </div>
      ),
      children: (
        <Row>
          <Col span={24} style={{ padding: "1.5rem" }}>
            <Text className="locationLabels" style={{ display: "flex" }}>
              Documentos
            </Text>
            <Row className="mainUploadDocuments" style={{ marginBottom: "1rem" }}>
              {selectedFiles.map((file) => (
                <Col span={12} style={{ padding: "15px" }} key={`file-${file.id_document_type}`}>
                  <UploadDocumentButton
                    key={file.id_document_type}
                    title={file.description}
                    isMandatory={!file.optional}
                    aditionalData={file.id_document_type}
                    setFiles={setFiles}
                  />
                </Col>
              ))}
            </Row>
            {/* <Row>
              <Col span={24} className="text-right">
                <Button
                  type="text"
                  onClick={() => setIsOpenModalDocuments(true)}
                  icon={<FileText size={24} />}
                >
                  {" "}
                  <Text style={{ fontWeight: "bold" }}>Agregar otro documento</Text>
                </Button>
              </Col>
            </Row> */}
            <Row style={{ marginBottom: "1rem" }}>
              <Col span={12}>
                <Text className="locationLabels" style={{ display: "flex" }}>
                  Cliente final
                </Text>
                <Select
                  placeholder="Seleccione cliente final"
                  style={{ width: "100%" }}
                  className={
                    clientValid ? "puntoOrigen dateInputForm" : "puntoOrigen dateInputFormError"
                  }
                  options={optionsClients}
                  onChange={(value) => {
                    setClient(value);
                    setClientValid(true);
                  }}
                />
                {!clientValid && (
                  <>
                    <br />
                    <label className="textError">* Campo obligatorio</label>
                    <br />
                  </>
                )}
              </Col>
              <Col span={12} />
            </Row>
            <Row style={{ marginBottom: "1rem" }}>
              <Col span={12}>
                <Text className="locationLabels" style={{ display: "flex" }}>
                  Requerimientos adicionales
                </Text>
                <Select
                  showSearch
                  allowClear
                  placeholder="Seleccione requerimiento adicional"
                  options={filteredOptionalRequirementssOptions}
                  value={null}
                  className={"puntoOrigen dateInputForm"}
                  optionFilterProp="value"
                  filterOption={(input: string, option) => {
                    if (option) {
                      return option.value.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                />
                <Col span={12} />
              </Col>
            </Row>
            <Row style={{ marginBottom: "1rem" }}>
              <Col span={24}>
                <Table
                  columns={columnsRequerimientosAdicionales}
                  dataSource={dataRequirements}
                  pagination={false}
                  rowKey={"id"}
                />
              </Col>
            </Row>
            <Row style={{ marginBottom: "1rem" }}>
              <Col span={24}>
                <Text className="locationLabels" style={{ display: "flex" }}>
                  Instrucciones especiales
                </Text>
                <TextArea
                  placeholder="Escribir las instrucciones"
                  rows={4}
                  className="custom-textarea"
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  onChange={(event) => {
                    setObservation(event.target.value);
                  }}
                />
              </Col>
            </Row>
            <Row style={{ marginBottom: "1rem" }}>
              <Col span={24}>
                <Text className="locationLabels" style={{ display: "flex" }}>
                  Datos de Contacto
                </Text>
                <Row style={{ rowGap: "1rem" }}>
                  <Col span={24}>
                    <Text className="locationLabels" style={{ display: "flex" }}>
                      Contacto punto origen
                    </Text>
                    {dataContacts
                      .filter((f) => f.contact_type == 1)
                      .map((contact, index) => (
                        <Row key={`contacto-origen-${index}-${contact.key}`} gutter={32}>
                          <Col span={12}>
                            <Input
                              placeholder="Nombre del contacto"
                              className="puntoOrigen dateInputForm"
                              key={contact.key}
                              value={contact.name}
                              onChange={(e) => {
                                updateContacts(contact.key, "name", e.target.value);
                              }}
                            />
                          </Col>
                          <Col span={12}>
                            <div>
                              <Input
                                placeholder="Teléfono: 000 000 0000"
                                className="puntoOrigen dateInputForm"
                                key={contact.key}
                                value={contact.contact_number}
                                onChange={(e) => {
                                  const { value: inputValue } = e.target;
                                  const reg = /^-?\d*(\.\d*)?$/;
                                  if (
                                    reg.test(inputValue) ||
                                    inputValue === "" ||
                                    inputValue === "-"
                                  ) {
                                    updateContacts(contact.key, "contact_number", inputValue);
                                  }
                                }}
                                count={{
                                  show: true,
                                  max: 10,
                                  strategy: (txt) => runes(txt).length,
                                  exceedFormatter: (txt, { max }) =>
                                    runes(txt).slice(0, max).join("")
                                }}
                              />
                              {contact.contact_number.length < 10 &&
                                contact.contact_number.length > 0 && (
                                  <div style={{ color: "red", marginTop: "5px" }}>
                                    {"El número debe contener 10 dígitos"}
                                  </div>
                                )}
                            </div>
                          </Col>
                        </Row>
                      ))}
                  </Col>
                  <Col span={24}>
                    <Text className="locationLabels" style={{ display: "flex" }}>
                      Contacto punto destino
                    </Text>
                    {dataContacts
                      .filter((f) => f.contact_type == 2)
                      .map((contact, index) => (
                        <Row key={`contacto-destino-${index}-${contact.key}`} gutter={32}>
                          <Col span={12}>
                            <Input
                              placeholder="Nombre del contacto"
                              className="puntoOrigen dateInputForm"
                              key={contact.key}
                              value={contact.name}
                              onChange={(e) => {
                                updateContacts(contact.key, "name", e.target.value);
                              }}
                            />
                          </Col>
                          <Col span={12}>
                            <div>
                              <Input
                                placeholder="Teléfono: 000 000 0000"
                                className="puntoOrigen dateInputForm"
                                key={contact.key}
                                value={contact.contact_number}
                                onChange={(e) => {
                                  const { value: inputValue } = e.target;
                                  const reg = /^-?\d*(\.\d*)?$/;
                                  if (
                                    reg.test(inputValue) ||
                                    inputValue === "" ||
                                    inputValue === "-"
                                  ) {
                                    updateContacts(contact.key, "contact_number", inputValue);
                                  }
                                }}
                                count={{
                                  show: true,
                                  max: 10,
                                  strategy: (txt) => runes(txt).length,
                                  exceedFormatter: (txt, { max }) =>
                                    runes(txt).slice(0, max).join("")
                                }}
                              />
                              {contact.contact_number.length < 10 &&
                                contact.contact_number.length > 0 && (
                                  <div style={{ color: "red", marginTop: "5px" }}>
                                    {"El número debe contener 10 dígitos"}
                                  </div>
                                )}
                            </div>
                          </Col>
                        </Row>
                      ))}
                  </Col>
                </Row>
                <Row style={{ marginTop: "1rem" }}>
                  <Col
                    span={24}
                    style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}
                  >
                    <Flex align="center" justify="center">
                      <UserPlus size={24} />
                      <button
                        onClick={() => setIsOpenModalContacts(true)}
                        className="btnagregarpsl"
                      >
                        Agregar otro contacto
                      </button>
                    </Flex>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <Container>
      {contextHolder}
      {/* ------------Main Info Order-------------- */}
      <Flex className="orderContainer">
        <Row style={{ width: "100%" }}>
          <Col span={24} style={{ marginBottom: "1.5rem" }}>
            <Flex gap="middle">
              <button
                type="button"
                className={["tripTypes", typeactive === "1" ? "active" : undefined].join(" ")}
                onClick={() => handleTypeClick("1")}
              >
                <div className="tripTypeIcons">
                  <img className="icon" loading="lazy" alt="" src="/images/logistics/truck.svg" />
                  <div className="text">Carga</div>
                </div>
              </button>
              <button
                type="button"
                id={"2"}
                className={["tripTypes", typeactive === "2" ? "active" : undefined].join(" ")}
                onClick={() => handleTypeClick("2")}
              >
                <div className="tripTypeIcons">
                  <img className="icon" loading="lazy" alt="" src="/images/logistics/izaje.svg" />
                  <div className="text">Izaje</div>
                </div>
              </button>
              <button
                type="button"
                id={"3"}
                className={["tripTypes", typeactive === "3" ? "active" : undefined].join(" ")}
                onClick={() => handleTypeClick("3")}
              >
                <div className="tripTypeIcons">
                  <img className="icon" loading="lazy" alt="" src="/images/logistics/users.svg" />
                  <div className="text">Personal</div>
                </div>
              </button>
            </Flex>
          </Col>
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
            span={24}
            style={{
              marginTop: "1.5rem",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <Flex gap="middle" align="flex-end">
              <Button
                disabled={!isButtonSubmitEnabled}
                loading={isLoading}
                className="active"
                style={{ fontWeight: "bold" }}
                onClick={() => {
                  onCreateOrder();
                }}
              >
                Confirmar
              </Button>
            </Flex>
          </Col>
        </Row>
      </Flex>
      <ModalAddContact
        isOpen={isOpenModalContacts}
        onClose={() => setIsOpenModalContacts(false)}
        setDataContacts={setDataContacts}
      />
    </Container>
  );
};
