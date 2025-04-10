import { useEffect, useState } from "react";
import Link from "next/link";
import { Spin, TableProps, Button, Col, Flex, Row, Table, Typography } from "antd";
import {
  CalendarBlank,
  CalendarX,
  DotsThree,
  Eye,
  Money,
  Calendar,
  Receipt,
  XCircle,
  MagnifyingGlassMinus
} from "phosphor-react";
import CardsClients from "../../../molecules/modals/CardsClients/CardsClients";
import { usePortfolios } from "@/hooks/usePortfolios";
import { IClientsPortfolio } from "@/types/clients/IViewClientsTable";
import { formatMoney } from "@/utils/utils";
import { useAppStore } from "@/lib/store/store";
import redirectModal from "@/components/molecules/modals/redirectModal/RedirectModal";
import "./ClientsViewTable.scss";
import useStore from "@/lib/hook/useStore";
import Container from "@/components/atoms/Container/Container";

const { Text } = Typography;

export const ClientsViewTable = () => {
  const [page, setPage] = useState(1);
  const [isComponentLoading, setIsComponentLoading] = useState(true);

  const project = useStore(useAppStore, (projects) => projects.selectedProject);
  const ID = project?.ID;

  useEffect(() => {
    setIsComponentLoading(false);
  }, []);

  useEffect(() => {
    if (!isComponentLoading && !ID) {
      redirectModal();
    }
  }, [isComponentLoading, ID]);

  useEffect(() => {
    if (!isComponentLoading && !ID) {
      redirectModal();
    }
  }, [isComponentLoading, ID]);

  const { data, loading } = usePortfolios({ page: page });

  const [loadingOpenPortfolio, setLoadingOpenPortfolio] = useState({
    isLoading: false,
    loadingId: 0
  });

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  const columns: TableProps<IClientsPortfolio>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "client_name",
      key: "client_name",
      render: (_, row: IClientsPortfolio) => (
        <Link href={`/clientes/detail/${row.client_id}/project/${row.project_id}`}>
          <Text className="text">{row.client_name}</Text>
        </Link>
      )
    },
    {
      align: "right",
      title: "Cartera",
      dataIndex: "total_portfolio",
      key: "total_portfolio",
      render: (text) => <Text>{formatMoney(text)}</Text>
    },
    {
      align: "right",
      title: "Vencida",
      dataIndex: "past_due_ammount",
      key: "past_due_ammount",
      render: (text) => <Text>{formatMoney(text)}</Text>
    },
    {
      align: "right",
      title: "Presupuesto",
      key: "budget_ammount",
      dataIndex: "budget_ammount",
      render: (text) => <Text>{formatMoney(text)}</Text>
    },
    {
      align: "right",
      title: "R. Aplicado",
      key: "applied_payments_ammount",
      dataIndex: "applied_payments_ammount",
      render: (text) => <Text>{formatMoney(text)}</Text>
    },
    {
      align: "center",
      width: 103,
      title: "Ejecutado",
      key: "executed_percentage",
      dataIndex: "executed_percentage",
      render: (text) => <Text>{text} %</Text>
    },
    {
      align: "right",
      title: "PNA",
      key: "unapplied_payments_ammount",
      dataIndex: "unapplied_payments_ammount",
      render: (text) => <Text>{formatMoney(text)}</Text>
    },
    {
      align: "right",
      title: "Saldos",
      key: "total_balances",
      dataIndex: "total_balances",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Holding",
      key: "holding_name",
      dataIndex: "holding_name",
      render: (text) => <Text className="text">{text}</Text>
    },
    {
      title: "",
      key: "buttonSee",
      width: 64,
      dataIndex: "",
      render: (_, row: IClientsPortfolio) => (
        <Link href={`/clientes/detail/${row.client_id}/project/${row.project_id}`}>
          <Button
            key={row.client_id}
            onClick={() => setLoadingOpenPortfolio({ isLoading: true, loadingId: row.client_id })}
            className="buttonSeeProject"
            icon={
              loadingOpenPortfolio.loadingId === row.client_id && loadingOpenPortfolio.isLoading ? (
                <Spin />
              ) : (
                <Eye size={"1.3rem"} />
              )
            }
          />
        </Link>
      )
    }
  ];

  return (
    <Container>
      <Flex justify="space-between" className="mainClientsTable_header">
        <Flex gap={"10px"}>
          <Button size="large" icon={<DotsThree size={"1.5rem"} />} />
        </Flex>
      </Flex>
      <Row gutter={8}>
        <Col span={21} className="cards">
          <Row gutter={8}>
            <Col span={4}>
              <CardsClients
                title={"Total cartera"}
                total={data?.data?.grandTotal?.total_wallet || 0}
                icon={<Money />}
              />
            </Col>
            <Col span={4}>
              <CardsClients
                title={"C. vencida"}
                total={data?.data?.grandTotal?.total_past_due || 0}
                icon={<CalendarX />}
              />
            </Col>
            <Col span={4}>
              <CardsClients
                title={"Presupuesto"}
                total={data?.data?.grandTotal?.total_budget || 0}
                icon={<CalendarBlank />}
              />
            </Col>
            <Col span={4}>
              <CardsClients
                title={"R. aplicado"}
                total={data?.data?.grandTotal?.applied_payments_ammount || 0}
                icon={<Receipt />}
              />
            </Col>
            <Col span={4}>
              <CardsClients
                title={"Pagos no ap."}
                total={data?.data?.grandTotal?.unapplied_payments_ammount || 0}
                icon={<XCircle />}
              />
            </Col>
            <Col span={4}>
              <CardsClients
                title={"Pagos no id."}
                total={data?.data?.grandTotal?.unidentified_payment_ammount || 0}
                icon={<MagnifyingGlassMinus />}
              />
            </Col>
          </Row>
        </Col>
        <Col span={3}>
          <CardsClients
            title={"DSO"}
            total={data?.data?.grandTotal?.dso || 0}
            icon={<Calendar />}
            notAMoneyValue
          />
        </Col>
      </Row>
      <Table
        loading={loading}
        scroll={{ y: "61dvh", x: undefined }}
        columns={columns as TableProps<any>["columns"]}
        pagination={{
          current: page,
          pageSize: data?.pagination.rowsperpage,
          total: data?.pagination?.totalRows,
          onChange: onChangePage,
          showSizeChanger: false
        }}
        dataSource={data?.data?.clientsPortfolio.map((data) => ({ ...data, key: data.client_id }))}
      />
    </Container>
  );
};
