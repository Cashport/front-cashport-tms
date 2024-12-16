'use client'
import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import styles from './Map.module.scss'
import { useState } from "react";
import { CaretDown, CaretUp, CheckCircle, Eye } from "phosphor-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { SideBar } from '@/components/molecules/SideBar/SideBar';
import { ISocketTrip } from '@/types/logistics/trips/TripsSchema';
import Image from 'next/image';
import dayjs from 'dayjs';
import { TripState } from '@/utils/constants/tripState';
import DetailTripMap from './detail/Detail';
import { IDriverMap } from '@/types/logistics/driver/driver';
import { API } from '@/utils/api/api';
import { AxiosResponse } from 'axios';
import { SOCKET_URI } from '@/utils/constants/globalConstants';

import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const mapStyles = {
  width: '100%',
  height: '100%',
  borderRadius: '16px',
};

interface ISocketData {
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  trip: ISocketTrip;
  distance: number;
}

interface IMark {
  socketInfo: ISocketData,
  mark: mapboxgl.Marker | null
}

const MapComponent = () => {
  const [isActive, setIsActive] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [socketInfo, setSocketInfo] = useState<IMark[]>([]);
  const [distancePercent, setDistancePercent] = useState<number>(0);
  const [trip, setTrip] = useState<ISocketTrip | null>(null);
  const [tripLat, setTripLat] = useState<number | null>(null);
  const [tripLong, setTripLong] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [driver, setDriver] = useState<IDriverMap | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const mapsAccessToken = 'pk.eyJ1IjoiamNib2JhZGkiLCJhIjoiY2x4aWgxejVsMW1ibjJtcHRha2xsNjcxbCJ9.CU7FHmPR635zv6_tl6kafA';
  const socket = io(SOCKET_URI || '');

  const getStateColor = (stateId: string) => {
    const getState = TripState.find((f) => f.id === stateId);
    return getState ? getState.bgColor : '#CBE71E';
  }

  const getStateTextColor = (stateId: string) => {
    const getState = TripState.find((f) => f.id === stateId);
    return getState ? getState.textColor : '#141414';
  }

  const getIconUrl = (stateId: string) => {
    const getState = TripState.find((f) => f.id === stateId);
    return getState ? getState.urlMap : '#141414';
  }

  const btnAction = (data: ISocketData) => {
    setTrip(data.trip);
    setTripLat(data.latitude);
    setTripLong(data.longitude);
    getDriverFromTrip(data.trip.id, data.userId);
  }

  const updateUserLocation = (data: ISocketData) => {
    if (!mapRef.current || !data.trip) {
      return;
    }

    setSocketInfo((prevSocketInfo) => {
      const getUser = prevSocketInfo.find(f => f.socketInfo.userId === data.userId);

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        className: styles.customPopup
      }).setHTML(`
        <div style="display:flex;justify-content:space-between">
            <div style="display:flex;column-gap:16px">
            <img src="${data.trip.imgUrl}" style="width:51px;height:51px;border-radius:6px" />
            <div>
              <div style="display:flex;align-items:center;column-gap:15px">
                <div style="color:#fff;font-size:18px;font-style:normal;font-weight:700;line-height:24px;letter-spacing:-.5px">${data.trip.vehicle.behicleType}</div>
                <div style="padding:2px 8px;border-radius:7px;color:#677fb0;font-size:14px;font-weight:600;line-height:20px;background-color:#2e323a">${data.trip.vehicle.plateNumber}</div>
                </div>
                <div style="display:flex;flex-direction:column;column-gap:17px;margin-top:16px;row-gap:19px;position:relative;">
                <div style="display:flex;column-gap:17px;">
                  <div style="position:relative;">
                  <div style="margin-top:4px;width:13px;height:13px;border-radius:50%;border:1px solid #d9d9d9;"></div>
                  <!-- Linea conectando los puntos -->
                  <div style="position:absolute;top:19px;left:6px;width:1px;height: 105%;background: linear-gradient(180deg, #FFF 0%, #6F7A90 100%);border-radius: 30px;"></div>
                  </div>
                  <div>
                  <div style="color:#fff;font-size:14px;font-weight:600;line-height:20px">${data.trip.startAddress}</div>
                  <div style="color:#fff;font-size:14px;font-weight:400;line-height:20px">${dayjs.utc(data.trip.initRoute).format('DD MMM. YYYY')} - ${dayjs.utc(data.trip.initRoute).format('HH:mm')}</div>
                  </div>
                </div>
                <div style="display:flex;column-gap:17px;">
                  <div>
                  <div style="margin-top:4px;width:13px;height:13px;border-radius:50%;border:1px solid #6F7A90"></div>
                  </div>
                  <div>
                  <div style="color:#6f7a90;font-size:14px;font-weight:600;line-height:20px">${data.trip.endAddress}</div>
                  <div style="color:#6f7a90;font-size:14px;font-weight:400;line-height:20px">${dayjs.utc(data.trip.endRoute).format('DD MMM. YYYY')} - ${dayjs.utc(data.trip.endRoute).format('HH:mm')}</div>
                  </div>
                </div>
                </div>
              </div>
              </div>
              <div style="display:flex;flex-direction:column;row-gap:8px;align-items:flex-end">
              <a href="/logistics/transfer-orders/details/${data.trip.transferRequestId}">
                <div style="color:#d0e4ff;text-decoration:underline">TR ${data.trip.transferRequestId}</div>
              </a>
              <div style="background-color:${getStateColor(data.trip.stateId)};padding:4px 8px;display:flex;align-items: center;column-gap:4px;border-radius:8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10.8538 6.14625C10.9002 6.19269 10.9371 6.24783 10.9623 6.30853C10.9874 6.36923 11.0004 6.43429 11.0004 6.5C11.0004 6.56571 10.9874 6.63077 10.9623 6.69147C10.9371 6.75217 10.9002 6.80731 10.8538 6.85375L7.35375 10.3538C7.30732 10.4002 7.25217 10.4371 7.19147 10.4623C7.13077 10.4874 7.06571 10.5004 7 10.5004C6.9343 10.5004 6.86923 10.4874 6.80853 10.4623C6.74783 10.4371 6.69269 10.4002 6.64625 10.3538L5.14625 8.85375C5.05243 8.75993 4.99972 8.63268 4.99972 8.5C4.99972 8.36732 5.05243 8.24007 5.14625 8.14625C5.24007 8.05243 5.36732 7.99972 5.5 7.99972C5.63268 7.99972 5.75993 8.05243 5.85375 8.14625L7 9.29313L10.1463 6.14625C10.1927 6.09976 10.2478 6.06288 10.3085 6.03772C10.3692 6.01256 10.4343 5.99961 10.5 5.99961C10.5657 5.99961 10.6308 6.01256 10.6915 6.03772C10.7522 6.06288 10.8073 6.09976 10.8538 6.14625ZM14.5 8C14.5 9.28558 14.1188 10.5423 13.4046 11.6112C12.6903 12.6801 11.6752 13.5132 10.4874 14.0052C9.29973 14.4972 7.99279 14.6259 6.73192 14.3751C5.47104 14.1243 4.31285 13.5052 3.40381 12.5962C2.49477 11.6872 1.8757 10.529 1.6249 9.26809C1.37409 8.00721 1.50282 6.70028 1.99479 5.51256C2.48676 4.32484 3.31988 3.30968 4.3888 2.59545C5.45772 1.88122 6.71442 1.5 8 1.5C9.72335 1.50182 11.3756 2.18722 12.5942 3.40582C13.8128 4.62441 14.4982 6.27665 14.5 8ZM13.5 8C13.5 6.9122 13.1774 5.84883 12.5731 4.94436C11.9687 4.03989 11.1098 3.33494 10.1048 2.91866C9.09977 2.50238 7.9939 2.39346 6.92701 2.60568C5.86011 2.8179 4.8801 3.34172 4.11092 4.11091C3.34173 4.8801 2.8179 5.86011 2.60568 6.927C2.39347 7.9939 2.50238 9.09977 2.91867 10.1048C3.33495 11.1098 4.0399 11.9687 4.94437 12.5731C5.84884 13.1774 6.91221 13.5 8 13.5C9.45819 13.4983 10.8562 12.9184 11.8873 11.8873C12.9184 10.8562 13.4983 9.45818 13.5 8Z" fill="${getStateTextColor(data.trip.stateId)}"/>
                </svg>
                <div style="color: ${getStateTextColor(data.trip.stateId)};font-size: 13px;font-weight: 600;line-height: 18px;">${data.trip.state.name}</div>
              </div>
              <div id="btnAction" style="display:flex;background-color:#2e323a;border-radius:4px;width:32px;height:32px;justify-content:center;align-items:center;margin-top:15px; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <g clip-path="url(#clip0_586_4776)">
                  <path d="M19.9442 9.39667C19.915 9.33084 19.2092 7.765 17.64 6.19584C15.5492 4.105 12.9084 3 10.0017 3C7.09504 3 4.4542 4.105 2.36337 6.19584C0.794202 7.765 0.0850344 9.33334 0.059201 9.39667C0.0212953 9.48193 0.00170898 9.5742 0.00170898 9.66751C0.00170898 9.76081 0.0212953 9.85308 0.059201 9.93834C0.0883677 10.0042 0.794202 11.5692 2.36337 13.1383C4.4542 15.2283 7.09504 16.3333 10.0017 16.3333C12.9084 16.3333 15.5492 15.2283 17.64 13.1383C19.2092 11.5692 19.915 10.0042 19.9442 9.93834C19.9821 9.85308 20.0017 9.76081 20.0017 9.66751C20.0017 9.5742 19.9821 9.48193 19.9442 9.39667ZM10.0017 15C7.43671 15 5.19587 14.0675 3.34087 12.2292C2.57974 11.4723 1.93219 10.6091 1.41837 9.66667C1.93205 8.72412 2.57962 7.86099 3.34087 7.10417C5.19587 5.26584 7.43671 4.33333 10.0017 4.33333C12.5667 4.33333 14.8075 5.26584 16.6625 7.10417C17.4252 7.8608 18.0741 8.72394 18.5892 9.66667C17.9884 10.7883 15.3709 15 10.0017 15ZM10.0017 5.66667C9.21058 5.66667 8.43722 5.90127 7.77943 6.34079C7.12163 6.78032 6.60894 7.40503 6.30619 8.13594C6.00344 8.86684 5.92422 9.67111 6.07856 10.447C6.23291 11.223 6.61387 11.9357 7.17328 12.4951C7.73269 13.0545 8.44542 13.4355 9.22135 13.5898C9.99727 13.7442 10.8015 13.6649 11.5324 13.3622C12.2633 13.0594 12.8881 12.5468 13.3276 11.889C13.7671 11.2312 14.0017 10.4578 14.0017 9.66667C14.0006 8.60614 13.5788 7.58937 12.8289 6.83946C12.079 6.08955 11.0622 5.66777 10.0017 5.66667ZM10.0017 12.3333C9.47429 12.3333 8.95872 12.1769 8.52019 11.8839C8.08166 11.5909 7.73986 11.1744 7.53803 10.6872C7.33619 10.1999 7.28339 9.66372 7.38628 9.14643C7.48917 8.62915 7.74315 8.15399 8.11609 7.78105C8.48903 7.40811 8.96418 7.15414 9.48147 7.05124C9.99875 6.94835 10.5349 7.00116 11.0222 7.20299C11.5095 7.40483 11.9259 7.74662 12.219 8.18515C12.512 8.62368 12.6684 9.13926 12.6684 9.66667C12.6684 10.3739 12.3874 11.0522 11.8873 11.5523C11.3872 12.0524 10.709 12.3333 10.0017 12.3333Z" fill="#CBE71E"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_586_4776">
                  <rect width="20" height="20" fill="white"/>
                  </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
      `).on('open', () => {
        const btnElement = document.getElementById('btnAction');
        if (btnElement && btnElement.parentNode) {
          const clone = btnElement.cloneNode(true);
          btnElement.parentNode.replaceChild(clone, btnElement);
          clone.addEventListener('click', () => {
            btnAction(data)
            popup.remove(); 
          });
        }
      });

      const el = document.createElement('div');
      const width = 42;
      const height = 42;
      el.className = 'marker';
      el.style.backgroundImage = `url(${getIconUrl(data.trip.stateId)})`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      el.style.backgroundSize = '100%';
      el.style.display = 'block';
      el.style.border = 'none';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';

      if (getUser) {
        return prevSocketInfo.map((item) => {
          if (getUser.socketInfo.userId === item.socketInfo.userId) {

            const markerElement = item.mark!.getElement();

            markerElement.style.backgroundImage = `url(${getIconUrl(data.trip.stateId)})`;

            item.mark!.remove();
            return {
              mark: item.mark!.setLngLat([data.longitude, data.latitude]).setPopup(popup).addTo(mapRef.current!),
              socketInfo: {
                ...item.socketInfo,
                latitude: data.latitude,
                longitude: data.longitude,
                timestamp: data.timestamp,
                distance: data.distance,
                trip: data.trip,
              },
            };
          }
          return item;
        });
      } else {
        let mark: mapboxgl.Marker | null = null;
        if (mapRef.current) {
          mark = new mapboxgl.Marker(el)
            .setLngLat([data.longitude, data.latitude])
            .setPopup(popup)
            .addTo(mapRef.current);
        }
        return [...prevSocketInfo, { mark, socketInfo: data }];
      }
    });
  };

  useEffect(() => {
    socket.on('changeLocation', (data) => {
      console.log('Ubicación recibida:', data);
      updateUserLocation(data)
    });

    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = mapsAccessToken;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: { lon: -74.07231699675322, lat: 4.66336863727521 },
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("style.load", () => {
      const compassControl = new mapboxgl.NavigationControl({
        showCompass: true,
      });
      map.addControl(compassControl, "top-right");
      setMapLoaded(true);
    });

    return () => {
      socket.disconnect();
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    if (mapRef.current.getLayer("route")) {
      mapRef.current.removeLayer("route");
    }
    if (mapRef.current.getSource("route")) {
      mapRef.current.removeSource("route");
    }
    if (mapLoaded && trip) {
      const datajson: GeoJSON.Feature = {
        type: "Feature",
        geometry: trip?.geometry.geometry[0].geometry as any,
        properties: {}
      };

      mapRef.current.addSource("route", {
        type: "geojson",
        data: datajson
      });

      mapRef.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#1f2228",
          "line-width": 6
        }
      });

      const bounds = trip?.geometry.geometry[0].geometry.coordinates.reduce(
        (bounds: any, coord: any) => bounds.extend(coord),
        new mapboxgl.LngLatBounds()
      );

      // Zoom out to fit the route within the map view
      mapRef.current.fitBounds(bounds, {
        padding: 50
      });
    } else if (trip === null) {
      if (mapRef.current.getLayer("route")) {
        mapRef.current.removeLayer("route");
      }
      if (mapRef.current.getSource("route")) {
        mapRef.current.removeSource("route");
      }

      // Restablecer el centro y el zoom a los valores iniciales
      mapRef.current.flyTo({
        center: { lon: -74.07231699675322, lat: 4.66336863727521 },
        zoom: 12
      });
    }
  }, [trip, mapLoaded]);

  useEffect(() => {
    if (trip !== null) {
      const getInfo = socketInfo.find((f) => f.socketInfo.trip.id === trip.id);
      if (getInfo) {
        setTrip(getInfo.socketInfo.trip);
        setTripLat(getInfo.socketInfo.latitude);
        setTripLong(getInfo.socketInfo.longitude);
        getDriverFromTrip(getInfo.socketInfo.trip.id, getInfo.socketInfo.userId);
        setDistancePercent(getInfo.socketInfo.distance)
      }
    }
  }, [socketInfo])

  const getDriverFromTrip = async (tripId: string, userId: string) => {
    try {
      const findDriver: AxiosResponse<IDriverMap, any> = await API.get(`/cashport/map-detail/${tripId}/${userId}`);
      setDriver(findDriver.data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles.mainMap}>
      <SideBar />
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <div className={styles.title}>Dashboard</div>
          <div className={styles.swithComponent}>
            <div onClick={() => setIsActive(false)} className={`${styles.switchItem} ${!isActive && styles.active}`}>Gastos operativos</div>
            <div onClick={() => setIsActive(true)} className={`${styles.switchItem} ${isActive && styles.active}`}>Live Tracking</div>
          </div>
          <div />
        </div>
        <div className={styles.mapContainer}>
          <div
            ref={mapContainerRef}
            style={mapStyles}
          >
            {trip && (
              <div className={styles.overlayCard}>
                <div className={styles.mainCard}>
                  <DetailTripMap
                    trip={trip} onClose={() => {
                      setTrip(null)
                      setTripLat(null);
                      setTripLong(null);
                      setDriver(null);
                    }}
                    lat={tripLat}
                    long={tripLong}
                    driver={driver}
                    distancePercent={distancePercent}
                  />
                </div>
              </div>
            )}
            {!trip && (
              <div className={styles.overlayCard}>
                <div className={styles.mainCard}>
                  <div className={`${styles.titleContainer} ${styles.cursor}`} onClick={() => setShowCards(!showCards)}>
                    <div className={styles.titleCard}>Estado de los viajes</div>
                    {showCards ? <CaretUp size={20} color="#FFFFFF" /> : <CaretDown size={20} color="#FFFFFF" />}
                  </div>
                  {showCards && (
                    <div className={styles.cardContainer}>
                      {socketInfo.map((item, index) => (
                        <div className={`${styles.card} ${index !== 7 && styles.bottomDivider}`} key={item.socketInfo.trip.id}>
                          <div className={styles.leftSection}>
                            {item.socketInfo.trip.imgUrl && (
                              <Image width={51} height={51} className={styles.img} alt='' src={item.socketInfo.trip.imgUrl} />
                            )}
                            {!item.socketInfo.trip.imgUrl && (
                              <div className={styles.img} />
                            )}
                            <div>
                              <div className={styles.cardTitleContainer}>
                                <div className={styles.cardTitle}>{item.socketInfo.trip.vehicle.behicleType}</div>
                                <div className={styles.cardSubtitle}>{item.socketInfo.trip.vehicle.plateNumber}</div>
                              </div>
                              <div className={styles.cardBody}>
                                <div className={styles.cardMarkContainer}>
                                  <div className={styles.cardMark} />
                                  <div className={styles.line}></div>
                                  <div>
                                    <div className={styles.cardDescription}>{item.socketInfo.trip.startAddress}</div>
                                    <div className={styles.cardDate}>{dayjs.utc(item.socketInfo.trip.initRoute).format('DD MMM. YYYY')} - {dayjs.utc(item.socketInfo.trip.initRoute).format('HH:mm')}</div>
                                  </div>
                                </div>
                                <div className={styles.cardMarkContainer}>
                                  <div className={styles.cardMark} />
                                  <div>
                                    <div className={styles.cardDescriptionStep}>{item.socketInfo.trip.endAddress}</div>
                                    <div className={styles.cardDateStep}>{dayjs.utc(item.socketInfo.trip.endRoute).format('DD MMM. YYYY')} - {dayjs.utc(item.socketInfo.trip.endRoute).format('HH:mm')}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={styles.rightSection}>
                            <a href={`/logistics/transfer-orders/details/${item.socketInfo.trip.transferRequestId}`}>
                              <div className={styles.rightTitle}>TR {item.socketInfo.trip.transferRequestId}</div>
                            </a>
                            <div className={styles.stateTag} style={{ backgroundColor: getStateColor(item.socketInfo.trip.stateId) }}>
                              <CheckCircle size={16} color={getStateTextColor(item.socketInfo.trip.stateId)} />
                              <div className={styles.state} style={{ color: getStateTextColor(item.socketInfo.trip.stateId) }}>{item.socketInfo.trip.state.name}</div>
                            </div>
                            <div onClick={() => {
                              setTrip(item.socketInfo.trip);
                              setTripLat(item.socketInfo.latitude);
                              setTripLong(item.socketInfo.longitude);
                              getDriverFromTrip(item.socketInfo.trip.id, item.socketInfo.userId);
                              setDistancePercent(item.socketInfo.distance)
                            }} className={styles.showBtn}>
                              <Eye size={20} color='#CBE71E' />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapComponent