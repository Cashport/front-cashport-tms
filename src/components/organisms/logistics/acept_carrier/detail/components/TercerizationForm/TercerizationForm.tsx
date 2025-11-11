"use client";
import { Flex, Input, Button, Upload } from "antd";
import { Money, Files, PlusCircle } from "@phosphor-icons/react";
import { NumericFormat } from "react-number-format";
import { FormMode, IQuote } from "../../../view/AceptCarrierDetailView/AceptCarrierDetailView";
import styles from "./TercerizationForm.module.scss";

interface TercerizationFormProps {
  quote?: IQuote;
  onQuoteAmountChange: (value: number | undefined) => void;
  onQuoteAssociationAmountChange: (value: number | undefined) => void;
  onFileChange: (file: File) => boolean;
  formMode: FormMode;
}

export default function TercerizationForm({
  quote,
  onQuoteAmountChange,
  onQuoteAssociationAmountChange,
  onFileChange,
  formMode
}: Readonly<TercerizationFormProps>) {
  return (
    <Flex vertical gap="2rem" style={{ padding: "2rem 0 3rem 0" }}>
      {/* Primera fila: Costo + PDF Cotización */}
      <Flex gap="3.125rem" align="flex-start" justify="space-between">
        {/* Costo */}
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
              value={quote?.association_cost}
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

        {/* PDF Cotización */}
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
            {quote?.association_file?.[0] && (
              <span style={{ fontSize: "0.875rem" }} className={styles.fileName}>
                {quote.association_file[0].name}
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

      {/* Segunda fila: Costo Asociación */}
      <Flex gap="3.125rem" align="center" justify="space-between">
        <Flex
          align="center"
          justify="space-between"
          gap="0.5rem"
          style={{ flex: "1 1 50%", minWidth: 0 }}
        >
          <Flex align="center" gap="0.8rem" style={{ color: "#666666" }}>
            <Money size={20} />
            <p style={{ fontWeight: 400 }}>Costo Asociación</p>
          </Flex>
          <div
            style={{ alignSelf: "flex-end", justifySelf: "flex-end" }}
            className={styles.inputCostContainer}
          >
            <NumericFormat
              value={(quote as any)?.association_name}
              onValueChange={(values) => {
                onQuoteAssociationAmountChange(values.floatValue);
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
      </Flex>
    </Flex>
  );
}
