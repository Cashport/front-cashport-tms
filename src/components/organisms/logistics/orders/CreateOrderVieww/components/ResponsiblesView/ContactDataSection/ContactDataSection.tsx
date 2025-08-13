import React from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Flex, Input } from "antd";
import { Trash, UserPlus } from "@phosphor-icons/react";

import { Stepper } from "@/components/ui/Stepper/Stepper";
import { IFormCreateOrder } from "../../../CreateOrderVieww";
import "./contactDataSection.scss";

interface AdditionalInfoSectionProps {
  control: Control<IFormCreateOrder, any>;
}

const ContactDataSection: React.FC<AdditionalInfoSectionProps> = ({ control }) => {
  const selectedLocations = useWatch({
    control,
    name: "TripDetails"
  });

  const { fields, update, replace } = useFieldArray({
    control,
    name: "additionalInfo.contactsPerLocation"
  });

  // Función para agregar un contacto a una ubicación específica
  const addContactToLocation = (locationIndex: number) => {
    const currentLocation = fields[locationIndex];
    const updatedContacts = [
      ...currentLocation.contacts,
      {
        contact_phone: "",
        contact_name: ""
      }
    ];

    update(locationIndex, {
      ...currentLocation,
      contacts: updatedContacts
    });
  };

  // Función para remover un contacto de una ubicación específica
  const removeContactFromLocation = (locationIndex: number, contactIndex: number) => {
    const currentLocation = fields[locationIndex];
    const updatedContacts = currentLocation.contacts.filter((_, index) => index !== contactIndex);

    update(locationIndex, {
      ...currentLocation,
      contacts: updatedContacts
    });
  };

  // Sincronizar contactsPerLocation con selectedLocations
  React.useEffect(() => {
    if (selectedLocations && selectedLocations.length > 0) {
      // Filtrar solo ubicaciones que tengan placeId y placeName
      const validLocations = selectedLocations.filter(
        (location) => location.placeId && location.placeName
      );

      // Crear estructura de contactos basada en ubicaciones válidas
      const contactsStructure = validLocations.map((location) => {
        // Buscar si ya existe un contacto para esta ubicación
        const existingContact = fields.find((field) => field.location_id === location.placeId);

        return {
          location_id: location.placeId,
          locationName: location.placeName,
          contacts: existingContact?.contacts || [
            {
              contact_phone: undefined,
              contact_name: undefined
            }
          ]
        };
      });

      // Solo actualizar si la estructura cambió
      const hasChanged =
        contactsStructure.length !== fields.length ||
        contactsStructure.some(
          (contact, index) =>
            !fields[index] ||
            fields[index].location_id !== contact.location_id ||
            fields[index].locationName !== contact.locationName
        );

      if (hasChanged) {
        console.log("useEffect replace contactsStructure", contactsStructure);
        replace(contactsStructure);
      }
    }
  }, [selectedLocations, fields, replace]);

  return (
    <Flex vertical gap={"1.5rem"} className="contactDataSection">
      <h3 className="subTitle">Datos de contacto</h3>

      <Flex vertical className="contactDataSection__locations" gap={"1rem"}>
        <p>Ubicación</p>

        <Flex vertical style={{ paddingLeft: "1rem" }}>
          {fields.map((locationField, locationIndex) => (
            <Stepper
              key={locationField.id}
              isFirst={locationIndex === 0}
              isLast={locationIndex === fields.length - 1}
              isFilled={locationIndex === fields.length - 1}
              stepCircleBackgroundColor="#f7f7f7"
              circlePosition="top"
            >
              <div className="contactDataSection__locationContacts">
                <p>{locationField.locationName || `Ubicación ${locationIndex + 1}`}</p>

                <Flex vertical gap={"1rem"}>
                  {/* Aquí iteramos por cada contacto de esta ubicación */}
                  {locationField.contacts.map((contact, contactIndex) => (
                    <div key={contactIndex} className="contactDataSection__locationContacts__row">
                      <Controller
                        control={control}
                        name={`additionalInfo.contactsPerLocation.${locationIndex}.contacts.${contactIndex}.contact_name`}
                        render={({ field }) => (
                          <Input {...field} placeholder="Nombre contacto" className="inputField" />
                        )}
                      />

                      <Controller
                        control={control}
                        name={`additionalInfo.contactsPerLocation.${locationIndex}.contacts.${contactIndex}.contact_phone`}
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

                      {/* UserPlus solo en el primer contacto de cada location */}
                      {contactIndex === 0 && (
                        <UserPlus
                          size={24}
                          style={{ cursor: "pointer" }}
                          onClick={() => addContactToLocation(locationIndex)}
                        />
                      )}

                      {/* Trash solo en contactos adicionales (no el primero) */}
                      {contactIndex > 0 && (
                        <Trash
                          size={24}
                          style={{ cursor: "pointer" }}
                          onClick={() => removeContactFromLocation(locationIndex, contactIndex)}
                        />
                      )}
                    </div>
                  ))}
                </Flex>
              </div>
            </Stepper>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ContactDataSection;
