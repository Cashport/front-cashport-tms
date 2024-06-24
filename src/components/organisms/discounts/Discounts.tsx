"use client";
import styles from "./Discounts.module.scss";
import { Flex, Table, message } from "antd";
import UiSearchInput from "@/components/ui/search-input";
import FilterDiscounts from "@/components/atoms/Filters/FilterDiscounts/FilterDiscounts";
import useDiscount from "./hooks/useDiscount";
import { discountsColumns } from "./constants/column";
import TablePaginator from "@/components/atoms/tablePaginator/TablePaginator";
import DropdownDiscount from "@/components/molecules/dropdown/discount/DropdownDiscount";
import { ModalDeleteDiscount } from "@/components/molecules/modals/modalDeleteDiscount/ModalDeleteDiscount";

export default function Discounts() {
  const [messageApi, messageContex] = message.useMessage();
  const {
    loading,
    res,
    data,
    handleChangePage,
    handleChangeSearch,
    page,
    handleChangeActive,
    handleSelectToDelete,
    modalDelete,
    handleDeactivate
  } = useDiscount({ messageApi });
  return (
    <>
      {messageContex}
      <Flex className={styles.FlexContainer} vertical gap={20}>
        <Flex className={styles.header} gap={"10px"}>
          <UiSearchInput placeholder="Buscar" onChange={handleChangeSearch} />
          <FilterDiscounts handleChangeActive={handleChangeActive} />
          <DropdownDiscount
            disableDelete={!data.some((item) => item.checked)}
            handleDeleteDiscount={modalDelete.handleOpen}
          />
        </Flex>
        <Table
          scroll={{ y: "61dvh", x: undefined }}
          columns={discountsColumns({
            handleSelect: handleSelectToDelete,
            handleDeactivate: handleDeactivate
          })}
          dataSource={data}
          loading={loading}
          pagination={{
            pageSize: 2,
            showSizeChanger: false,
            total: res?.pagination.totalPages || 0,
            onChange: handleChangePage,
            itemRender: TablePaginator,
            current: page
          }}
        />
      </Flex>
      {/* -----------------Modals----------------- */}
      <ModalDeleteDiscount
        isOpen={modalDelete.isOpen}
        isLoading={modalDelete.isLoading}
        onClose={modalDelete.handleClose}
        onRemove={modalDelete.removeDiscountAction}
      />
    </>
  );
}
