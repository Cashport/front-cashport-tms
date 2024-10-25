const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


export const calculateDistanceFromCurrentLocation = (currentLat: number, currentLon: number, coordinates: number[][]): number => {
  let totalDistance = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lon1] = coordinates[i];
    const [lat2, lon2] = coordinates[i + 1];

    // Calcular la distancia entre el punto actual y el siguiente en la lista
    const distance = haversineDistance(lat1, lon1, lat2, lon2);
    totalDistance += distance;
  }

  // Calcular la distancia desde la última coordenada hasta la ubicación actual
  const lastCoordinate = coordinates[coordinates.length - 1];
  const distanceToCurrentLocation = haversineDistance(lastCoordinate[1], lastCoordinate[0], currentLon, currentLat);

  totalDistance += distanceToCurrentLocation; // Añadir la distancia hasta la ubicación actual

  return Number(totalDistance.toFixed(1));
};