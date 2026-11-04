import { VehicleTable } from "@/components/molecules/tables/logistics/vehicleTable/vehicleTable";

type Props = {
  params: {
    id: string;
  };
};
export default function VehiclePage({ params }: Props) {
  return <VehicleTable params={params} />;
}
