import { UserInfoView } from "@/components/organisms/logistics/configuration/users/userInfo/userInfo";

type Props = {
  params: {
    id: string;
    userId: string;
  };
};

export default function USerPage({ params }: Props) {
  return <UserInfoView params={params} />;
}
