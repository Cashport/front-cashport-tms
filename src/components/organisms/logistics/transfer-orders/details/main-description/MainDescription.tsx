import { FC, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import io from "socket.io-client";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./mainDescription.module.scss";
import { ConfigProvider, Dropdown, Flex, Timeline, Typography } from "antd";
import { CaretDown, Shuffle, WarningCircle } from "phosphor-react";
import { MenuProps } from "antd/lib";
import { ITransferRequestDetail } from "@/types/transferRequest/ITransferRequest";
import { TransferOrdersState } from "@/utils/constants/transferOrdersState";
import dayjs from "dayjs";
import { formatMoney } from "@/utils/utils";
import utc from "dayjs/plugin/utc";
import { getTravelDuration } from "@/utils/logistics/maps";
import { MAPS_ACCESS_TOKEN, SOCKET_URI, STATUS } from "@/utils/constants/globalConstants";
import Image from "next/image";
import "dayjs/locale/es-us";
import Link from "next/link";
import React from "react";
dayjs.extend(utc).locale("es-us");

const Text = Typography;

const mapStyles = {
  width: "100%",
  height: "100%",
  borderRadius: "16px"
};

const items: MenuProps["items"] = [
  {
    key: "0f7cccf5-1764-44c6-bb2a-874f419bc8f1",
    label: "Cargando"
  },
  {
    key: "b9e5ce08-16a7-4880-88a5-ebca7737c55d",
    label: "En curso"
  },
  {
    key: "780fa2f9-1b89-4d92-83dc-52de4c932056",
    label: "Descargando"
  },
  {
    key: "9f37afd7-1852-457d-964b-378fa6150471",
    label: "Detenido"
  },
  {
    key: "73ad61e3-395f-4ae4-8aef-9d24f3f917a9",
    label: "Stand by"
  }
];

interface ISocketData {
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

interface IMark {
  socketInfo: ISocketData;
  mark: mapboxgl.Marker | null;
}

interface IMainDescriptionProps {
  transferRequest: ITransferRequestDetail | null;
  // eslint-disable-next-line no-unused-vars
  handleChangeStatus: (statusId: string) => void;
}

export const MainDescription: FC<IMainDescriptionProps> = ({
  transferRequest,
  handleChangeStatus
}) => {
  const [socketInfo, setSocketInfo] = useState<IMark[]>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const mapsAccessToken = MAPS_ACCESS_TOKEN;

  const getState = (stateId: string) => {
    let getState = TransferOrdersState.find((f) => f.id === stateId);
    if (!getState) {
      getState = TransferOrdersState.find((f) => f.id === "d33e062f-51a5-457e-946e-a45cbbffbf95");
    }

    return (
      <div className={styles.trackStateContainer}>
        <Text className={styles.trackState} style={{ backgroundColor: getState?.bgColor }}>
          {getState?.name}
        </Text>
        <CaretDown size={16} />
      </div>
    );
  };

  const updateUserLocation = (data: ISocketData) => {
    if (!mapRef.current) {
      return;
    }

    setSocketInfo((prevSocketInfo) => {
      const getUser = prevSocketInfo.find((f) => f.socketInfo.userId === data.userId);

      if (getUser) {
        return prevSocketInfo.map((item) => {
          if (getUser.socketInfo.userId === item.socketInfo.userId) {
            item.mark!.remove();
            return {
              mark: item.mark!.setLngLat([data.longitude, data.latitude]).addTo(mapRef.current!),
              socketInfo: {
                ...item.socketInfo,
                latitude: data.latitude,
                longitude: data.longitude,
                timestamp: data.timestamp
              }
            };
          }
          return item;
        });
      } else {
        let mark: mapboxgl.Marker | null = null;
        if (mapRef.current) {
          mark = new mapboxgl.Marker()
            .setLngLat([data.longitude, data.latitude])
            .addTo(mapRef.current);
        }
        return [...prevSocketInfo, { mark, socketInfo: data }];
      }
    });
  };

  useEffect(() => {
    const socket = io(SOCKET_URI || "");
    socket.on("changeLocation", (data) => {
      console.log("Ubicación recibida:", data);
      updateUserLocation(data);
    });
    return () => {
      socket.off("changeLocation");
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = mapsAccessToken;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: { lon: -74.07231699675322, lat: 4.66336863727521 },
      zoom: 12,
      attributionControl: false
    });

    mapRef.current = map;

    map.on("style.load", () => {
      const compassControl = new mapboxgl.NavigationControl({
        showCompass: true
      });
      map.addControl(compassControl, "top-right");

      const datajson: GeoJSON.Feature = {
        type: "Feature",
        geometry: transferRequest?.geometry.geometry,
        properties: {}
      };

      map.addSource("route", {
        type: "geojson",
        data: datajson
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#3FB1CE",
          "line-width": 6
        }
      });

      const bounds = transferRequest?.geometry.geometry.coordinates.reduce(
        (bounds: any, coord: any) => bounds.extend(coord),
        new mapboxgl.LngLatBounds()
      );

      // Zoom out to fit the route within the map view
      map.fitBounds(bounds, {
        padding: 50
      });
      // map.setCenter([-77.634865, 0.823004]);
      // map.setZoom(14)
    });

    // return () => {
    //   map.remove();
    // };
    return () => {
      map.remove();
    };
  }, [transferRequest]);

  const timeLineItems =
    transferRequest?.timeLine.map((item, index) => {
      return {
        dot:
          index === 0 || index + 1 === transferRequest?.timeLine.length ? (
            <div className={styles.bigDot}>
              <div className={styles.littleDot} />
            </div>
          ) : (
            <div className={styles.dot} />
          ),
        children: (
          <div className={styles.dotChildrenContainer}>
            <div className={styles.leftChildren}>
              <Text className={styles.dotTitle}>{item.description}</Text>
              <Text className={styles.dotText}>{item.location}</Text>
            </div>
            <Flex vertical gap={2}>
              {item.service_type_id === 2 && (
                <div className={styles.dotIconContainer}>
                  <div className={styles.dotIcon}>
                    <Image src="/images/logistics/izaje-icon.png" width={16} height={13} alt="" />
                  </div>
                </div>
              )}
              <Text className={styles.dotText}>
                {dayjs.utc(item.start_date).format("DD MMMM YYYY - HH:mm")}
              </Text>
              {item.start_date !== item.end_date && (
                <Text className={styles.dotText}>
                  {dayjs.utc(item.end_date).format("DD MMMM YYYY - HH:mm")}
                </Text>
              )}
            </Flex>
          </div>
        )
      };
    }) || [];
  const milliseconds =
    new Date(transferRequest?.end_date || "").getTime() -
    new Date(transferRequest?.start_date || "").getTime();

  const OrderList = ({ orders }: { orders: number[] }) => {
    return (
      <div style={{ color: "gray" }}>
        {orders.map((order, index) => (
          <React.Fragment key={order}>
            <Link href={`/logistics/orders/details/${order}`} passHref target="_blank">
              <span className={styles.trackSubtitle}>TO-{order}</span>
            </Link>
            {index < orders.length - 1 && <span>, </span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.mainDescription}>
      <div className={styles.trackContainer}>
        <div className={styles.trackComponent}>
          <div className={styles.trackTitleContainer}>
            <Flex gap={8}>
              <Text className={styles.trackTitle}>TR-{transferRequest?.id}</Text>
              {!!transferRequest?.transfer_orders?.length && (
                <OrderList orders={transferRequest?.transfer_orders ?? []} />
              )}
            </Flex>
            <ConfigProvider
              theme={{
                components: {
                  Dropdown: {
                    colorBgElevated: "#FFFFFF",
                    controlItemBgActive: "#CBE71E",
                    controlItemBgActiveHover: "#CBE71E"
                  }
                }
              }}
            >
              <Dropdown
                overlayClassName={styles.overlayDropDown}
                disabled={transferRequest?.status_id === STATUS.TR.POR_LEGALIZAR}
                menu={{
                  items,
                  selectable: true,
                  defaultSelectedKeys: [transferRequest?.status_id || ""],
                  onClick: (item) => handleChangeStatus(item.key)
                }}
              >
                {getState(transferRequest?.status_id || "")}
              </Dropdown>
            </ConfigProvider>
          </div>
          <div className={styles.timeLineContainer}>
            <ConfigProvider
              theme={{
                components: {
                  Timeline: {
                    tailColor: "#CBE71E",
                    dotBg: "none"
                  }
                }
              }}
            >
              <Timeline items={timeLineItems || []} />
            </ConfigProvider>
          </div>
        </div>
        <div className={styles.cardsContainer}>
          <div className={styles.card}>
            <div className={styles.titleCardContainer}>
              <Text className={styles.titleCard}>Costo total</Text>
            </div>
            <div className={styles.titleCardContainer}>
              <Text className={styles.subtitleCardBold}>
                {formatMoney(transferRequest?.total_price) || "-"}
              </Text>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.titleCardContainer}>
              <Text className={styles.titleCard}>Tarifa base</Text>
            </div>
            <div className={styles.titleCardContainer}>
              <Text className={styles.subtitleCard}>
                {formatMoney(transferRequest?.total_fare) || "-"}
              </Text>
            </div>
          </div>
          <div className={styles.card}>
            <Text className={styles.titleCard}>Sobrecosto</Text>
            <Text className={styles.subtitleCard}>
              {transferRequest && transferRequest?.surcharge
                ? formatMoney(transferRequest?.surcharge)
                : "-"}
            </Text>
          </div>
          {transferRequest && transferRequest?.geometry?.distance && (
            <div className={styles.card}>
              <Text className={styles.titleCard}>Distancia</Text>
              <Text className={styles.subtitleCard}>
                {parseFloat((transferRequest.geometry.distance / 1000).toFixed(2))} Km
              </Text>
            </div>
          )}
          {transferRequest && transferRequest?.geometry?.duration && (
            <div className={styles.card}>
              <Text className={styles.titleCard}>Tiempo</Text>
              <Text className={styles.subtitleCard}>{getTravelDuration(milliseconds / 1000)}</Text>
            </div>
          )}
        </div>
      </div>
      <div className={styles.mapContainer}>
        <div ref={mapContainerRef} style={mapStyles} />
      </div>
    </div>
  );
};
