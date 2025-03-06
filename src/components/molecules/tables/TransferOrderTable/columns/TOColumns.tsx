import { Button, Flex, TableColumnsType, Tooltip, Typography } from "antd";
import { DataType } from "../TransferOrderTable";
import { calculateMinutesDifference } from "@/utils/logistics/calculateMinutesDifference";
import { Eye, Warning, WarningOctagon } from "phosphor-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { formatMoney } from "@/utils/utils";
import { Radioactive } from "@phosphor-icons/react";
import "./transferOrderTable.scss";
import Link from "next/link";

dayjs.extend(utc);

const { Text } = Typography;

export const columns = (
  showColumn: boolean,
  redirect?: string,
  showBothIds?: boolean,
  trShouldRedirect?: boolean,
  showCarriersColumn?: boolean
): TableColumnsType<DataType> => {
  const timeToTrip = showColumn
    ? {
        title: "Tiempo transcurrido",
        dataIndex: "tiempodeviaje",
        render: (text: string) => (
          <Text className="row-text">{calculateMinutesDifference(text)} min</Text>
        ),
        sorter: (a: any, b: any) =>
          calculateMinutesDifference(a.tiempodeviaje) - calculateMinutesDifference(b.tiempodeviaje),
        showSorterTooltip: false
      }
    : {};
  const carriersColumn = showCarriersColumn
    ? {
        title: "Proveedores",
        dataIndex: "carriers",
        render: (text: string) => {
          console.log("text", text, !text);
          if (!text) return ""; // Manejo de string vacío
          const namesArray: string[] = text.split(",").map((name) => name.trim());
          if (namesArray.length === 1) return <div className="text-truncate">{namesArray[0]}</div>;

          const firstName = namesArray[0]; // Siempre mostramos el primer nombre
          const displayedNames = [firstName];
          let charCount = firstName.length;
          const maxChars = 30; // Ajusta según necesidad
          let remainingNames: string[] = [];

          for (let i = 1; i < namesArray.length; i++) {
            const name = namesArray[i];
            if (charCount + name.length <= maxChars) {
              displayedNames.push(name);
              charCount += name.length;
            } else {
              remainingNames = namesArray.slice(i);
              break;
            }
          }

          return (
            <div className="text-truncate">
              {displayedNames.join(", ")}
              {remainingNames.length > 0 && (
                <Tooltip title={remainingNames.join(", ")}>
                  <span className="remaining-count"> +{remainingNames.length}</span>
                </Tooltip>
              )}
            </div>
          );
        },
        sorter: (a: any, b: any) => a.carriers.localeCompare(b.carriers),
        showSorterTooltip: false,
        width: 200
      }
    : {};

  return [
    {
      title: "TR",
      dataIndex: "tr",
      render: (id, record) => {
        if (showBothIds && record.id_transfer_request) {
          return (
            <Flex vertical gap={4}>
              <Link
                className="row-text id"
                href={`${redirect ?? "/logistics/transfer-orders/details"}/${id}`}
              >
                {id}
              </Link>
              {trShouldRedirect ? (
                <Link
                  className="row-text subId"
                  href={`${"/logistics/transfer-orders/details/"}${record.id_transfer_request}`}
                >
                  TR {record.id_transfer_request}
                </Link>
              ) : (
                <span className="row-text subId">TR {record.id_transfer_request}</span>
              )}
            </Flex>
          );
        }
        return (
          <Link
            className="row-text id"
            href={`${redirect ?? "/logistics/transfer-orders/details"}/${id}`}
          >
            {id}
          </Link>
        );
      },
      sorter: (a, b) => Number(a.tr) - Number(b.tr),
      showSorterTooltip: false,
      sortDirections: ["descend", "ascend"]
    },
    {
      title: "Origen y destino",
      dataIndex: "origendestino",
      render: (text: { origin: string; destination: string }) => (
        <div className="titleContainer">
          <div className="textContainer">
            <Text className="title">Origen</Text>
            <Text className="title">Destino</Text>
          </div>
          <div className="textContainer">
            <Text className="row-text">{text.origin}</Text>
            <Text className="row-text">{text.destination}</Text>
          </div>
        </div>
      ),
      sorter: (a, b) => a.origendestino.origin.localeCompare(b.origendestino.origin),
      showSorterTooltip: false
    },
    carriersColumn,
    {
      title: "Fechas",
      dataIndex: "fechas",
      render: (text: { origin: string; destination: string }) => (
        <div className="textContainer">
          <Text className="row-text">{`${dayjs.utc(text.origin).format("DD/MM/YY - HH:mm")} h`}</Text>
          <Text className="row-text">{`${dayjs.utc(text.destination).format("DD/MM/YY - HH:mm")} h`}</Text>
        </div>
      ),
      sorter: (a, b) => dayjs(a.fechas.origin).valueOf() - dayjs(b.fechas.origin).valueOf(),
      showSorterTooltip: false
    },
    {
      title: "Tipo de viaje",
      dataIndex: "tipodeviaje",
      render: (text: string) => <Text className="row-text">{text}</Text>,
      sorter: (a, b) => a.tipodeviaje.localeCompare(b.tipodeviaje),
      showSorterTooltip: false
    },
    // {
    //   title: 'Vehículo(s)',
    //   dataIndex: 'vehiculos',
    //   render: (text: { origin: string, destination: string }) => (
    //     <div className='textContainer'>
    //       <Text className='row-text'>{text.origin}</Text>
    //       <Text className='row-text'>{text.destination}</Text>
    //     </div>
    //   ),
    //   sorter: {
    //     multiple: 1,
    //   },
    // },
    // {
    //   title: 'Conductor',
    //   dataIndex: 'conductor',
    //   render: (text: { origin: string, destination: string }) => (
    //     <div className='textContainer'>
    //       <Text className='row-text'>{text.origin}</Text>
    //       <Text className='row-text'>{text.destination}</Text>
    //     </div>
    //   ),
    //   sorter: {
    //     multiple: 1,
    //   },
    //   width: '12%',
    // },
    timeToTrip,
    {
      title: "Valor",
      dataIndex: "valor",
      render: (text: string) => (
        <Text className="row-text value">{text ? formatMoney(text) : "$ 0"}</Text>
      ),
      sorter: (a, b) => Number(a.valor) - Number(b.valor),
      showSorterTooltip: false
    },

    {
      title: "",
      dataIndex: "validator",
      render: (text: {
        tr: string;
        ismaterialsproblem: boolean;
        ispeopleproblem: boolean;
        isRejected: boolean;
      }) => (
        <div className="btnContainer">
          {text.isRejected && (
            <Button
              className="btn"
              type="text"
              size="middle"
              icon={
                <Tooltip title="Esta orden tiene una factura rechazada">
                  <WarningOctagon size={24} color="red" />
                </Tooltip>
              }
            />
          )}
          {!!text.ismaterialsproblem && (
            <Button className="btn" type="text" size="middle" icon={<Radioactive size={24} />} />
          )}
          {!!text.ismaterialsproblem && (
            <Button className="btn" type="text" size="middle" icon={<Warning size={24} />} />
          )}
          <Link href={`${redirect ? redirect : "/logistics/transfer-orders/details"}/${text.tr}`}>
            <Button className="btn" type="text" size="middle" icon={<Eye size={24} />} />
          </Link>
        </div>
      )
    }
  ];
};
