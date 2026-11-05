import { MaterialInfoView } from "@/components/organisms/logistics/configuration/materials/materialInfo/materialInfo";

type Props = {
  params: {
    id: string;
    materialId: string;
  };
};

export default function MaterialPage({ params }: Props) {
  return <MaterialInfoView params={params} />;
}
