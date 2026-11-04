import { DriverTable } from "@/components/molecules/tables/logistics/driverTable/driverTable";

type Props = {
  params: {
    id: string;
  };
};

export default function DriverPage({ params }: Props) {
  return <DriverTable params={params} />;
}