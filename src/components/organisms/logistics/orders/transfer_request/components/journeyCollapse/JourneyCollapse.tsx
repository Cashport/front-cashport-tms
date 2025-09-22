import { Collapse, CollapseProps } from "antd";
import TitleComponent from "../titles/JourneyTitle";

type Props = {
  index: number;
  id_type_service: number;
  start_location_desc: string;
  end_location_desc: string;
  is_community?: 0 | 1;
  community_name?: string;
  tag: any;
  openTabs: number[];
  setOpenTabs: any;
};
export default function JourneyCollapse({
  index,
  id_type_service,
  start_location_desc,
  end_location_desc,
  is_community = 0,
  community_name,
  openTabs,
  setOpenTabs,
  tag
}: Readonly<Props>) {
  const handleChange = () => {
    if (openTabs.includes(index)) {
      setOpenTabs(openTabs.filter((a) => a !== index));
    } else {
      setOpenTabs([...openTabs, index]);
    }
  };
  const getKey = (index: number) => `journey-${index}`;
  const actionsOptionsVehiclesSelection: CollapseProps["items"] = [
    {
      key: getKey(index),
      style: { border: "1px solid #dddddd", borderRadius: "4px" },
      label: (
        <TitleComponent
          id_type_service={id_type_service}
          id={index}
          isOpen={openTabs.includes(index)}
          start_location_desc={start_location_desc}
          end_location_desc={end_location_desc}
          handleChange={handleChange}
          community_name={community_name}
          is_community={is_community}
        />
      ),
      showArrow: false,
      children: tag
    }
  ];
  return (
    <Collapse defaultActiveKey={openTabs.map(getKey)} expandIconPosition="end" ghost items={actionsOptionsVehiclesSelection} key={index} />
  );
}
