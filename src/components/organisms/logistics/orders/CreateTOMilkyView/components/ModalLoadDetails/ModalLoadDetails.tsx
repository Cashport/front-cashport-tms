import React from "react";
import { Flex, Modal, Table, TableProps } from "antd";
import UiTab from "@/components/ui/ui-tab";

import "./modalLoadDetails.scss";
import { WhatsappLogo } from "@phosphor-icons/react";

interface ModalLoadDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
}

const ModalLoadDetails: React.FC<ModalLoadDetailsProps> = ({
  isOpen,
  onClose,
  data = mockLoadData
}) => {
  const columns: TableProps<any>["columns"] = [
    {
      title: "Cant.",
      dataIndex: "quantiy",
      key: "quantiy",
      align: "center",
      width: 60
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      width: "30%"
    },
    {
      title: "Peso",
      dataIndex: "weight",
      key: "weight",
      render: (weight: number) => `${weight} kg`,
      align: "center"
    },
    {
      title: "Alto",
      dataIndex: "height",
      key: "height",
      render: (height: number) => `${height} m`,
      align: "center"
    },
    {
      title: "Ancho",
      dataIndex: "width",
      key: "width",
      render: (width: number) => `${width} m`,
      align: "center"
    },
    {
      title: "Volumen",
      dataIndex: "volume",
      key: "volume",
      render: (volume: number) => `${volume} m³`,
      align: "center"
    },
    {
      title: "Largo",
      dataIndex: "length",
      key: "length",
      render: (length: number) => `${length} m`,
      align: "center"
    }
  ];

  return (
    <Modal open={isOpen} onCancel={onClose} footer={null} title={null} width={800}>
      <h2 className="modalLoadDetails">Carga</h2>
      <UiTab
        tabs={data.map((tab: any, i: number) => ({
          key: tab.user,
          label: `Carga ${i + 1}`,
          children: (
            <Flex vertical>
              <Flex vertical gap={"1rem"} className="modalLoadDetails__loadInfo">
                <p>
                  <strong>Usuario:</strong> {tab.user} •{" "}
                  <WhatsappLogo size={14} color="#128C7E" weight="fill" /> {tab.user_phone}
                </p>

                <Flex vertical>
                  <strong>Instrucciones especiales:</strong>
                  <p>{tab.comment}</p>
                </Flex>
              </Flex>

              {/* INSERTA LA TABLA AQUI */}
              <Table
                dataSource={tab.rows}
                columns={columns}
                pagination={false}
                style={{ marginTop: "16px" }}
              />
              <strong className="modalLoadDetails__loadSummary">
                {tab.totalVolume} m³ • {tab.totalWeight}KG
              </strong>
            </Flex>
          )
        }))}
      />
    </Modal>
  );
};

export default ModalLoadDetails;

const mockLoadData = [
  {
    user: "Miguel Martinez",
    user_phone: "+34 123 456 789",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    totalWeight: 10.5,
    totalVolume: 5.0,
    rows: [
      {
        id: "1",
        name: "Caja",
        weight: 10,
        height: 1,
        width: 1,
        volume: 1,
        length: 1,
        quantiy: 5
      },
      {
        id: "2",
        name: "Barril",
        weight: 2,
        height: 0.5,
        width: 1,
        volume: 1,
        length: 1,
        quantiy: 2
      }
    ]
  },
  {
    user: "Maria Garcia",
    user_phone: "+34 987 654 321",
    comment:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    totalWeight: 15.0,
    totalVolume: 7.5,
    rows: [
      {
        id: "1",
        name: "Caja",
        weight: 10,
        height: 1,
        width: 1,
        volume: 1,
        length: 1,
        quantiy: 5
      },
      {
        id: "2",
        name: "Barril",
        weight: 2,
        height: 0.5,
        width: 1,
        volume: 1,
        length: 1,
        quantiy: 2
      }
    ]
  }
];
