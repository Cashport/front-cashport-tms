import { DriverInfoView } from "@/components/organisms/logistics/driver/driverInfo/driverInfo";

type Props = {
  params: {
    id: string;
    driverId: string;
  };
};

export default function DriverPage({ params }: Props) {
  return <DriverInfoView params={params} />;
}
