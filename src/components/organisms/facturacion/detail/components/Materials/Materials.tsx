"use client";
import { Button, Col, Flex, Row, Table, TableProps, Typography } from "antd";
import { Radioactive, Warning } from "@phosphor-icons/react";
import { IMaterial } from "@/types/logistics/schema";
import styles from "./materials.module.scss";

interface MaterialsDataProps {
  materials: IMaterial[];
}

const { Text } = Typography;

export default function Materials({ materials }: MaterialsDataProps) {
  const columns: TableProps<IMaterial>["columns"] = [
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.quantity - b.quantity,
      showSorterTooltip: false
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "SKU",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false
    },
    {
      title: "Nombre",
      key: "name",
      dataIndex: "description",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.description.localeCompare(b.description),
      showSorterTooltip: false
    },
    {
      title: "Volumen",
      key: "volume",
      dataIndex: "m3_volume",
      render: (amount) => <Text>{amount}</Text>,
      sorter: (a, b) => a.m3_volume - b.m3_volume,
      showSorterTooltip: false
    },
    {
      title: "Alto",
      key: "height",
      dataIndex: "mt_height",
      render: (amount) => <Text>{amount} m</Text>,
      sorter: (a, b) => a.mt_height - b.mt_height,
      showSorterTooltip: false
    },
    {
      title: "Ancho",
      key: "width",
      dataIndex: "mt_width",
      render: (amount) => <Text>{amount} m</Text>,
      sorter: (a, b) => a.mt_width - b.mt_width,
      showSorterTooltip: false
    },
    {
      title: "Largo",
      key: "length",
      dataIndex: "mt_length",
      render: (amount) => <Text>{amount} m</Text>,
      sorter: (a, b) => a.mt_length - b.mt_length,
      showSorterTooltip: false
    },
    {
      title: "Peso",
      key: "weight",
      dataIndex: "kg_weight",
      render: (amount) => <Text>{amount} kg</Text>,
      sorter: (a, b) => a.kg_weight - b.kg_weight,
      showSorterTooltip: false
    },
    {
      title: "",
      key: "buttonSee",
      width: 64,
      dataIndex: "",
      render: (text, record) => (
        <Flex style={{ gap: "6px", justifyContent: "flex-end" }}>
          <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Radioactive size={"1.3rem"} />} />
          <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Warning size={"1.3rem"} />} />
        </Flex>
      )
    }
  ];

  return (
    <Flex>
      <Row style={{ width: "100%" }}>
        <Col span={24}>
          <Flex vertical style={{ width: "100%" }}>
            <p className={styles.title}>Materiales</p>
            <Row>
              <Col span={24} style={{ paddingTop: "0.5rem" }}>
                <Table
                  style={{ width: "100%" }}
                  columns={columns}
                  dataSource={materials}
                  pagination={false}
                />
                <hr style={{ borderTop: "1px solid #f7f7f7" }}></hr>
              </Col>
            </Row>
          </Flex>
        </Col>
      </Row>
    </Flex>
  );
}
