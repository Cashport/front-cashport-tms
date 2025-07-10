import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray } from "react-hook-form";
import { Flex, Button, Input, Select } from "antd";
import { Info, Plus, Trash } from "@phosphor-icons/react";
import { IFormCreateOrder } from "../../../CreateOrderVieww";

import { getPsl } from "@/services/logistics/psl";
import { IGetPSL } from "@/types/logistics/schema";
import "./productServiceLineSection.scss";

interface ProductServiceLineSectionProps {
  control: Control<IFormCreateOrder, any>;
}

const ProductServiceLineSection: React.FC<ProductServiceLineSectionProps> = ({ control }) => {
  const [PSLOptions, setPSLOptions] = useState<IGetPSL[]>();

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
  const { fields, append } = useFieldArray({
    control,
    name: "productServiceLine.productServiceLine"
  });

  return (
    <Flex vertical gap={"2rem"} className="productServiceLineSection">
      <div className="productServiceLineSection__container">
        <div className="PSLGeneral">
          <div className="titleAndSelect">
            <Flex justify="space-between" align="center">
              <p>Product Service Line (PSL)</p>

              <Info size={20} />
            </Flex>
            <Select
              placeholder="Seleccionar PSL"
              className="inputField"
              options={PSLOptions?.map((option) => ({
                value: option.id,
                label: option.description
              }))}
            />
          </div>

          <div className="titleAndSelect">
            <p>Porcentaje PSL</p>
            <span className="percentage">100%</span>
          </div>
        </div>

        <div className="PSLCostCenterList">
          <div className="PSLCostCenter">
            <div className="titleAndSelect">
              <Flex justify="space-between" align="center">
                <p>Centro de costos</p>

                <Info size={20} />
              </Flex>
              <Select placeholder="Selecciona centro de costos" className="inputField" />
            </div>

            <div className="titleAndSelect">
              <p>Porcentaje CC</p>
              <Select className="inputField" />
            </div>

            <Button className="removeButton" type="link" danger icon={<Trash size={24} />} />
          </div>

          <Button className="addButton" onClick={() => console.log("Agregar centro de costos")}>
            Agregar
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <Button className="addButton" onClick={() => console.log("Agregar Product Service Line")}>
        Agregar PSL
        <Plus size={16} />
      </Button>
    </Flex>
  );
};

export default ProductServiceLineSection;
