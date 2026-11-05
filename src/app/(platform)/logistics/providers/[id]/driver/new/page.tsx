import { CreateDriverView } from "@/components/organisms/logistics/driver/createDriver/createDriver";

type Props = {
  params: {
    id: string;
    driverId: string;
  };
};

export default function NewDriverPage({ params }: Props) {
  return <CreateDriverView params={params} />;
}
