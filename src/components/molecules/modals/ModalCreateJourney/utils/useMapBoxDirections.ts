import { useState, useEffect } from "react";
import { getRouteData } from "../services/getRouteData";
import { getTravelDuration } from "@/utils/logistics/maps";

const useMapboxDirections = (originCoordinates: any, destinationCoordinates: any) => {
  const [distance, setDistance] = useState<any>(null);
  const [duration, setDuration] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);

  const [timeTravel, setTimeTravel] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchRouteData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRouteData(originCoordinates, destinationCoordinates);
      const route = data.routes[0];
      const { distance, duration } = route;
      setRoute(data.routes);
      setDistance(distance / 1000); // Convertir metros a kilómetros
      setDuration(duration); // Convertir segundos a minutos
      const hrs = getTravelDuration(duration);
      setTimeTravel(hrs + " Hrs");
    } catch (err) {
      setError("Error al obtener la ruta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (originCoordinates && destinationCoordinates) {
      fetchRouteData();
    }
  }, [originCoordinates, destinationCoordinates]);

  return { distance, duration, timeTravel, route, loading, error };
};

export default useMapboxDirections;
