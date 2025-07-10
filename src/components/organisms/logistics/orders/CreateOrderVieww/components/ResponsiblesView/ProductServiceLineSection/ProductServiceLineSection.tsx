import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, UseFormSetValue, useWatch } from "react-hook-form";
import { Flex, Button, Select, InputNumber } from "antd";
import { CaretLeft, CaretRight, Info, Plus, Trash, X } from "@phosphor-icons/react";

import { getPsl } from "@/services/logistics/psl";

import { IGetPSL } from "@/types/logistics/schema";
import { IFormCreateOrder } from "../../../CreateOrderVieww";

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
            {/* Remove PSL Button */}
            {pslIndex > 0 && (
              <button className="removePSLButton" onClick={() => removePSL(pslIndex)}>
                <X size={20} />
              </button>
            )}

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
                <Controller
                  control={control}
                  name={`productServiceLine.productServiceLine.${pslIndex}.percentagePSL`}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      className="inputField inputPercentage"
                      controls={false}
                      placeholder="0"
                      max={100}
                      min={0}
                      formatter={(value) => `${value}%`}
                      defaultValue={0}
                      addonBefore={
                        <button
                          className="percentageControl decrement"
                          onClick={() => field.onChange(Math.max((field.value || 1) - 1, 1))}
                        >
                          <CaretLeft size={18} style={{ cursor: "pointer" }} />
                        </button>
                      }
                      addonAfter={
                        <button
                          className="percentageControl increment"
                          onClick={() => field.onChange((field.value || 1) + 1)}
                        >
                          <CaretRight size={18} style={{ cursor: "pointer" }} />
                        </button>
                      }
                    />
                  )}
                />
              </div>
            </div>

            {/* COST CENTER LIST */}
            <div className="PSLCostCenterList">
              {costCenters.map((cc: any, ccIndex: number) => {
                // Obtenemos el PSL seleccionado actualmente para este índice
                const selectedPSL = watchedPSL?.[pslIndex]?.selectedPSL;

                // Obtenemos las opciones de centros de costo para el PSL seleccionado
                const costCenterOptions =
                  selectedPSL?.cost_center?.map((cc: any) => ({
                    value: cc.id,
                    label: cc.description
                  })) ?? [];

                return (
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
                            options={costCenterOptions}
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
                          <InputNumber
                            {...field}
                            className="inputField inputPercentage"
                            controls={false}
                            placeholder="0"
                            max={100}
                            min={0}
                            formatter={(value) => `${value}%`}
                            defaultValue={0}
                            addonBefore={
                              <button
                                className="percentageControl decrement"
                                onClick={() => field.onChange(Math.max((field.value || 1) - 1, 1))}
                              >
                                <CaretLeft size={18} style={{ cursor: "pointer" }} />
                              </button>
                            }
                            addonAfter={
                              <button
                                className="percentageControl increment"
                                onClick={() => field.onChange((field.value || 1) + 1)}
                              >
                                <CaretRight size={18} style={{ cursor: "pointer" }} />
                              </button>
                            }
                          />
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
                );
              })}

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
