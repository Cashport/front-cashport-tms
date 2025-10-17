"use client";
import { Flex, Input, Button, Upload } from "antd";
import { Money, Files, PlusCircle } from "@phosphor-icons/react";
import { NumericFormat } from "react-number-format";
import { FormMode, IQuote } from "../../../view/AceptCarrierDetailView/AceptCarrierDetailView";
import styles from "./auctionForm.module.scss";

interface AuctionFormProps {
  quote?: IQuote;
  onQuoteAmountChange: (value: number | undefined) => void;
  onFileChange: (file: File) => boolean;
  formMode: FormMode;
}

export default function AuctionForm({
  quote,
  onQuoteAmountChange,
  onFileChange,
  formMode
}: Readonly<AuctionFormProps>) {
  return (
    <Flex
      gap="3.125rem"
      align="flex-start"
      justify="space-between"
      style={{ padding: "2rem 0 3rem 0" }}
    >
      {/* Cost input section */}
      <Flex
        align="center"
        justify="space-between"
        gap="0.5rem"
        style={{ flex: "1 1 50%", minWidth: 0 }}
      >
        <Flex align="center" gap="0.8rem" style={{ color: "#666666" }}>
          <Money size={20} />
          <p style={{ fontWeight: 400 }}>Costo</p>
        </Flex>
        <div
          style={{ alignSelf: "flex-end", justifySelf: "flex-end" }}
          className={styles.inputCostContainer}
        >
          <NumericFormat
            value={quote?.amount}
            onValueChange={(values) => {
              onQuoteAmountChange(values.floatValue);
            }}
            thousandSeparator="."
            decimalSeparator=","
            prefix="$ "
            placeholder="$0"
            customInput={Input}
            style={{ width: "100%" }}
            allowNegative={false}
            decimalScale={0}
            className={styles.inputCost}
            disabled={formMode !== FormMode.CREATE}
          />
        </div>
      </Flex>

      {/* Document upload section */}
      <Flex
        align="flex-start"
        gap="0.5rem"
        className={styles.auctionInfo}
        style={{ flex: "1 1 50%", minWidth: 0, overflowX: "hidden", textOverflow: "ellipsis" }}
      >
        <Flex align="center" gap="0.8rem" style={{ color: "#666666", marginTop: "0.25rem" }}>
          <Files size={20} />
          <p style={{ fontWeight: 400 }}>PDF Cotización</p>
        </Flex>
        <Flex gap="0.5rem" align="flex-end" justify="space-between" vertical style={{ flex: 1 }}>
          {quote?.files?.[0] && (
            <span style={{ fontSize: "0.875rem" }} className={styles.fileName}>
              {quote.files[0].name}
            </span>
          )}
          <Upload accept=".pdf" showUploadList={false} beforeUpload={onFileChange} maxCount={1}>
            <Button
              type="text"
              className={styles.addSupportBtn}
              disabled={formMode !== FormMode.CREATE}
            >
              <PlusCircle size={20} />
              Agregar soporte
            </Button>
          </Upload>
        </Flex>
      </Flex>
    </Flex>
  );
}
