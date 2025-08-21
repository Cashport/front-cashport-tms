import React, { useEffect, useState } from "react";
import { Control, Controller } from "react-hook-form";
import { Flex, Select, Input } from "antd";
import { Info } from "@phosphor-icons/react";
import { NumericFormat } from "react-number-format";

import { getCompanyCodes } from "@/services/logistics/company-codes";
import { getClients } from "@/services/logistics/clients";

import { IFormCreateOrder } from "../../../CreateOrderVieww";
import { IClient, ICompanyCode } from "@/types/logistics/schema";

interface BillingSectionProps {
  control: Control<IFormCreateOrder, any>;
}

const BillingSection: React.FC<BillingSectionProps> = ({ control }) => {
  const [optionsCompanyCodes, setOptionsCompanyCodes] = useState<ICompanyCode[]>([]);
  const [optionsClients, setOptionsClients] = useState<IClient[]>([]);

  /* Company Code */
  const loadCompanyCodes = async () => {
    if (optionsCompanyCodes !== undefined && optionsCompanyCodes.length > 0) return;
    try {
      const res = await getCompanyCodes();
      setOptionsCompanyCodes(res.data);
    } catch (error) {
      console.error("Error get all company codes: ", error);
    }
  };

  useEffect(() => {
    loadCompanyCodes();
  }, []);

  /* End clients */
  const loadClients = async () => {
    if (optionsClients !== undefined && optionsClients.length > 0) return;

    try {
      const res = await getClients();
      setOptionsClients(res.data);
    } catch (error) {
      console.error("Error get all clients: ", error);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <Flex vertical gap={"1.5rem"} className="billingSection">
      <h3 className="subTitle">Facturación</h3>

      <Flex gap={"2rem"}>
        <div className="titleAndSelect">
          <Flex justify="space-between" align="center">
            <p>Company Code</p>
            <Info size={20} />
          </Flex>
          <Controller
            control={control}
            name="billing.companyCode"
            render={({ field }) => (
              <Select
                {...field}
                labelInValue
                value={
                  field.value
                    ? {
                        value: field.value.id,
                        label: field.value.description
                      }
                    : undefined
                }
                onChange={(option) => {
                  const selected = optionsCompanyCodes.find((c) => c.id === option.value);
                  field.onChange(selected || null);
                }}
                options={optionsCompanyCodes.map((c) => ({
                  value: c.id,
                  label: c.description
                }))}
                placeholder="Seleccionar"
                style={{ width: "100%" }}
                className="inputField"
              />
            )}
          />
        </div>

        <div className="titleAndSelect">
          <p>Cliente final</p>
          <Controller
            control={control}
            name="billing.endClient"
            render={({ field }) => (
              <Select
                {...field}
                labelInValue
                value={
                  field.value
                    ? {
                        value: field.value.id,
                        label: field.value.description
                      }
                    : undefined
                }
                onChange={(option) => {
                  const selected = optionsClients.find((c) => c.id === option.value);
                  field.onChange(selected || null);
                }}
                options={optionsClients.map((c) => ({
                  value: c.id,
                  label: c.description
                }))}
                placeholder="Seleccionar"
                style={{ width: "100%" }}
                className="inputField"
              />
            )}
          />
        </div>
      </Flex>

      <Flex gap={"2rem"}>
        <div className="titleAndSelect">
          <p>N° de contrato / Sales order</p>
          <Controller
            control={control}
            name="billing.contractNumber"
            render={({ field }) => (
              <Input {...field} placeholder="Ingrese número de contrato" className="inputField" />
            )}
          />
        </div>

        <div className="titleAndSelect">
          <p>Valor declarado de la carga</p>
          <Controller
            control={control}
            name="billing.declaredCargoValue"
            render={({ field: { onChange, onBlur, value, name, ref } }) => (
              <NumericFormat
                value={value}
                onValueChange={(values) => {
                  onChange(values.floatValue || null);
                }}
                onBlur={onBlur}
                name={name}
                getInputRef={ref}
                thousandSeparator="."
                decimalSeparator=","
                prefix="$ "
                placeholder="Ingrese valor declarado"
                customInput={Input}
                style={{ width: "100%" }}
                className="inputField"
                allowNegative={false}
                decimalScale={0}
              />
            )}
          />
        </div>
      </Flex>
    </Flex>
  );
};

export default BillingSection;
