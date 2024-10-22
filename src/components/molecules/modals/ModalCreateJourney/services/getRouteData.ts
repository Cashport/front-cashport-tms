import directions, { DirectionsResponse } from "@mapbox/mapbox-sdk/services/directions";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiamNib2JhZGkiLCJhIjoiY2x4aWgxejVsMW1ibjJtcHRha2xsNjcxbCJ9.CU7FHmPR635zv6_tl6kafA"; // Replace with your Mapbox token
const directionsService = directions({ accessToken: MAPBOX_TOKEN });

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const getRouteData = async (
  origin: [number, number], // [longitude, latitude]
  destination: [number, number]
): Promise<DirectionsResponse> => {
  try {
    console.log("getRouteData", "ORIGIN", origin, "DEST", destination);
    // const originLatLng = {
    //   latitude: origin[1],
    //   longitude: origin[0],
    // };

    // const destLatLng = {
    //   latitude: destination[1],
    //   longitude: destination[0],
    // };
    // const requestOptions = {
    //   geometry: 'geojson',
    //   profile: "driving",
    // };

    const response = await directionsService
      .getDirections({
        profile: "driving",
        waypoints: [{ coordinates: origin }, { coordinates: destination }],
        geometries: "geojson"
      })
      .send();
    console.log("response getRouteData", response);
    return response.body as any;
  } catch (error) {
    throw new Error(`Failed to fetch route data: ${error}`);
  }
};
