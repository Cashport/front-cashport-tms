import { notFound } from "next/navigation";
import { VehicleTowerView } from "@/modules/logistics/vehicle-tower";
import { MAP_V2_ENABLED } from "@/utils/constants/featureFlags";

const MapV2Page = () => {
  if (!MAP_V2_ENABLED) notFound();
  return <VehicleTowerView />;
};

export default MapV2Page;
