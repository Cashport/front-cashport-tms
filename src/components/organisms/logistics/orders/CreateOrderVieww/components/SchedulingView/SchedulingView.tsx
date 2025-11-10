/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Control, UseFormResetField, UseFormSetValue, useWatch } from "react-hook-form";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Flex, message } from "antd";
import { Calendar, Crane, Truck, User } from "@phosphor-icons/react";
import axios, { AxiosResponse } from "axios";

// services and utils
import { MAPS_ACCESS_TOKEN } from "@/utils/constants/globalConstants";
import { getAllLocations } from "@/services/logistics/locations";
import { getFrequentRoute } from "@/services/logistics/transfer-orders";

// mapbox
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Components
import SelectLocationAndTime from "./SelectLocationAndTime/SelectLocationAndTime";
import SelectableIconButtons, {
  TripTypeOption
} from "@/components/atoms/SelectableIconButtons/SelectableIconButtons";
import SummaryCard from "./SummaryCard/SummaryCard";

import {
  IDirectionsMapboxResponse,
  IGeometry,
  IGetFrequentRoutes,
  ISelectLocation
} from "@/types/logistics/schema";

import { IFormCreateOrder } from "../../CreateOrderVieww";

import "./schedulingView.scss";

dayjs.extend(duration);

export interface ITripInfoMap {
  distance: number;
  duration: number;
  geometry: IGeometry;
}

export interface ISelectOption {
  label: string;
  value: number;
}

interface SchedulingViewProps {
  control: Control<IFormCreateOrder, any>;
  setValue: UseFormSetValue<IFormCreateOrder>;
  resetField: UseFormResetField<IFormCreateOrder>;
}

const SchedulingView: React.FC<SchedulingViewProps> = ({ control, setValue, resetField }) => {
  const [locationOptions, setLocationOptions] = useState<ISelectLocation[]>([]);
  const typeActive = useWatch({ control, name: "typeActive" });
  const tripDetails = useWatch({ control, name: "TripDetails" }) ?? [];
  const [isFixRate, setIsFixRate] = useState(false);

  const timeBasedOnSelectedDateTimeHours = useMemo(() => {
    if (typeActive === "2") {
      const selectedHours = tripDetails[0]?.raisingNum ?? 0;
      return {
        days: 0,
        hours: selectedHours
      };
    }
    const originDate = tripDetails[0]?.date;
    const originTime = tripDetails[0]?.time;
    const destinationDate = tripDetails[tripDetails.length - 1]?.date;
    const destinationTime = tripDetails[tripDetails.length - 1]?.time;

    // Verificar que todos los valores existen
    if (!originDate || !originTime || !destinationDate || !destinationTime) {
      return undefined;
    }

    try {
      // Combinar fecha y hora de origen
      // originDate ya es un objeto Dayjs con hora 00:00
      // originTime es un objeto Dayjs con la hora pero fecha actual
      const originDateTime = originDate
        .hour(originTime.hour())
        .minute(originTime.minute())
        .second(originTime.second());

      // Combinar fecha y hora de destino
      const destinationDateTime = destinationDate
        .hour(destinationTime.hour())
        .minute(destinationTime.minute())
        .second(destinationTime.second());

      // Calcular la diferencia
      const diffInMilliseconds = destinationDateTime.diff(originDateTime);

      // Si la diferencia es negativa, el destino es anterior al origen
      if (diffInMilliseconds < 0) {
        console.warn("La fecha/hora de destino es anterior a la de origen");

        return {
          days: 0,
          hours: 0
        };
      }

      // Crear un objeto duration
      const duration = dayjs.duration(diffInMilliseconds);

      // Extraer días, horas y minutos
      const days = Math.floor(duration.asDays());
      const hours = duration.hours();
      return {
        days,
        hours
      };
    } catch (error) {
      console.error("Error calculando el tiempo:", error);
      return undefined;
    }
  }, [tripDetails]);

  // Refs para el mapa y los marcadores
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const origin = useRef<any>([]);
  const [originLocation, setOriginLocation] = useState<ISelectLocation>();
  const destination = useRef<any>([]);
  const [destinationLocation, setDestinationLocation] = useState<ISelectLocation>();
  const [tripInfoMap, setTripInfoMap] = useState<ITripInfoMap>();

  const mapsAccessToken = MAPS_ACCESS_TOKEN;
  const fixedMapStyle = "mapbox://styles/mapbox/streets-v12";
  const mapContainerRef = useRef(null);

  // setea valor por defecto typActive
  useEffect(() => {
    if (!typeActive) setValue("typeActive", "1");
  }, []);

  //   get de las ubicaciones
  useEffect(() => {
    const loadLocations = async () => {
      if (locationOptions.length) return;
      const result = await getAllLocations();
      if (result?.data?.length) {
        setLocationOptions(result.data);
      }
    };
    loadLocations();
  }, []);

  // Inicializa el mapa solo una vez
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return; // Evita re-inicializar el mapa

    mapboxgl.accessToken = mapsAccessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: fixedMapStyle,
      center: { lon: -74.07231699675322, lat: 4.66336863727521 },
      zoom: 12,
      attributionControl: false,
      localIdeographFontFamily: "sans-serif" // Evita llamadas innecesarias a fuentes
    });

    mapRef.current = map; // Guarda la instancia del mapa para evitar re-inicializarlo

    map.on("style.load", () => {
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");

      // Modificar todas las capas de texto para evitar la carga de fuentes remotas
      map.getStyle().layers.forEach((layer) => {
        if (layer.type === "symbol" && layer.layout?.["text-field"]) {
          map.setLayoutProperty(layer.id, "text-font", ["Arial Unicode MS Regular"]);
        }
      });
    });

    return () => map.remove(); // Limpieza cuando el componente se desmonta
  }, []);

  // Ejecutar `calcRouteDirection` solo cuando `origin` o `destination` cambien
  useEffect(() => {
    if (origin.current.length > 0 && destination.current.length > 0) {
      calcRouteDirection();
    }
  }, [originLocation, destinationLocation]);

  // actualiza el mapa cuando se cambia el origen y destino
  useEffect(() => {
    if (!mapRef.current || !tripInfoMap?.geometry) return;

    const map = mapRef.current;

    // Elimina la fuente y capa existentes para evitar superposiciones
    if (map.getSource("route")) {
      map.removeLayer("route");
      map.removeSource("route");
    }

    const datajson: GeoJSON.Feature = {
      type: "Feature",
      geometry: tripInfoMap.geometry as any,
      properties: {}
    };

    map.addSource("route", { type: "geojson", data: datajson });

    map.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#3FB1CE", "line-width": 6 }
    });

    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
    }

    // Agregar nuevo marcador de origen
    if (origin.current) {
      originMarkerRef.current = new mapboxgl.Marker().setLngLat(origin.current).addTo(map);
    }

    // Agregar nuevo marcador de destino
    if (destination.current) {
      destinationMarkerRef.current = new mapboxgl.Marker()
        .setLngLat(destination.current)
        .addTo(map);
    }

    if (originLocation?.id === destinationLocation?.id) {
      map.setCenter(origin.current);
      map.setZoom(14);
    } else {
      const bounds = tripInfoMap?.geometry.coordinates.reduce(
        (bounds: any, coord: any) => bounds.extend(coord),
        new mapboxgl.LngLatBounds()
      );
      map.fitBounds(bounds, { padding: 50 });
    }
  }, [JSON.stringify(tripInfoMap?.geometry), origin, destination]);

  // Cambia origen
  const onChangeOrigin = (value: number) => {
    const selectedOrigin = locationOptions.find((item) => item.id === value);
    if (selectedOrigin) {
      origin.current = [selectedOrigin.longitude, selectedOrigin.latitude];
      setOriginLocation(selectedOrigin);

      if (typeActive === "2") {
        destination.current = [selectedOrigin.longitude, selectedOrigin.latitude];
        setDestinationLocation(selectedOrigin);
      }
    }
  };

  const onChangeDestination = (value: number) => {
    const selectedDestination = locationOptions.find((item) => item.id === value);
    if (selectedDestination) {
      destination.current = [selectedDestination.longitude, selectedDestination.latitude];
      setDestinationLocation(selectedDestination);
    }
  };

  // Función para usar una ruta frecuente como ruta principal
  const applyFrequentRoute = (route: IGetFrequentRoutes) => {
    if (!route.jsonRoute || route.jsonRoute.length === 0) return;

    const selectedRoute = route.jsonRoute[0]; // Usar la primera ruta del array

    // Actualizar el estado de tripInfoMap con los datos de la ruta frecuente
    setTripInfoMap({
      distance: selectedRoute.distance,
      duration: selectedRoute.duration,
      geometry: selectedRoute.geometry
    });

    setValue("infoMap", {
      distance: selectedRoute.distance,
      duration: selectedRoute.duration,
      geometry: selectedRoute.geometry
    });

    // Actualizar el formulario con la geometría de la ruta frecuente
    setValue("geometry", route.jsonRoute);
  };

  // Función para obtener y procesar rutas frecuentes
  const fetchAndProcessFrequentRoutes = async (originId: number, destinationId: number) => {
    try {
      const routes = await getFrequentRoute(originId, destinationId);
      // Si hay rutas frecuentes, usar la primera automáticamente
      if (routes) {
        applyFrequentRoute(routes);
        return true; // Indica que se usó una ruta frecuente
      }

      return false; // No hay rutas frecuentes
    } catch (error) {
      console.error("Error obteniendo rutas frecuentes:", error);

      return false;
    }
  };

  // calculate direction
  const calcRouteDirection = async () => {
    if (origin.current.length == 0 || destination.current.length == 0) return;

    if (originLocation && destinationLocation) {
      const hasFrequentRoute = await fetchAndProcessFrequentRoutes(
        originLocation.id,
        destinationLocation.id
      );

      // Si encontró rutas frecuentes, no hacer la petición a Mapbox
      if (hasFrequentRoute) {
        console.info("Usando ruta frecuente, omitiendo petición a Mapbox");
        return;
      }
    }

    try {
      const response: AxiosResponse<IDirectionsMapboxResponse> = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.current[0]},${origin.current[1]};${destination.current[0]},${destination.current[1]}?steps=true&geometries=geojson&access_token=${mapsAccessToken}`
      );

      const routes = response.data.routes;
      //   TO DO: revisar si es necesario limpiar las rutas
      if (routes != undefined && routes.length > 0) {
        routes[0].legs = [];
      }

      // hacemos el set pero dentro del valor geometry en el form
      setValue("geometry", routes);
      // Check if any routes are returned
      if (routes.length > 0) {
        const { distance, duration, geometry } = routes[0];

        setTripInfoMap({
          distance: distance,
          duration: duration,
          geometry: geometry
        });

        setValue("infoMap", {
          distance: distance,
          duration: duration,
          geometry: geometry
        });
      } else {
        // No routes found
        throw new Error("No se encontraron rutas");
      }
    } catch (error) {
      // Handle error
      console.error("Error calculating directions:", error as any);
      if (error instanceof Error) {
        message.error("Error calculando direcciones: " + error.message);
      } else {
        message.error("Error calculando direcciones: " + error);
      }
    }
  };

  const handleOrderTypeChange = (id: "1" | "2" | "3") => {
    setValue("typeActive", id);
    const emptyValue = [{ id: undefined, quantity: 1 }];
    const emptyVehicle = [
      { id: undefined, quantity: 1, ocupationM3: 0, ocupationKg: 0, ocupationPassengers: null }
    ];
    resetField("material", {
      defaultValue: emptyValue
    });
    resetField("people", {
      defaultValue: emptyValue
    });
    resetField("suggestedVehicle", {
      defaultValue: emptyVehicle
    });
    resetField("otherServices", {
      defaultValue: undefined
    });
  };

  return (
    <div className="schedulingView">
      {/* Form */}
      <Flex vertical gap={"1.5rem"} style={{ paddingLeft: "1rem" }}>
        <Flex gap="1rem" align="center">
          <SelectableIconButtons
            options={tripTypeOptions}
            activeId={typeActive}
            onChange={handleOrderTypeChange}
            disabled={isFixRate}
            allInactive={isFixRate}
          />
          <button
            type="button"
            className={`iconButton ${isFixRate ? "active" : ""}`}
            onClick={() => {
              setIsFixRate(!isFixRate);
              setValue("isFixRate", !isFixRate);
            }}
          >
            <Calendar size={24} />
            <div className="text">Renta/Disponibilidad</div>
          </button>
        </Flex>

        {isFixRate && (
          <SelectableIconButtons
            options={tripTypeOptions}
            activeId={typeActive}
            onChange={handleOrderTypeChange}
          />
        )}

        <SelectLocationAndTime
          selectedType={typeActive}
          control={control}
          locationOptions={locationOptions.map((loc) => ({
            label: loc.description,
            value: loc.id
          }))}
          onChangeOrigin={onChangeOrigin}
          onChangeDestination={onChangeDestination}
          setValue={setValue}
        />

        <SummaryCard
          distance={tripInfoMap?.distance}
          duration={tripInfoMap?.duration}
          selectedTripType={typeActive}
          durationBasedOnSelects={timeBasedOnSelectedDateTimeHours}
          isFixRate={isFixRate}
        />
      </Flex>

      {/* MAP */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "720px",
          border: "1px #F7F7F7 solid"
        }}
      />
    </div>
  );
};

export default SchedulingView;

const tripTypeOptions: TripTypeOption[] = [
  {
    id: "1",
    title: "Carga",
    icon: <Truck size={24} />
  },
  {
    id: "2",
    title: "Izaje",
    icon: <Crane size={24} />
  },
  {
    id: "3",
    title: "Personal",
    icon: <User size={24} />
  }
];
