/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import { IViewOption } from "../../CreateOrderVieww";

import { MAPS_ACCESS_TOKEN } from "@/utils/constants/globalConstants";

// mapbox
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import "./schedulingView.scss";
import SelectableIconButtons, {
  TripTypeOption
} from "@/components/atoms/SelectableIconButtons/SelectableIconButtons";
import { Flex } from "antd";
import { Calendar, Crane, Truck, User } from "@phosphor-icons/react";

interface SchedulingViewProps {
  setView: React.Dispatch<React.SetStateAction<IViewOption>>;
}

const SchedulingView: React.FC<SchedulingViewProps> = ({ setView }) => {
  const [typeActive, setTypeActive] = useState("1");

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapsAccessToken = MAPS_ACCESS_TOKEN;
  const fixedMapStyle = "mapbox://styles/mapbox/streets-v12";
  const mapContainerRef = useRef(null);

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

  return (
    <div className="schedulingView">
      {/* Form */}
      <Flex vertical>
        <SelectableIconButtons
          options={tripTypeOptions}
          activeId={typeActive}
          onChange={setTypeActive}
        />

        {/* TO DO: Add the locationsComponent  */}

        {/* TO DO: Add the order Summary card  */}
      </Flex>

      {/* MAP */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "500px",
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
