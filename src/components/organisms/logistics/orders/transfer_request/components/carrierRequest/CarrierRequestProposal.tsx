import { Checkbox, Collapse, Flex, Radio, Tag, Typography } from "antd";
import style from "./CarrierRequestProposal.module.scss";
import { CarriersPricing, TripCarriersPricing } from "@/types/logistics/schema";
import { CollapseProps } from "antd/lib";
import { Star } from "phosphor-react";

const { Title, Text } = Typography;

type Props = {
  carrier: CarriersPricing;
};
export default function CarrierRequestProposal({ carrier }: Props) {
  const driverScore = (score: number) => {
    const star = [];
    for (let i = 0; i < 5; i++) {
      star.push(<Star key={i} weight={score - 1 >= i ? "fill" : "bold"} className={style.star} />);
    }
    return star;
  };
  const children = (
    <Flex gap={24} className={style.children}>
      <Flex gap={24} vertical>
        <Flex justify="space-between">
          <strong>Placas</strong> <div>{carrier.plate_number}</div>
        </Flex>
        <Flex justify="space-between">
          <strong>Conductor</strong> <div>{carrier.driver}</div>
        </Flex>
        <Flex justify="space-between">
          <strong>Teléfono</strong> <div>{carrier.phone}</div>
        </Flex>
        <Flex justify="space-between">
          <strong>Contrato</strong> <div>{carrier.driver_contract}</div>
        </Flex>
      </Flex>
      <Flex gap={24} vertical>
        <Flex justify="space-between">
          <strong>Sobre costo promedio</strong> <div>{carrier.driver_overcost}</div>
        </Flex>
        <Flex justify="space-between">
          <strong>Retraso promedio</strong> <div>{carrier.driver_delay}</div>
        </Flex>
        <Flex justify="space-between">
          <strong>Cantidad de viajes</strong> <div>{carrier.diver_trips}</div>
        </Flex>
        <Flex justify="space-between">
          <strong>Puntaje</strong> <div>{driverScore(carrier.driver_score)}</div>
        </Flex>
      </Flex>
    </Flex>
  );
  const itemsCollapse: CollapseProps["items"] = [
    {
      key: `carrier-${carrier.id}`,
      style: { border: "1px solid #dddddd", borderRadius: "4px" },
      label: <TitleComponent carrier={carrier} />,
      showArrow: true,
      children
    }
  ];
  return <Collapse bordered={false} ghost expandIconPosition="end" items={itemsCollapse} />;
}

const TitleComponent = ({ carrier }: { carrier: CarriersPricing }) => (
  <Flex justify="space-between" className={style.proposal}>
    <Flex gap={6} align="center">
      <Radio value={carrier.id}>
        <Title level={5} style={{ marginBottom: 0 }}>
          {carrier.carrier}
        </Title>
      </Radio>
      <Tag color={carrier.color} style={{ height: "fit-content" }}>
        {carrier.statusdesc}
      </Tag>
        <Text style={{ fontSize: "12px", fontWeight: "600" }}>{carrier.id_transfer_request} - {carrier.order_nro}</Text>
    </Flex>
    <Title level={5}>${carrier.amount.toLocaleString("es-CO")}</Title>
  </Flex>
);
