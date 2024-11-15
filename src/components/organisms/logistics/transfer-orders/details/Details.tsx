/* eslint-disable no-unused-vars */
import styles from "./details.module.scss";
import { CaretDoubleRight, CaretLeft, DotsThree } from "phosphor-react";
import { Button, Drawer, Flex, message, Typography } from "antd";
import { MainDescription } from "./main-description/MainDescription";
import { Step } from "./step/Step";
import { useEffect, useState } from "react";
import { Novelty } from "./novelty/Novelty";
import {
  getTransferRequestDetail,
  updateTransferRequestStatus
} from "@/services/logistics/transfer-request";
import { useParams, useRouter } from "next/navigation";
import { ITransferRequestDetail } from "@/types/transferRequest/ITransferRequest";
import { DrawerBody } from "./drawer-body/DrawerBody";
import { INovelty } from "@/types/novelty/INovelty";
import {
  aprobeOrRejectDetail,
  createNovelty,
  createNoveltyEvidences,
  getNoveltyDetail,
  updateNovelty
} from "@/services/logistics/novelty";
import { getTransferJourney } from "@/services/logistics/transfer-journey";
import { ITransferJourney } from "@/types/transferJourney/ITransferJourney";
import { DrawerCreateBody } from "./drawer-create-body/DrawerCreateBody";
import ModalGenerateActionTO from "@/components/molecules/modals/ModalGenerateActionTO/ModalGenerateActionTO";
import { BillingTable } from "./billing-table/BillingTable";
import { getBillingByTransferRequest } from "@/services/logistics/billing_list";
import { BillingByCarrier } from "@/types/logistics/billing/billing";
import ModalBillingMT from "@/components/molecules/modals/ModalBillingMT/ModalBillingMT";
import ModalBillingAction from "@/components/molecules/modals/ModalBillingAction/ModalBillingAction";
import { STATUS, STORAGE_TOKEN } from "@/utils/constants/globalConstants";

const Text = Typography;

export enum NavEnum {
  NOVELTY = "NOVELTY",
  VEHICLES = "VEHICLES",
  MATERIALS = "MATERIALS",
  DOCUMENTS = "DOCUMENTS",
  PSL = "PSL",
  BILLING = "BILLING"
}

export interface IForm {
  noeltyTypeId: number | null;
  quantity: number;
  observation: string;
  value: number;
  overcostId?: number;
}

export const TransferOrderDetails = () => {
  const [nav, setNav] = useState<NavEnum>(NavEnum.NOVELTY);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalMTVisible, setIsModalMTVisible] = useState(false);
  const [isModalBillingVisible, setIsModalBillingVisible] = useState(false);
  const [billingId, setBillingId] = useState<number | null>(null);

  const [messageApi, contextHolder] = message.useMessage();
  const [isCreateNovelty, setIsCreateNovelty] = useState<boolean>(false);
  const [transferRequest, setTransferRequest] = useState<ITransferRequestDetail | null>(null);
  const [transferJournies, setTransferJournies] = useState<ITransferJourney[]>();
  const [novelty, setNovelty] = useState<INovelty | null>(null);
  const [billingList, setBillingList] = useState<BillingByCarrier[]>([]);
  const [tripData, setTripData] = useState<{
    idCarrier: number;
    idVehicleType: number;
    canEditNovelties: boolean;
  }>({
    idCarrier: 0,
    idVehicleType: 0,
    canEditNovelties: false
  });

  const [tripId, setTripId] = useState<number | null>(null);
  const [form, setForm] = useState<IForm>({
    noeltyTypeId: 0,
    quantity: 0,
    observation: "",
    value: 0,
    overcostId: undefined
  });
  const [formEvidences, setFormEvidences] = useState<File[]>([]);

  const { id } = useParams();
  const router = useRouter();

  const findNoveltyDetail = async (id: number) => {
    setIsCreateNovelty(false);
    const data = await getNoveltyDetail(id);
    if (Object.keys(data).length) {
      setNovelty(data as INovelty);
    }
  };

  function canFinalizeJourney(journeys: ITransferJourney[]): boolean {
    for (const journey of journeys) {
      for (const trip of journey.trips) {
        if (trip.trip_status !== "Terminado") {
          return false;
        }
        for (const novelty of trip.novelties) {
          if (novelty.status === "Pendiente") {
            return false;
          }
        }
      }
    }
    return true;
  }

  const canFinalizeTrip = transferJournies
    ? canFinalizeJourney(transferJournies) && transferRequest?.status_id == STATUS.BNG.POR_LEGALIZAR
    : false;

  const inProgressStatus = [
    STATUS.TR.SIN_INICIAR,
    STATUS.TR.CARGANDO,
    STATUS.TR.EN_CURSO,
    STATUS.TR.DESCARGANDO,
    STATUS.TR.STAND_BY,
    STATUS.TR.DETENIDO
  ];

  const canChangeStatusToPorLegalizar = inProgressStatus.includes(transferRequest?.status_id ?? "");

  const handleBillingTableViewDetails = (id: number) => {
    setIsModalBillingVisible(true);
    setBillingId(id);
  };

  const renderView = () => {
    switch (nav) {
      case NavEnum.NOVELTY:
        return (
          <Novelty
            transferRequestId={transferRequest?.id || null}
            openDrawer={() => setOpenDrawer(true)}
            handleOpenCreateDrawer={handleOpenCreateDrawer}
            handleShowDetails={findNoveltyDetail}
            transferJournies={transferJournies || []}
            setTripId={(id: number) => setTripId(id)}
            handleOpenMTModal={handleOpenMTModal}
            setTripData={setTripData}
            resetNovelty={() => setNovelty(null)}
          />
        );
      case NavEnum.VEHICLES:
        return <div>Vehicles view</div>;
      case NavEnum.MATERIALS:
        return <div>Materials view</div>;
      case NavEnum.DOCUMENTS:
        return <div>Documents view</div>;
      case NavEnum.PSL:
        return <div>Psl view</div>;
      case NavEnum.BILLING:
        return (
          <BillingTable
            supplierBillings={billingList}
            handleShowDetails={handleBillingTableViewDetails}
          />
        );
      default:
        return <div />;
    }
  };

  const findDetails = async () => {
    const data = await getTransferRequestDetail(Number(id));
    if (Object.keys(data).length) {
      setTransferRequest(data as ITransferRequestDetail);
    }
  };

  const findNovelties = async () => {
    const data = await getTransferJourney(Number(transferRequest?.id || id));
    if (Object.keys(data).length) {
      setTransferJournies(data as ITransferJourney[]);
    }
  };

  const findBilling = async () => {
    const data = await getBillingByTransferRequest(Number(transferRequest?.id || id));
    if (Object.keys(data).length) {
      setBillingList(data as BillingByCarrier[]);
    }
  };

  const approbeOrReject = async (id: number, isApprobe: boolean) => {
    const data = await aprobeOrRejectDetail(id, isApprobe);
    if (data) {
      findDetails();
      setOpenDrawer(false);
      message.success(`Novedad ${isApprobe ? "aceptada" : "rechazada"}`);
    }
  };

  const handleCreateNovelty = async () => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const payload = token!.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));

    const body = {
      observation: form.observation,
      novelty_type_id: form.noeltyTypeId!,
      trip_id: tripId!,
      quantity: form.quantity,
      value: form.value,
      created_by: decodedPayload.email || "",
      overcostId: form.overcostId || 0,
      evidences: []
    };
    try {
      if (novelty && novelty.id) {
        const update = await updateNovelty({
          id: novelty.id,
          observation: form.observation,
          quantity: form.quantity,
          value: form.value,
          overcostId: form.overcostId || 0,
          evidences: [],
          novelty_type_id: Number(form.noeltyTypeId),
          trip_id: novelty.trip_id,
          created_by: novelty.created_by
        });
        if (update) {
          await createNoveltyEvidences(novelty.id, formEvidences);
          setOpenDrawer(false);
          message.success("Novedad actualizada");
          setForm({
            noeltyTypeId: 0,
            quantity: 0,
            observation: "",
            value: 0,
            overcostId: undefined
          });
          setFormEvidences([]);
          findNovelties();
        }
      } else {
        const create = await createNovelty(body);
        if (create) {
          await createNoveltyEvidences(create.id, formEvidences);
          message.success("Novedad creada");
          setOpenDrawer(false);
          setForm({
            noeltyTypeId: 0,
            quantity: 0,
            observation: "",
            value: 0,
            overcostId: undefined
          });
          setFormEvidences([]);
          findNovelties();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeStatus = async (statusId: string) => {
    if (transferRequest) {
      const updateStatus = await updateTransferRequestStatus(transferRequest?.id, statusId);
      if (updateStatus) {
        findDetails();
      }
    }
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setNovelty(null);
    setForm({
      noeltyTypeId: 0,
      quantity: 0,
      observation: "",
      value: 0
    });
    setFormEvidences([]);
  };

  const handleOpenCreateDrawer = () => {
    setIsCreateNovelty(true);
    setOpenDrawer(true);
  };

  const handleOpenMTModal = () => {
    setIsModalMTVisible(true);
  };

  const handleEdit = () => {
    setIsCreateNovelty(true);
  };

  useEffect(() => {
    findDetails();
  }, []);

  useEffect(() => {
    if (!isModalVisible && !isModalBillingVisible) {
      findDetails();
    }
  }, [isModalVisible, isModalBillingVisible]);

  useEffect(() => {
    findNovelties();
    findBilling();
  }, [transferRequest]);

  return (
    <Flex vertical>
      {contextHolder}
      <div className={styles.card}>
        <div className={styles.titleContainer}>
          <div onClick={() => router.back()} className={styles.backContainer}>
            <CaretLeft size={24} />
            <Text className={styles.title}>Datos del viaje</Text>
          </div>
          <div className={styles.btnContainer}>
            <Button
              className={styles.actionBtn}
              type="text"
              size="large"
              onClick={() => setIsModalVisible(true)}
            >
              <DotsThree size={24} />
              <Text className={styles.text}>Generar acción</Text>
            </Button>
            <Button className={styles.tranckingBtn} type="text" size="large">
              <Text className={styles.text}>Tracking</Text>
              <CaretDoubleRight size={24} />
            </Button>
          </div>
        </div>
        <MainDescription
          handleChangeStatus={handleChangeStatus}
          transferRequest={transferRequest}
        />
        <Step steps={transferRequest?.steps || []} />
      </div>
      <div className={styles.card} style={{ marginTop: "2rem" }}>
        <div className={styles.navContainer}>
          <Text
            onClick={() => setNav(NavEnum.NOVELTY)}
            className={`${styles.nav} ${nav === NavEnum.NOVELTY && styles.active}`}
          >
            Novedades
          </Text>
          {/* <Text onClick={() => setNav(NavEnum.VEHICLES)} className={`${styles.nav} ${nav === NavEnum.VEHICLES && styles.active}`}>Vehículos</Text>
            <Text onClick={() => setNav(NavEnum.MATERIALS)} className={`${styles.nav} ${nav === NavEnum.MATERIALS && styles.active}`}>Materiales</Text>
            <Text onClick={() => setNav(NavEnum.DOCUMENTS)} className={`${styles.nav} ${nav === NavEnum.DOCUMENTS && styles.active}`}>Documentos</Text>
            <Text onClick={() => setNav(NavEnum.PSL)} className={`${styles.nav} ${nav === NavEnum.PSL && styles.active}`}>PSL</Text> */}
          <Text
            onClick={() => setNav(NavEnum.BILLING)}
            className={`${styles.nav} ${nav === NavEnum.BILLING && styles.active}`}
          >
            Facturación
          </Text>
        </div>
        <div>{renderView()}</div>
      </div>

      <Drawer
        placement="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
        closable={false}
        key="right"
        width={592}
        styles={{
          body: {
            backgroundColor: "#FFFFFF"
          }
        }}
      >
        {!isCreateNovelty ? (
          <DrawerBody
            onClose={handleCloseDrawer}
            novelty={novelty}
            handleEdit={handleEdit}
            approbeOrReject={approbeOrReject}
            canEdit={tripData.canEditNovelties}
          />
        ) : (
          <DrawerCreateBody
            onClose={handleCloseDrawer}
            novelty={novelty}
            handleCreateNovelty={handleCreateNovelty}
            form={form}
            formEvidences={formEvidences}
            setFormEvidences={setFormEvidences}
            setForm={setForm}
            tripData={tripData}
          />
        )}
      </Drawer>
      <ModalGenerateActionTO
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        idTR={id as string}
        carriersData={billingList}
        messageApi={messageApi}
        canFinalizeTrip={canFinalizeTrip}
        statusTrId={transferRequest?.status_id}
        canChangeStatusToPorLegalizar={canChangeStatusToPorLegalizar}
        handleChangeStatus={handleChangeStatus}
        setNav={setNav}
      />
      <ModalBillingMT
        mode="edit"
        isOpen={isModalMTVisible}
        onClose={() => setIsModalMTVisible(false)}
        idTR={id as string}
        idTrip={tripId ?? 0}
        messageApi={messageApi}
      />
      <ModalBillingAction
        isOpen={isModalBillingVisible}
        onClose={() => setIsModalBillingVisible(false)}
        idBilling={billingId ?? 0}
        idTR={Number(id)}
        canEditForm={false}
        totalValue={billingList?.find((b) => b.id == billingId)?.subtotal ?? 0}
        messageApi={messageApi}
        uploadInvoiceTitle={billingList?.find((b) => b.id == billingId)?.carrier}
      />
    </Flex>
  );
};
