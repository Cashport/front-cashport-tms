/* eslint-disable no-unused-vars */
import { Button, Flex, Table, TableProps, Typography } from "antd";
import VehiclesSelect from "../../vehiclesSelect/VehiclesSelect";
import { CaretLeft, CaretRight, Trash, Warning } from "phosphor-react";
import {
  ITransferOrderRequestContacts,
  ITransferRequestCreation,
  ITransferRequestStepOneMaterial,
  IVehiclesPricing,
  ISuggestedVehiclesByMaterials
} from "@/types/logistics/schema";
import { useEffect, useMemo, useState } from "react";
import { formatNumber } from "@/utils/utils";
import { FieldArrayWithId } from "react-hook-form";
import { FormValues } from "../../vehiclesSelection/VehiclesSelection";
import { getSuggestedVehiclesByMaterials } from "@/services/logistics/vehicles";

const { Text } = Typography;

type TripProps = {
  transferRequest: ITransferRequestCreation | undefined;
  index: number;
  id_journey: number;
  id_type_service: number;
  onRemove: () => void;
  sugestedVehicles: IVehiclesPricing[] | undefined;
  isLoadingVehicles: boolean;
  // eslint-disable-next-line no-unused-vars
  handleAddMaterialByTrip: (id_material: number) => void;
  handleRemoveMaterialByTrip: (id_material: number) => void;
  handleSelectVehicle: (id_vehicle_type: number) => void;
  section: FieldArrayWithId<FormValues, "trips", "_id">;
  handleSelectPerson: (persons: any[]) => void;
};

export default function Trip(props: TripProps) {
  const {
    transferRequest,
    id_journey,
    id_type_service,
    onRemove,
    sugestedVehicles,
    isLoadingVehicles,
    handleAddMaterialByTrip,
    handleRemoveMaterialByTrip,
    handleSelectVehicle,
    section,
    handleSelectPerson
  } = props;
  const [dataCarga, setDataCarga] = useState<ITransferRequestStepOneMaterial[]>([]);
  const [persons, setPersons] = useState<ITransferOrderRequestContacts[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const columnsVehiclesPerson: TableProps<ITransferOrderRequestContacts>["columns"] = [
    {
      title: "Nombre",
      key: "name",
      dataIndex: "name",
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
      key: "psl_desc",
      dataIndex: "psl_desc",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.psl_desc.localeCompare(b.psl_desc),
      showSorterTooltip: false
    },
    {
      title: "CC",
      key: "cost_center_desc",
      dataIndex: "cost_center_desc",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.cost_center_desc.localeCompare(b.cost_center_desc),
      showSorterTooltip: false
    }
  ];
  const [suggestedVehiclesData, setSuggestedVehiclesData] =
    useState<ISuggestedVehiclesByMaterials | null>(null);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);
  useEffect(() => {
    const materials: ITransferRequestStepOneMaterial[] = [];
    transferRequest?.stepOne.transferRequest?.forEach((mat) => {
      mat?.transfer_request_material?.forEach((m) => {
        materials.push(m);
      });
    });
    setDataCarga(materials);
    const p = transferRequest?.stepOne.transferRequest?.flatMap(
      (a) => a.transfer_request_persons?.map((p) => ({ ...p, key: p.id })) || []
    );
    setPersons(p || []);
  }, [transferRequest]);

  const columnsVehiclesMaterial: TableProps<any>["columns"] = [
    {
      title: "Total",
      dataIndex: "units",
      key: "units",
      render: (total) => <Text>{total}</Text>,
      sorter: (a, b) => a.units - b.units,
      showSorterTooltip: false,
      align: "center",
      width: 50
    },
    {
      title: "Cantidad en el trayecto",
      dataIndex: "",
      key: "",
      render: (_, record) => (
        <Flex align="center" justify="center">
          <Button type="text" size="small" onClick={() => handleRemoveMaterialByTrip(record.id)}>
            <CaretLeft />
          </Button>
          {section.materialByTrip.find((m: any) => m.id_material === record.id)?.units || 0}
          <Button type="text" size="small" onClick={() => handleAddMaterialByTrip(record.id)}>
            <CaretRight onClick={() => handleAddMaterialByTrip(record.id)} />
          </Button>
        </Flex>
      ),
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      align: "center",
      width: "10%"
    },
    {
      title: "Nombre",
      key: "name",
      dataIndex: "material",
      render: (materials) => <Text>{materials[0]?.description}</Text>,
      sorter: (a, b) => a.material[0].description.localeCompare(b.material[0].description),
      showSorterTooltip: false
    },
    {
      title: "Peso",
      key: "kg_weight",
      dataIndex: "material",
      render: (materials) => <Text>{formatNumber(materials[0]?.kg_weight)} kg</Text>,
      sorter: (a, b) => a.material[0].kg_weight - b.material[0].kg_weight,
      showSorterTooltip: false,
      align: "center"
    },
    {
      title: "Alto",
      key: "mt_height",
      dataIndex: "material",
      render: (materials) => <Text>{materials[0]?.mt_height} m</Text>,
      sorter: (a, b) => a.material[0].mt_height - b.material[0].mt_height,
      showSorterTooltip: false,
      align: "center"
    },
    {
      title: "Ancho",
      key: "mt_width",
      dataIndex: "material",
      render: (materials) => <Text>{materials[0]?.mt_width} m</Text>,
      sorter: (a, b) => a.material[0].mt_width - b.material[0].mt_width,
      showSorterTooltip: false,
      align: "center"
    },
    {
      title: "Largo",
      key: "mt_length",
      dataIndex: "material",
      render: (materials) => <Text>{materials[0]?.mt_length} m</Text>,
      sorter: (a, b) => a.material[0].mt_length - b.material[0].mt_length,
      showSorterTooltip: false,
      align: "center"
    },
    {
      title: "Volumen",
      key: "volume",
      dataIndex: "volume",
      render: (volume) => <Text>{volume} m³</Text>,
      sorter: (a, b) => Number(a.material[0].volume) - Number(b.material[0].volume),
      showSorterTooltip: false,
      align: "center"
    },
    {
      title: "",
      key: "buttonSee",
      width: 64,
      dataIndex: "id",
      render: (_, material) => (
        <>
          {material.is_controlled_substance ? (
            <Flex style={{ gap: "6px", justifyContent: "flex-end" }}>
              <Button style={{ backgroundColor: "#F7F7F7" }} icon={<Warning size={"1.3rem"} />} />
            </Flex>
          ) : null}
        </>
      ),
      align: "center"
    }
  ];

  const requestData = useMemo(() => {
    if (!id_type_service) {
      return null;
    }

    const materials = section.materialByTrip.map((material) => ({
      id: material.id_material,
      weight: material.kg_weight ?? 0,
      length: material.length_m ?? 0,
      width: material.width_m ?? 0,
      height: material.height_m ?? 0,
      quantity: material.units ?? 1
    }));

    const vehiclesSelected = section.id_vehicle_type
      ? [
          {
            id: section.id_vehicle_type,
            quantity: 1
          }
        ]
      : [];

    return {
      serviceTypeId: id_type_service,
      ...(vehiclesSelected.length > 0 ? { vehiclesSelected } : {}),
      materials
    };
  }, [section, id_type_service]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!requestData) return;

      try {
        setIsLoadingSuggested(true);
        const res = await getSuggestedVehiclesByMaterials(requestData);

        if (!cancelled) {
          setSuggestedVehiclesData(res);
        }
      } catch (error) {
        console.error("Error fetching suggested vehicles:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingSuggested(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requestData]);

  const currentSelectedVehicle = useMemo(() => {
    return suggestedVehiclesData?.vehiclesSelectedWithOcupation[0];
  }, [suggestedVehiclesData]);

  return (
    <div className="collapseInformationContainer">
      <div className="collapseResumeWrapper">
        <Flex className="collapseTopSection">
          <VehiclesSelect
            id_journey={id_journey}
            vehiclesSelected={
              suggestedVehiclesData?.vehiclesWithOcupation?.find(
                (v) => v.id === section.id_vehicle_type
              )?.description
            }
            selectedVehicleId={section.id_vehicle_type}
            vehicles={suggestedVehiclesData?.vehiclesWithOcupation || []}
            isLoadingVehicles={isLoadingVehicles || isLoadingSuggested}
            selectVehicle={handleSelectVehicle}
          />
          <Trash size={18} onClick={onRemove} style={{ cursor: "pointer" }} />
        </Flex>
        {id_type_service !== 3 ? (
          <>
            <div className="collapseResumeContainer">
              <div className="collapseResum">
                <div className="collapseResumItem collapseBorder">
                  <Text className="collapseText">Volumen utilizado</Text>
                  <Text className="collapseText collapseBold">
                    {currentSelectedVehicle?.ocupationM3} %
                  </Text>
                </div>
                <div className="collapseResumItem collapseBorder">
                  <Text className="collapseText">Volumen máximo</Text>
                  <Text className="collapseText collapseBold">
                    {currentSelectedVehicle?.m3_volume} m3
                  </Text>
                </div>
                <div className="collapseResumItem collapseBorder">
                  <Text className="collapseText">Peso utilizado</Text>
                  <Text className="collapseText collapseBold">
                    {currentSelectedVehicle?.ocupationKg} %
                  </Text>
                </div>
                <div className="collapseResumItem">
                  <Text className="collapseText">Peso máximo</Text>
                  <Text className="collapseText collapseBold">
                    {currentSelectedVehicle?.kg_capacity} kg
                  </Text>
                </div>
              </div>
            </div>
            <div className="collapseResumeContainer">
              <div className="collapseResum">
                <div className="collapseResumItem collapseBorder">
                  <Text className="collapseText">Volumen productos</Text>
                  <Text className="collapseText collapseBold">
                    {suggestedVehiclesData?.totalMaterials.volume.toFixed(2)} m3
                  </Text>
                </div>
                <div className="collapseResumItem collapseBorder">
                  <Text className="collapseText">Peso productos</Text>
                  <Text className="collapseText collapseBold">
                    {suggestedVehiclesData?.totalMaterials.kg} kg
                  </Text>
                </div>
                <div className="collapseResumItem collapseBorder">
                  <Text className="collapseText">Productos</Text>
                  <Text className="collapseText collapseBold">
                    {section.materialByTrip
                      .flatMap((item) => item.units)
                      .reduce((total, item) => total + item, 0)}
                    /{dataCarga.reduce((total, item) => total + item.units, 0)}
                  </Text>
                </div>
                <div className="collapseResumItem">
                  <Button disabled className="collapseBaggageButton">
                    Embalaje
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="collapsePersonsResumeContainer">
            <div className="collapsePersonsResum">
              <div className="collapsePersonsResumItem collapsePersonsBorder">
                <Text className="collapsePersonsText">Personas</Text>
                <Text className="collapsePersonsText collapsePersonsBold">{`${section.personByTrip.length}/${22}`}</Text>
              </div>
              <div className="collapsePersonsResumItem">
                <Button disabled className="collapsePersonsAcomodationButton">
                  Acomodación
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div>
        {id_type_service !== 3 ? (
          <Table
            columns={columnsVehiclesMaterial}
            dataSource={dataCarga.map((item) => ({ ...item, key: item.id }))}
            pagination={false}
            rowClassName={(record) => (selectedRowKeys.includes(record.id) ? "selectedRow" : "")}
          />
        ) : (
          <Table
            columns={columnsVehiclesPerson}
            dataSource={persons}
            pagination={false}
            rowSelection={{
              onChange: (_, selectedRows) => {
                handleSelectPerson(selectedRows);
              },
              selectedRowKeys: section?.personByTrip?.map((p: any) => p.id_person_transfer_request)
            }}
            rowClassName={(record) => (selectedRowKeys.includes(record.id) ? "selectedRow" : "")}
          />
        )}
      </div>
    </div>
  );
}
