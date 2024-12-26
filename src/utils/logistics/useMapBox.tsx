import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { getTravelDuration } from "./maps";

interface UseMapboxHookProps {
  mapsAccessToken?: string;
  geometry: any;
  start_longitude: number;
  start_latitude: number;
  end_longitude: number;
  end_latitude: number;
  centerMap: boolean;
}

export const useMapbox = ({
  geometry,
  start_longitude,
  start_latitude,
  end_longitude,
  end_latitude,
  mapsAccessToken = "pk.eyJ1IjoibWFyY29zcm9kcmlndWV6IiwiYSI6ImNtNTQwc3J4ajIyaTYyanEzenBocmozd3kifQ.McenmWcjdP9vdwvdZQJRuA",
  centerMap
}: UseMapboxHookProps) => {
  const origin = useRef<[number, number] | null>(null);
  const destination = useRef<[number, number] | null>(null);
  const mapContainerRef = useRef(null);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [timetravel, setTimetravel] = useState<string | null>(null);
  const mapStyle = "mapbox://styles/mapbox/streets-v12";

  useEffect(() => {
    loadTravelData();
  }, [geometry]);

  const loadTravelData = async () => {
    const routes = geometry;
    if (routes != undefined) {
      origin.current = [start_longitude, start_latitude];
      destination.current = [end_longitude, end_latitude];
      const { distance, duration, geometry } = routes[0];
      setRouteGeometry(geometry); // Set the route geometry
      setDistance(parseFloat((distance / 1000).toFixed(0)) + " Km");
      const hrs = getTravelDuration(duration);
      setTimetravel(hrs + " Hrs");
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = mapsAccessToken;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: { lon: -74.07231699675322, lat: 4.66336863727521 }, // Default center
      zoom: 12,
      attributionControl: false
    });

    map.on("style.load", () => {
      const compassControl = new mapboxgl.NavigationControl({ showCompass: true });
      map.addControl(compassControl, "top-right");

      if (origin.current) {
        new mapboxgl.Marker().setLngLat(origin.current).addTo(map);
      }

      if (destination.current) {
        new mapboxgl.Marker().setLngLat(destination.current).addTo(map);
      }

      if (routeGeometry) {
        const datajson: GeoJSON.Feature = {
          type: "Feature",
          geometry: routeGeometry,
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
      }

      if (centerMap) {
        map.setCenter(origin.current!);
        map.setZoom(14);
      } else if (routeGeometry) {
        const bounds = routeGeometry.coordinates.reduce(
          (bounds: any, coord: any) => bounds.extend(coord),
          new mapboxgl.LngLatBounds()
        );

        map.fitBounds(bounds, { padding: 50 });
      }
    });
    return () => {
      map.remove();
    };
  }, [mapStyle, routeGeometry, origin, destination, centerMap]);

  return { routeGeometry, distance, timetravel, mapContainerRef };
};
