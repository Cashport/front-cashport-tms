import { VehicleInfoView } from "@/components/organisms/logistics/vehicles/vehiclesInfo/VehicleInfo";

interface Props {
  params: {
    id: string;
    vehicleId: string;
  };
}

export default function VehiclePage({ params }: Props) {
  return <VehicleInfoView idParam={params.vehicleId} params={params} />;
}
