import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, UseFormSetValue, useWatch } from "react-hook-form";
import { Flex, Button, Input, Select } from "antd";
import { Info, Plus, Trash } from "@phosphor-icons/react";
import { IFormCreateOrder } from "../../../CreateOrderVieww";

import { getPsl } from "@/services/logistics/psl";
import { IGetPSL } from "@/types/logistics/schema";
import "./productServiceLineSection.scss";

interface ProductServiceLineSectionProps {
  control: Control<IFormCreateOrder, any>;
  setValue: UseFormSetValue<IFormCreateOrder>;
}

const ProductServiceLineSection: React.FC<ProductServiceLineSectionProps> = ({
  control,
  setValue
}) => {
  const [PSLOptions, setPSLOptions] = useState<IGetPSL[]>();

  // Load PSL options
  const loadPSL = async () => {
    if (PSLOptions !== undefined && PSLOptions.length > 0) return;

    try {
      const res = await getPsl();

      setPSLOptions(res.data);
    } catch (error) {
      console.error("Error loading PSL options:", error);
    }
  };
  useEffect(() => {
    loadPSL();
  }, []);

  const {
    fields: pslFields,
    append: appendPSL,
    remove: removePSL
  } = useFieldArray({
    control,
    name: "productServiceLine.productServiceLine"
  });

  const watchedPSL =
    useWatch({
      control,
      name: "productServiceLine.productServiceLine"
    }) ?? [];

  return (
    <Flex vertical gap={"2rem"} className="productServiceLineSection">
      {pslFields.map((pslField, pslIndex) => {
        const costCenters = watchedPSL?.[pslIndex]?.costCenters || [];

        return (
          <div key={pslField.id} className="productServiceLineSection__container">
            <div className="PSLGeneral">
              <div className="titleAndSelect">
                <Flex justify="space-between" align="center">
                  <p>Product Service Line (PSL)</p>
                  <Info size={20} />
                </Flex>
                <Controller
                  control={control}
                  name={`productServiceLine.productServiceLine.${pslIndex}.selectedPSL`}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelInValue
                      placeholder="Seleccionar PSL"
                      className="inputField"
                      value={
                        field.value
                          ? {
                              value: field.value.id,
                              label: field.value.description
                            }
                          : undefined
                      }
                      onChange={(option) => {
                        const selected = PSLOptions?.find((psl) => psl.id === option.value);
                        field.onChange(selected ?? null);
                      }}
                      options={PSLOptions?.map((option) => ({
                        value: option.id,
                        label: option.description
                      }))}
                    />
                  )}
                />
              </div>

              <div className="titleAndSelect">
                <p>Porcentaje PSL</p>
                <span className="percentage">100%</span>
              </div>
            </div>

            {/* COST CENTER LIST */}
            <div className="PSLCostCenterList">
              {costCenters.map((cc: any, ccIndex: number) => (
                <div className="PSLCostCenter" key={ccIndex}>
                  <div className="titleAndSelect">
                    <Flex justify="space-between" align="center">
                      <p>Centro de costos</p>
                      <Info size={20} />
                    </Flex>
                    <Controller
                      control={control}
                      name={`productServiceLine.productServiceLine.${pslIndex}.costCenters.${ccIndex}`}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Selecciona centro de costos"
                          className="inputField"
                        />
                      )}
                    />
                  </div>

                  <div className="titleAndSelect">
                    <p>Porcentaje CC</p>
                    <Controller
                      control={control}
                      name={`productServiceLine.productServiceLine.${pslIndex}.costCenters.${ccIndex}.percentage`}
                      render={({ field }) => (
                        <Input {...field} type="number" className="inputField" />
                      )}
                    />
                  </div>

                  {ccIndex > 0 && (
                    <Button
                      className="removeButton"
                      type="link"
                      danger
                      icon={<Trash size={24} />}
                      onClick={() => {
                        const updated = [...costCenters];
                        updated.splice(ccIndex, 1);
                        setValue(
                          `productServiceLine.productServiceLine.${pslIndex}.costCenters`,
                          updated
                        );
                      }}
                    />
                  )}
                </div>
              ))}

              <Button
                className="addButton"
                onClick={() => {
                  const updated = [...costCenters, { costCenter: "", percentage: 0 }];
                  setValue(
                    `productServiceLine.productServiceLine.${pslIndex}.costCenters`,
                    updated
                  );
                }}
              >
                Agregar
                <Plus size={16} />
              </Button>
            </div>

            {/* <Button
              type="link"
              danger
              onClick={() => removePSL(pslIndex)}
              style={{ marginTop: "1rem" }}
            >
              Eliminar PSL
            </Button> */}
          </div>
        );
      })}

      <Button
        className="addButton"
        onClick={() => appendPSL({ selectedPSL: undefined, costCenters: [{ id: undefined }] })}
      >
        Agregar PSL
        <Plus size={16} />
      </Button>
    </Flex>
  );
};

export default ProductServiceLineSection;
