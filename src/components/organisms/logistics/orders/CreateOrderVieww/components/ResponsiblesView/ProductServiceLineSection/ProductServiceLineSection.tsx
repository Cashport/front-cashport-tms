import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray, UseFormSetValue, useWatch } from "react-hook-form";
import { Flex, Button, Select, InputNumber } from "antd";
import { CaretLeft, CaretRight, Info, Plus, Trash, X } from "@phosphor-icons/react";

import { getPsl } from "@/services/logistics/psl";

import { IGetPSL } from "@/types/logistics/schema";
import { ICostCenterForm, IFormCreateOrder, IPSLGeneral } from "../../../CreateOrderVieww";

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

  // Función para redistribuir porcentajes de PSL
  const redistributePSLPercentages = (
    updatedIndex: number,
    newValue: number,
    currentPSLs: IPSLGeneral[]
  ) => {
    const otherPSLs = currentPSLs.filter((_, idx) => idx !== updatedIndex);
    const currentTotal = otherPSLs.reduce((sum, psl) => sum + (psl.percentagePSL || 0), 0);
    const newTotal = currentTotal + newValue;

    // Si la suma no supera 100%, no hacer cambios
    if (newTotal <= 100) {
      setValue(`productServiceLine.productServiceLine.${updatedIndex}.percentagePSL`, newValue);
      return;
    }

    // Si supera 100%, necesitamos redistribuir
    const availableToReduce = 100 - newValue; // Lo que pueden sumar los demás

    // Actualizar el PSL actual
    setValue(`productServiceLine.productServiceLine.${updatedIndex}.percentagePSL`, newValue);

    // Redistribuir proporcionalmente entre los demás PSLs
    otherPSLs.forEach((psl, idx) => {
      const actualIndex = idx < updatedIndex ? idx : idx + 1;
      const currentPercentage = psl.percentagePSL || 0;

      if (currentTotal > 0) {
        // Calcular nuevo porcentaje proporcional
        const proportion = currentPercentage / currentTotal;
        const newPercentage = Math.floor(availableToReduce * proportion);
        setValue(
          `productServiceLine.productServiceLine.${actualIndex}.percentagePSL`,
          newPercentage
        );

        // También necesitamos ajustar los centros de costo de este PSL
        redistributeCostCenterPercentages(actualIndex, newPercentage, psl.costCenters || []);
      } else {
        // Si todos tenían 0, distribuir equitativamente
        const equalPercentage = Math.floor(availableToReduce / otherPSLs.length);
        setValue(
          `productServiceLine.productServiceLine.${actualIndex}.percentagePSL`,
          equalPercentage
        );

        // Ajustar centros de costo
        redistributeCostCenterPercentages(actualIndex, equalPercentage, psl.costCenters || []);
      }
    });
  };

  // Función para redistribuir porcentajes de centros de costo
  const redistributeCostCenterPercentages = (
    pslIndex: number,
    maxPercentage: number,
    costCenters: ICostCenterForm[]
  ) => {
    const totalCCs = costCenters.length;
    if (totalCCs === 0) return;

    const currentTotal = costCenters.reduce((sum, cc) => sum + (cc.percentage || 0), 0);

    // Si no supera el límite, no hacer cambios
    if (currentTotal <= maxPercentage) return;

    // Redistribuir proporcionalmente
    costCenters.forEach((cc, ccIndex) => {
      const currentPercentage = cc.percentage || 0;

      if (currentTotal > 0) {
        const proportion = currentPercentage / currentTotal;
        const newPercentage = Math.floor(maxPercentage * proportion);
        setValue(
          `productServiceLine.productServiceLine.${pslIndex}.costCenters.${ccIndex}.percentage`,
          newPercentage
        );
      } else {
        // Si todos tenían 0, distribuir equitativamente
        const equalPercentage = Math.floor(maxPercentage / totalCCs);
        setValue(
          `productServiceLine.productServiceLine.${pslIndex}.costCenters.${ccIndex}.percentage`,
          equalPercentage
        );
      }
    });
  };

  // Función para manejar cambios en el porcentaje de centro de costo
  const handleCostCenterPercentageChange = (
    pslIndex: number,
    ccIndex: number,
    newValue: number,
    maxPSLPercentage: number
  ) => {
    const costCenters = watchedPSL[pslIndex]?.costCenters || [];
    const otherCCs = costCenters.filter((_, idx) => idx !== ccIndex);
    const currentTotal = otherCCs.reduce((sum, cc) => sum + (cc.percentage || 0), 0);
    const newTotal = currentTotal + newValue;

    // Si no supera el límite del PSL, solo actualizar el valor
    if (newTotal <= maxPSLPercentage) {
      setValue(
        `productServiceLine.productServiceLine.${pslIndex}.costCenters.${ccIndex}.percentage`,
        newValue
      );
      return;
    }

    // Si supera, redistribuir
    const availableForOthers = maxPSLPercentage - newValue;

    // Actualizar el CC actual
    setValue(
      `productServiceLine.productServiceLine.${pslIndex}.costCenters.${ccIndex}.percentage`,
      newValue
    );

    // Redistribuir entre los demás CCs
    otherCCs.forEach((cc, idx) => {
      const actualIndex = idx < ccIndex ? idx : idx + 1;
      const currentPercentage = cc.percentage || 0;

      if (currentTotal > 0) {
        const proportion = currentPercentage / currentTotal;
        const newPercentage = Math.floor(availableForOthers * proportion);
        setValue(
          `productServiceLine.productServiceLine.${pslIndex}.costCenters.${actualIndex}.percentage`,
          newPercentage
        );
      } else {
        const equalPercentage = Math.floor(availableForOthers / otherCCs.length);
        setValue(
          `productServiceLine.productServiceLine.${pslIndex}.costCenters.${actualIndex}.percentage`,
          equalPercentage
        );
      }
    });
  };

  // Cuando se elimina un PSL, redistribuir los porcentajes restantes proporcionalmente
  const handleRemovePSL = (indexToRemove: number) => {
    const pslToRemove = watchedPSL[indexToRemove];
    const percentageToRedistribute = pslToRemove?.percentagePSL || 0;

    removePSL(indexToRemove);

    // Solo redistribuir si había un porcentaje asignado
    if (percentageToRedistribute > 0) {
      setTimeout(() => {
        const remainingPSLs = watchedPSL.filter((_, idx) => idx !== indexToRemove);
        const currentTotal = remainingPSLs.reduce((sum, psl) => sum + (psl.percentagePSL || 0), 0);

        remainingPSLs.forEach((psl, idx) => {
          const actualIndex = idx < indexToRemove ? idx : idx - 1;
          const currentPercentage = psl.percentagePSL || 0;

          if (currentTotal > 0) {
            const proportion = currentPercentage / currentTotal;
            const additionalPercentage = Math.floor(percentageToRedistribute * proportion);
            const newPercentage = currentPercentage + additionalPercentage;
            setValue(
              `productServiceLine.productServiceLine.${actualIndex}.percentagePSL`,
              newPercentage
            );
          }
        });
      }, 0);
    }
  };

  return (
    <Flex vertical gap={"2rem"} className="productServiceLineSection">
      {pslFields.map((pslField, pslIndex) => {
        const costCenters = watchedPSL?.[pslIndex]?.costCenters || [];
        const pslPercentage = watchedPSL?.[pslIndex]?.percentagePSL || 0;

        return (
          <div key={pslField.id} className="productServiceLineSection__container">
            {/* Remove PSL Button */}
            {pslIndex > 0 && (
              <button className="removePSLButton" onClick={() => handleRemovePSL(pslIndex)}>
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
                      showSearch
                      filterOption={(input, option) =>
                        option ? option.label.toLowerCase().includes(input.toLowerCase()) : false
                      }
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
                      onChange={(value) => {
                        const newValue = value || 0;
                        redistributePSLPercentages(pslIndex, newValue, watchedPSL);
                      }}
                      addonBefore={
                        <button
                          className="percentageControl decrement"
                          onClick={() => {
                            const newValue = Math.max((field.value || 1) - 1, 0);
                            redistributePSLPercentages(pslIndex, newValue, watchedPSL);
                          }}
                        >
                          <CaretLeft size={18} style={{ cursor: "pointer" }} />
                        </button>
                      }
                      addonAfter={
                        <button
                          className="percentageControl increment"
                          onClick={() => {
                            const newValue = Math.min((field.value || 0) + 1, 100);
                            redistributePSLPercentages(pslIndex, newValue, watchedPSL);
                          }}
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
              {costCenters.map((_, ccIndex: number) => {
                const selectedPSL = watchedPSL?.[pslIndex]?.selectedPSL;
                const costCenterDependingOnPSL = selectedPSL?.cost_center;

                return (
                  <div className="PSLCostCenter" key={ccIndex}>
                    <div className="titleAndSelect">
                      <Flex justify="space-between" align="center">
                        <p>Centro de costos</p>
                        <Info size={20} />
                      </Flex>
                      <Controller
                        control={control}
                        name={`productServiceLine.productServiceLine.${pslIndex}.costCenters.${ccIndex}.selectedCostCenter`}
                        render={({ field }) => (
                          <Select
                            {...field}
                            labelInValue
                            placeholder="Selecciona centro de costos"
                            className="inputField"
                            options={
                              costCenterDependingOnPSL?.map((cc) => ({
                                value: cc.id,
                                label: cc.description
                              })) ?? []
                            }
                            showSearch
                            filterOption={(input, option) =>
                              option
                                ? option.label.toLowerCase().includes(input.toLowerCase())
                                : false
                            }
                            value={
                              field.value
                                ? {
                                    value: field.value.id,
                                    label: field.value.description
                                  }
                                : undefined
                            }
                            onChange={(option) => {
                              const selected = costCenterDependingOnPSL?.find(
                                (cc) => cc.id === option.value
                              );
                              field.onChange(selected ?? null);
                            }}
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
                            max={pslPercentage}
                            min={0}
                            formatter={(value) => `${value}%`}
                            defaultValue={0}
                            onChange={(value) => {
                              const newValue = value || 0;
                              handleCostCenterPercentageChange(
                                pslIndex,
                                ccIndex,
                                newValue,
                                pslPercentage
                              );
                            }}
                            addonBefore={
                              <button
                                className="percentageControl decrement"
                                onClick={() => {
                                  const newValue = Math.max((field.value || 1) - 1, 0);
                                  handleCostCenterPercentageChange(
                                    pslIndex,
                                    ccIndex,
                                    newValue,
                                    pslPercentage
                                  );
                                }}
                              >
                                <CaretLeft size={18} style={{ cursor: "pointer" }} />
                              </button>
                            }
                            addonAfter={
                              <button
                                className="percentageControl increment"
                                onClick={() => {
                                  const newValue = Math.min((field.value || 0) + 1, pslPercentage);
                                  handleCostCenterPercentageChange(
                                    pslIndex,
                                    ccIndex,
                                    newValue,
                                    pslPercentage
                                  );
                                }}
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
                          const ccToRemove = costCenters[ccIndex];
                          const percentageToRedistribute = ccToRemove?.percentage || 0;

                          const updated = [...costCenters];
                          updated.splice(ccIndex, 1);
                          setValue(
                            `productServiceLine.productServiceLine.${pslIndex}.costCenters`,
                            updated
                          );

                          // Redistribuir el porcentaje del CC eliminado
                          if (percentageToRedistribute > 0 && updated.length > 0) {
                            const currentTotal = updated.reduce(
                              (sum, cc) => sum + (cc.percentage || 0),
                              0
                            );

                            updated.forEach((cc, idx) => {
                              const currentPercentage = cc.percentage || 0;
                              if (currentTotal > 0) {
                                const proportion = currentPercentage / currentTotal;
                                const additionalPercentage = Math.floor(
                                  percentageToRedistribute * proportion
                                );
                                const newPercentage = Math.min(
                                  currentPercentage + additionalPercentage,
                                  pslPercentage
                                );
                                setValue(
                                  `productServiceLine.productServiceLine.${pslIndex}.costCenters.${idx}.percentage`,
                                  newPercentage
                                );
                              }
                            });
                          }
                        }}
                      />
                    )}
                  </div>
                );
              })}

              <Button
                className="addButton"
                onClick={() => {
                  const updated = [
                    ...costCenters,
                    { selectedCostCenter: undefined, percentage: 0 }
                  ];
                  setValue(
                    `productServiceLine.productServiceLine.${pslIndex}.costCenters`,
                    updated
                  );

                  // Si hay un límite de PSL y los CCs actuales ya lo ocupan todo, redistribuir
                  const currentTotal = costCenters.reduce(
                    (sum, cc) => sum + (cc.percentage || 0),
                    0
                  );
                  if (currentTotal >= pslPercentage && pslPercentage > 0) {
                    // Distribuir equitativamente el porcentaje del PSL entre todos los CCs
                    const equalPercentage = Math.floor(pslPercentage / updated.length);
                    updated.forEach((_, idx) => {
                      setValue(
                        `productServiceLine.productServiceLine.${pslIndex}.costCenters.${idx}.percentage`,
                        equalPercentage
                      );
                    });
                  }
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
        onClick={() =>
          appendPSL({
            selectedPSL: undefined,
            percentagePSL: 0,
            costCenters: [{ selectedCostCenter: undefined, percentage: 0 }]
          })
        }
      >
        Agregar PSL
        <Plus size={16} />
      </Button>
    </Flex>
  );
};

export default ProductServiceLineSection;
