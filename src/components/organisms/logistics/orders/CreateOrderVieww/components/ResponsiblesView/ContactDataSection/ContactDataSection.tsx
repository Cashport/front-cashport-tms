import React from "react";
import { Control, Controller, useFieldArray } from "react-hook-form";
import { Flex, Input } from "antd";
import { Trash, UserPlus } from "@phosphor-icons/react";

import { Stepper } from "@/components/ui/Stepper/Stepper";
import { IFormCreateOrder } from "../../../CreateOrderVieww";
import "./contactDataSection.scss";

interface AdditionalInfoSectionProps {
  control: Control<IFormCreateOrder, any>;
}

const ContactDataSection: React.FC<AdditionalInfoSectionProps> = ({ control }) => {
  const { fields, append } = useFieldArray({
    control,
    name: "additionalInfo.contacts"
  });

  return (
    <Flex vertical gap={"1.5rem"} className="contactDataSection">
      <h3 className="subTitle">Datos de contacto</h3>

      <Flex vertical className="contactDataSection__locations" gap={"1rem"}>
        <p>Ubicación</p>

        <Flex vertical style={{ paddingLeft: "1rem" }}>
          {fields.map((field, index) => (
            <Stepper
              key={field.id}
              isFirst={index === 0}
              isLast={index === fields.length - 1}
              isFilled={index === fields.length - 1}
              stepCircleBackgroundColor="#f7f7f7"
            >
              <>
                <div className="contactDataSection__locationContacts">
                  <p>{field.contact_name}aa</p>

                  <div className="contactDataSection__locationContacts__row">
                    <Controller
                      control={control}
                      name={`additionalInfo.contacts.${index}.contactDestinationName`}
                      render={({ field }) => (
                        <Input {...field} placeholder="Nombre contacto " className="inputField" />
                      )}
                    />

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

                    {index === 0 && <UserPlus size={24} />}
                    {index === fields.length - 1 && <Trash size={24} />}
                  </div>
                </div>

                {/* <hr /> */}
              </>
            </Stepper>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ContactDataSection;
