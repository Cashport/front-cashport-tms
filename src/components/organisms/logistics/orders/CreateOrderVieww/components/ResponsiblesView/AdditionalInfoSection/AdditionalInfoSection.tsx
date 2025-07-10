import React from "react";
import { Control, Controller, useFieldArray } from "react-hook-form";
import { Flex, Button, Input } from "antd";
import { UserPlus } from "@phosphor-icons/react";
import { IFormCreateOrder } from "../../../CreateOrderVieww";

import "./additionalInfoSection.scss";

interface AdditionalInfoSectionProps {
  control: Control<IFormCreateOrder, any>;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ control }) => {
  const { fields, append } = useFieldArray({
    control,
    name: "additionalInfo.contacts"
  });

  return (
    <Flex vertical gap={"1.5rem"} className="additionalInfoSection">
      <h3 className="subTitle">Información adicional</h3>

      {fields.map((field, index) => (
        <div key={field.id} className="additionalInfoSection__row">
          <div className="contactInfo">
            <Flex vertical style={{ width: "100%" }} gap={"0.25rem"}>
              <p>Contacto punto origen</p>
              <Controller
                control={control}
                name={`additionalInfo.contacts.${index}.contactOriginName`}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nombre del contacto origen"
                    className="inputField"
                  />
                )}
              />
            </Flex>

            <Controller
              control={control}
              name={`additionalInfo.contacts.${index}.originPhone`}
              render={({ field }) => (
                <Input
                  {...field}
                  className="inputField"
                  placeholder="000 000 0000"
                  maxLength={10}
                  count={{ show: true, max: 10 }}
                />
              )}
            />
          </div>

          <div className="contactInfo">
            <Flex vertical style={{ width: "100%" }} gap={"0.25rem"}>
              <p>Contacto punto destino</p>
              <Controller
                control={control}
                name={`additionalInfo.contacts.${index}.contactDestinationName`}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nombre del contacto destino"
                    className="inputField"
                  />
                )}
              />
            </Flex>
            <Controller
              control={control}
              name={`additionalInfo.contacts.${index}.destinationPhone`}
              render={({ field }) => (
                <Input
                  {...field}
                  className="inputField"
                  placeholder="000 000 0000"
                  maxLength={10}
                  count={{ show: true, max: 10 }}
                />
              )}
            />
          </div>
        </div>
      ))}

      <Button
        className="addButton"
        onClick={() =>
          append({
            contactOriginName: "",
            originPhone: "",
            contactDestinationName: "",
            destinationPhone: ""
          })
        }
      >
        Agregar Contacto
        <UserPlus size={24} />
      </Button>

      <div className="additionalInfoSection__specialInstructions">
        <p>Instrucciones especiales</p>
        <Controller
          control={control}
          name="additionalInfo.instructions"
          render={({ field }) => (
            <textarea
              {...field}
              placeholder="Escribe las instrucciones"
              className="textareaInstructions"
            />
          )}
        />
      </div>
    </Flex>
  );
};

export default AdditionalInfoSection;
