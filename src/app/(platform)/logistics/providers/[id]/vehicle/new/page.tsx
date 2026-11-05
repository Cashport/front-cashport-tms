import { CreateVehicleView } from "@/components/organisms/logistics/vehicles/createVehicle/createVehicle";

type Props = {
  params: {
    id: string;
    vehicleId: string;
  };
};

export default function NewVehiclePage({ params }: Props) {
  return <CreateVehicleView params={params} />;
}
