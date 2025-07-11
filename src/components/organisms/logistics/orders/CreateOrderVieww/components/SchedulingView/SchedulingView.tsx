/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { Flex, message } from "antd";
import { Calendar, Crane, Truck, User } from "@phosphor-icons/react";
import axios, { AxiosResponse } from "axios";

// services and utils
import { MAPS_ACCESS_TOKEN } from "@/utils/constants/globalConstants";
import { getAllLocations } from "@/services/logistics/locations";

// mapbox
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Components
import SelectLocationAndTime from "./SelectLocationAndTime/SelectLocationAndTime";
import SelectableIconButtons, {
  TripTypeOption
} from "@/components/atoms/SelectableIconButtons/SelectableIconButtons";
import SummaryCard from "./SummaryCard/SummaryCard";

import { IDirectionsMapboxResponse, IGeometry, ISelectLocation } from "@/types/logistics/schema";

import { IFormCreateOrder } from "../../CreateOrderVieww";

import "./schedulingView.scss";

interface ITripInfoMap {
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
}

const SchedulingView: React.FC<SchedulingViewProps> = ({ control, setValue }) => {
  const [locationOptions, setLocationOptions] = useState<ISelectLocation[]>([]);
  const typeActive = useWatch({ control, name: "typeActive" }) ?? "1";
  const tripDetails = useWatch({ control, name: "TripDetails" }) ?? [];

  const timeBasedOnSelectedDateAndTime = useMemo(() => {
    const originDate = tripDetails[0]?.date;
    const originTime = tripDetails[0]?.time;

    const destinationDate = tripDetails[tripDetails.length - 1]?.date;
    const destinationTime = tripDetails[tripDetails.length - 1]?.time;
    // console.log("Origin Date:", originDate);
    // console.log("originTime:", originTime);
    // console.log("Destination Date:", destinationDate);
    // console.log("Destination Time:", destinationTime);

    return undefined;
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
      console.log("Locations:", result);
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
    console.log("Origin:", origin.current, "Destination:", destination.current);
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

  // calculate direction
  const calcRouteDirection = async () => {
    if (origin.current.length == 0 || destination.current.length == 0) return;

    try {
      const response: AxiosResponse<IDirectionsMapboxResponse> = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.current[0]},${origin.current[1]};${destination.current[0]},${destination.current[1]}?steps=true&geometries=geojson&access_token=${mapsAccessToken}`
      );

      const routes = response.data.routes;
      //   TO DO: revisar si es necesario limpiar las rutas
      //   if (routes != undefined && routes.length > 0) {
      //     routes[0].legs = [];
      //   }

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

  return (
    <div className="schedulingView">
      {/* Form */}
      <Flex vertical gap={"1.5rem"} style={{ paddingLeft: "1rem" }}>
        <SelectableIconButtons
          options={tripTypeOptions}
          activeId={typeActive}
          onChange={(id) => setValue("typeActive", id)}
        />

        <SelectLocationAndTime
          selectedType={typeActive}
          control={control}
          locationOptions={locationOptions.map((loc) => ({
            label: loc.description,
            value: loc.id
          }))}
          onChangeOrigin={onChangeOrigin}
          onChangeDestination={onChangeDestination}
        />

        <SummaryCard
          distance={tripInfoMap?.distance}
          duration={tripInfoMap?.duration}
          selectedTripType={typeActive}
          durationBasedOnSelects={timeBasedOnSelectedDateAndTime}
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
  },
  {
    id: "4",
    title: "Renta fija",
    icon: <Calendar size={24} />
  }
];
