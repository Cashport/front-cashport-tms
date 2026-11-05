import { LocationInfoView } from "@/components/organisms/logistics/configuration/locations/locationInfo/locationInfo";

type Props = {
  params: {
    id: string;
    locationId: string;
  };
};

export default function LocationPage({ params }: Props) {
  return <LocationInfoView params={params} />;
}
