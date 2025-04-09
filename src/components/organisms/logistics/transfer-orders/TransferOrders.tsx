"use client";
import { useEffect, useState } from "react";
import { Empty, Flex, Typography } from "antd";
import { DotsThree, Plus } from "phosphor-react";
import { useSearchParams } from "next/navigation";

import { Request } from "./request/Request";
import { InProcess } from "./in-process/InProcess";
import { Completed } from "./completed/completed";
import { SearchProvider } from "@/context/SearchContext";
import { useAppStore } from "@/lib/store/store";
import { TMS_COMPONENTS, TMSMODULES } from "@/utils/constants/globalConstants";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import Container from "@/components/atoms/Container/Container";
import ProtectedComponent from "@/components/molecules/protectedComponent/ProtectedComponent";
import { checkUserComponentPermissions } from "@/utils/utils";
import ModalGenerateActionOrders from "@/components/molecules/modals/ModalGenerateActionOrders/ModalGenerateActionOrders";
import UiSearchInput from "@/components/ui/search-input-provider";
import Filter from "@/components/atoms/Filters/FilterOrders";
import { ModalCancelTR } from "@/components/molecules/modals/ModalCancelTR/ModalCancelTR";
import { DataTypeForTransferOrderTable } from "@/components/molecules/tables/TransferOrderTable/TransferOrderTable";
import { ModalPostponeTR } from "@/components/molecules/modals/ModalPostponeTR/ModalPostponeTR";

import styles from "./transferOrders.module.scss";

const { Text } = Typography;

export enum TabEnum {
  "REQUESTS" = "REQUESTS",
  "IN_PROCESS" = "IN_PROCESS",
  "COMPLETED" = "COMPLETED"
}

const viewName: keyof typeof TMSMODULES = "TMS-Viajes";

export const TransferOrders = () => {
  const { selectedProject: project, isHy } = useAppStore((state) => state);
  const [ordersId, setOrdersId] = useState<string[]>([]);
  const [trsIds, setTrsIds] = useState<string[]>([]);
  const [childOrdersId, setChildOrdersId] = useState<string[]>([]);
  const [TRStatusId, setTRStatusId] = useState<string>();
  const [mutate, setMutate] = useState(false);

  const searchParams = useSearchParams();
  const [selectFilters, setSelectFilters] = useState({
    country: [] as string[],
    currency: [] as string[]
  });
  const tabParam = searchParams.get("tab") as TabEnum | null;
  const [tab, setTab] = useState<TabEnum>();
  const [isModalOpen, setIsModalOpen] = useState({ selected: 0 });

  useEffect(() => {
    if (isHy) {
      // if the zustand store is hydrated
      const checkFunction = ({ create_permission }: { create_permission: boolean }) =>
        create_permission;
      // Actualizar el estado del tab si cambia el parámetro en la URL
      if (tabParam && Object.values(TabEnum).includes(tabParam)) {
        // if the tabParam is valid and exists in the TabEnum
        if (
          checkUserComponentPermissions(
            project,
            viewName,
            TMS_COMPONENTS[viewName][tabParam],
            checkFunction
          )
        ) {
          // if the user has the required permissions to access the tabParam
          setTab(tabParam);
        } else {
          // else, set the tab to the first valid tab
          const valid = Object.values(TabEnum).find((tab) =>
            checkUserComponentPermissions(
              project,
              viewName,
              TMS_COMPONENTS[viewName][tab],
              checkFunction
            )
          );
          if (valid) setTab(valid as TabEnum);
        }
      } else {
        // if the tabParam is not valid, set the tab to the first valid tab (first validate "IN_PROCESS")
        const valid = [TabEnum.IN_PROCESS, ...Object.values(TabEnum)].find((tab) =>
          checkUserComponentPermissions(
            project,
            viewName,
            TMS_COMPONENTS[viewName][tab],
            checkFunction
          )
        );
        if (valid) setTab(valid as TabEnum);
      }
    }
  }, [tabParam, isHy, project]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setOrdersId((prevOrdersId) =>
      checked ? [...prevOrdersId, id] : prevOrdersId.filter((orderId) => orderId !== id)
    );
  };
  const handleCheckboxChangeTR = (
    id: string,
    checked: boolean,
    row: DataTypeForTransferOrderTable
  ) => {
    setTrsIds((prevTRsIds) =>
      checked ? [...prevTRsIds, id] : prevTRsIds.filter((TRid) => TRid !== id)
    );
    setChildOrdersId((prevOrdersId) =>
      checked
        ? [...prevOrdersId, ...(row.TOs?.split(",") ?? []).map((order) => order)]
        : prevOrdersId.filter((orderId) => !row.TOs?.split(",").includes(orderId))
    );
    setTRStatusId(row.statusId);
  };
  useEffect(() => {
    if (mutate) {
      setMutate(false);
    }
  }, [mutate]);

  const renderView = () => {
    switch (tab) {
      case TabEnum.REQUESTS:
        return (
          <Request
            handleCheckboxChange={handleCheckboxChange}
            ordersId={ordersId}
            trsIds={trsIds}
            handleCheckboxChangeTR={handleCheckboxChangeTR}
            modalState={isModalOpen.selected === 1}
            mutateData={mutate}
          />
        );
      case TabEnum.IN_PROCESS:
        return (
          <InProcess
            trsIds={trsIds}
            modalState={isModalOpen.selected === 1}
            handleCheckboxChangeTR={handleCheckboxChangeTR}
            mutateData={mutate}
          />
        );
      case TabEnum.COMPLETED:
        return <Completed />;
      default:
        return <Empty />;
    }
  };

  return (
    <SearchProvider debounceDelay={500}>
      <Container>
        <Flex justify="space-between" style={{ marginBottom: "1rem" }}>
          <div className={styles.filterContainer}>
            <UiSearchInput className="search" placeholder="Buscar" />
            <Filter />
            <PrincipalButton
              type="default"
              icon={<DotsThree size={"1.5rem"} />}
              disabled={false}
              loading={false}
              onClick={() => setIsModalOpen({ selected: 1 })}
            >
              Generar acción
            </PrincipalButton>
          </div>
          <ProtectedComponent
            componentName={TMS_COMPONENTS[viewName].REQUESTS}
            viewName={viewName}
            checkFunction={({ create_permission }) => create_permission}
          >
            <PrincipalButton
              type="primary"
              className="buttonNewProject"
              size="large"
              href="/logistics/orders/new"
            >
              Crear Nuevo Viaje
              {<Plus weight="bold" size={14} />}
            </PrincipalButton>
          </ProtectedComponent>
        </Flex>
        <div className={styles.tabContainer} style={{ marginBottom: "0.5rem" }}>
          <ProtectedComponent componentName={TMS_COMPONENTS[viewName].REQUESTS} viewName={viewName}>
            <Text
              onClick={() => setTab(TabEnum.REQUESTS)}
              className={`${styles.tab} ${tab === TabEnum.REQUESTS && styles.active}`}
            >
              Solicitudes
            </Text>
          </ProtectedComponent>
          <ProtectedComponent
            componentName={TMS_COMPONENTS[viewName].IN_PROCESS}
            viewName={viewName}
          >
            <Text
              onClick={() => setTab(TabEnum.IN_PROCESS)}
              className={`${styles.tab} ${tab === TabEnum.IN_PROCESS && styles.active}`}
            >
              En curso
            </Text>
          </ProtectedComponent>
          <ProtectedComponent
            componentName={TMS_COMPONENTS[viewName].COMPLETED}
            viewName={viewName}
          >
            <Text
              onClick={() => setTab(TabEnum.COMPLETED)}
              className={`${styles.tab} ${tab === TabEnum.COMPLETED && styles.active}`}
            >
              Finalizados
            </Text>
          </ProtectedComponent>
        </div>
        <div>{isHy && renderView()}</div>
        <ModalGenerateActionOrders
          isOpen={isModalOpen.selected === 1}
          onClose={(resetStates?: boolean) => {
            setIsModalOpen({ selected: 0 });
            if (resetStates) {
              setOrdersId([]);
              setTrsIds([]);
              setChildOrdersId([]);
            }
          }}
          ordersId={ordersId}
          trsIds={trsIds}
          setIsModalOpen={setIsModalOpen}
        />
        <ModalCancelTR
          isOpen={isModalOpen.selected === 2}
          onCancel={() =>
            setIsModalOpen({
              selected: 1
            })
          }
          onClose={() => {
            // clean states
            setOrdersId([]);
            setTrsIds([]);
            setChildOrdersId([]);

            // causw reloading of the data
            setMutate((prev) => !prev);
            setIsModalOpen({ selected: 0 });
          }}
          trID={trsIds[0]}
          toIDs={childOrdersId}
          trStatus={TRStatusId}
        />

        <ModalPostponeTR
          isOpen={isModalOpen.selected === 3}
          onCancel={() => setIsModalOpen({ selected: 1 })}
          onClose={() => {
            setOrdersId([]);
            setTrsIds([]);
            setChildOrdersId([]);
            setIsModalOpen({ selected: 0 });
          }}
        />
      </Container>
    </SearchProvider>
  );
};
