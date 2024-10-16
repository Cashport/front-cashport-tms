import {
  IMaterial,
  ITransferOrderPersons,
  ITransferOrderRequest,
  ITransferOrdersRequest
} from "@/types/logistics/schema";
import { Button, Col, Collapse, Flex, Row, Table, TableProps, Tabs, Typography } from "antd";
import TabTransferOrder from "../tabMap/TabTransferOrder";
import { Radioactive } from "@phosphor-icons/react";
import { Warning } from "phosphor-react";
import TabPane from "antd/es/tabs/TabPane";
import { Responsibles } from "../../../DetailsOrderView/components/Responsibles/Responsibles";
import AditionalInfo from "@/components/organisms/logistics/acept_carrier/detail/components/AditionalInfo/AditionalInfo";
import { formatNumber } from "@/utils/utils";

const { Title, Text } = Typography;

type PricingStepOneProps = {
  ordersId: number[];
  orders: ITransferOrdersRequest | undefined;
};
export default function PricingStepOne({ ordersId, orders }: Readonly<PricingStepOneProps>) {
  const columnsCarga: TableProps<IMaterial>["columns"] = [
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "name",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.quantity - b.quantity,
      showSorterTooltip: false
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "age",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false
    },
    {
      title: "Nombre",
      dataIndex: "description",
      key: "address",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.description.localeCompare(b.description),
      showSorterTooltip: false
    },
    {
      title: "Volumen",
      dataIndex: "m3_volume",
      key: "address",
      render: (amount, record) => <Text>{formatNumber(amount * record.quantity)}</Text>,
      sorter: (a, b) => a.m3_volume - b.m3_volume,
      showSorterTooltip: false
    },
    {
      title: "Alto",
      dataIndex: "mt_height",
      key: "address",
      render: (amount) => <Text>{amount} m</Text>,
      sorter: (a, b) => a.mt_height - b.mt_height,
      showSorterTooltip: false
    },
    {
      title: "Ancho",
      key: "address",
      dataIndex: "mt_length",
      render: (amount) => <Text>{amount} m</Text>,
      sorter: (a, b) => a.mt_length - b.mt_length,
      showSorterTooltip: false
    },
    {
      title: "Largo",
      key: "address",
      dataIndex: "mt_width",
      render: (amount) => <Text>{amount} m</Text>,
      sorter: (a, b) => a.mt_width - b.mt_width,
      showSorterTooltip: false
    },
    {
      title: "Peso",
      key: "address",
      dataIndex: "kg_weight",
      render: (amount, record) => <Text>{formatNumber(amount * record.quantity)} kg</Text>,
      sorter: (a, b) => a.kg_weight - b.kg_weight,
      showSorterTooltip: false
    },
    {
      title: "Alertas",
      dataIndex: "address",
      key: "address",
      // eslint-disable-next-line no-unused-vars
      render: (text, record) => (
        <Flex style={{ gap: "6px", justifyContent: "flex-end" }}>
          <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Radioactive size={"1.3rem"} />} />
          <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Warning size={"1.3rem"} />} />
        </Flex>
      )
    }
  ];

  const columnsCargaPersonas: TableProps<ITransferOrderPersons>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      showSorterTooltip: false
    },
    {
      title: "Teléfono",
      dataIndex: "contact_number",
      key: "contact_number",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.contact_number.localeCompare(b.contact_number),
      showSorterTooltip: false
    },
    {
      title: "PSL",
      dataIndex: "psl_desc",
      key: "psl_desc",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.psl_desc.localeCompare(b.psl_desc),
      showSorterTooltip: false
    },
    {
      title: "CC",
      dataIndex: "cost_center_desc",
      key: "cost_center_desc",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.cost_center_desc.localeCompare(b.cost_center_desc),
      showSorterTooltip: false
    }
  ];
  const actionsOptions = (orderRequest: ITransferOrderRequest | undefined) => [
    {
      key: 0,
      style: { border: "1px solid #dddddd", borderRadius: "4px" },
      label: (
        <div className="collapseByAction__label">
          <Title className="collapseByAction__label__text" level={4}>
            Datos del viaje
          </Title>
        </div>
      ),
      children: <TabTransferOrder orderRequest={orderRequest} />
    },
    {
      key: 1,
      style: { border: "1px solid #dddddd", borderRadius: "4px" },
      label: (
        <div className="collapseByAction__label">
          <Title className="collapseByAction__label__text" level={4}>
            Responsables
          </Title>
        </div>
      ),
      children: (
        <Flex style={{ marginBottom: "24px" }}>
          <Row style={{ width: "100%" }}>
            <Col span={24}>
              <Responsibles psls={orderRequest?.transfer_order_psl ?? []} insideCollapse={true} />
            </Col>
          </Row>
        </Flex>
      )
    },
    {
      key: 2,
      style: { border: "1px solid #dddddd", borderRadius: "4px" },
      label: (
        <div className="collapseByAction__label">
          <Title className="collapseByAction__label__text" level={4}>
            Información adicional
          </Title>
        </div>
      ),
      children: (
        <Flex style={{ marginBottom: "24px" }}>
          <Row style={{ width: "100%" }}>
            <Col span={24}>
              <AditionalInfo
                insideCollapse={true}
                documents={orderRequest?.transfer_order_documents ?? []}
                contacts={orderRequest?.transfer_order_contacts ?? []}
                otherRequirements={orderRequest?.transfer_order_other_requeriments ?? []}
                specialInstructions={orderRequest?.observation ?? ""}
                finalClient={orderRequest?.client_desc ?? ""}
              />
            </Col>
          </Row>
        </Flex>
      )
    },
    {
      key: 3,
      style: { border: "1px solid #dddddd", borderRadius: "4px" },
      label: (
        <div className="collapseByAction__label">
          <Title className="collapseByAction__label__text" level={4}>
            {(orderRequest?.id_service_type == 1 || orderRequest?.id_service_type == 2) &&
              `Materiales`}
            {orderRequest?.id_service_type == 3 && `Personas`}
          </Title>
        </div>
      ),
      children: (
        <div>
          <div>
            <label className="locationLabels" style={{ display: "flex" }}>
              <text>Vehículo Sugerido</text>
            </label>
            {orderRequest?.transfer_order_vehicles ? (
              orderRequest?.transfer_order_vehicles.map((a) => (
                <div className="vehicles_sugested" key={a.id}>
                  {a.vehicle_type_desc}
                </div>
              ))
            ) : (
              <p></p>
            )}
          </div>
          {(orderRequest?.id_service_type == 1 || orderRequest?.id_service_type == 2) && (
            <Table
              columns={columnsCarga}
              dataSource={orderRequest?.transfer_order_material?.map((tm) => ({
                ...tm.material[0],
                quantity: tm.quantity
              }))}
              pagination={false}
            />
          )}
          {orderRequest?.id_service_type == 3 && (
            <>
              {console.log(orderRequest.transfer_order_persons)}
              <Table
                columns={columnsCargaPersonas}
                dataSource={
                  orderRequest.transfer_order_persons ? orderRequest.transfer_order_persons : []
                }
              />
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <Flex style={{ width: "100%", flexDirection: "column" }}>
      <Flex style={{ flexDirection: "column" }}>
        <Tabs defaultActiveKey={String(ordersId[0])}>
          {ordersId.map((a) => (
            <TabPane key={a} tab={<h4>{a}</h4>} style={{ padding: "24px 0" }}>
              <Flex style={{ flexDirection: "column" }}>
                <Collapse
                  defaultActiveKey={"0"}
                  className="collapseByAction"
                  style={{ width: "100%" }}
                  expandIconPosition="end"
                  accordion={false}
                  bordered={false}
                  ghost
                  items={actionsOptions(orders?.orders.find((ord) => ord.id === a))}
                />
              </Flex>
            </TabPane>
          ))}
        </Tabs>
      </Flex>
    </Flex>
  );
}
