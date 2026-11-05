import { notFound } from "next/navigation";
import MapComponent from "@/components/organisms/map/Map";
import { MAP_V1_ENABLED } from "@/utils/constants/featureFlags";

const MapPage = () => {
  if (!MAP_V1_ENABLED) notFound();
  return <MapComponent />
}

export default MapPage
