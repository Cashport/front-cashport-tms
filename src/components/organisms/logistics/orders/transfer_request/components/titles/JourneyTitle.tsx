import { CraneTower } from "@phosphor-icons/react";
import { Typography } from "antd";
import { CaretDown, Truck, User } from "phosphor-react";
import CommunityIcon from "../communityIcon/CommunityIcon";

const { Text } = Typography;

type Props = {
  id_type_service: number;
  id: number;
  isOpen: boolean;
  start_location_desc: string;
  end_location_desc: string;
  handleChange: () => void;
  is_community?: 0 | 1;
  community_name?: string;
};
const TitleComponent = ({
  id_type_service,
  id,
  isOpen,
  start_location_desc,
  end_location_desc,
  is_community = 0,
  community_name,
  handleChange
}: Props) => {
  const serviceType =
    id_type_service === 1
      ? { title: "Carga", icon: <Truck size={27} color="#FFFFFF" weight="fill" /> }
      : id_type_service === 2
        ? { title: "Izaje", icon: <CraneTower size={27} color="#FFFFFF" weight="fill" /> }
        : { title: "Personal", icon: <User size={27} color="#FFFFFF" weight="fill" /> };

  return (
    <div className="collapseHeader" onClick={() => handleChange()}>
      <div className="collapseJustify">
        <div style={{ display: "flex", gap: 16 }}>
          <div className="collapseStateContainer">
            {serviceType.icon}
            <Text className="collapseState">{serviceType.title}</Text>
          </div>
          {!!is_community && <CommunityIcon communityName={community_name} withTooltip />}
        </div>
        <div>
          <CaretDown className={`collapseCaret ${isOpen && "collapseRotate"}`} size={24} />
        </div>
      </div>
      <div className="collapseFromTo">
        <div className="collapseFromToContainer">
          <Text className="collapseTitle">Origen</Text>
          <Text className="collapseSubtitle">{start_location_desc}</Text>
        </div>
        <div className="collapseFromToContainer collapseRight">
          <div className="collapseFromToContainer">
            <Text className="collapseTitle">Destino</Text>
            <Text className="collapseSubtitle">{end_location_desc}</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleComponent;
