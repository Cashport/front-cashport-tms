import React from "react";
import { Control, Controller, useFieldArray, UseFormSetValue, useWatch } from "react-hook-form";
import { Flex, Select } from "antd";
import { Checkbox, DatePicker, InputNumber, TimePicker } from "antd";
import { DotOutline, Trash } from "@phosphor-icons/react";

import { IFormCreateOrder } from "../../../CreateOrderVieww";
import { ISelectOption } from "../SchedulingView";

import "./selectLocationAndTime.scss";

interface SelectLocationAndTimeProps {
  selectedType: string;
  control: Control<IFormCreateOrder, any>;
  setValue: UseFormSetValue<IFormCreateOrder>;
  locationOptions?: ISelectOption[];
  // eslint-disable-next-line no-unused-vars
  onChangeOrigin: (value: number) => void;
  // eslint-disable-next-line no-unused-vars
  onChangeDestination: (value: number) => void;
}

const SelectLocationAndTime: React.FC<SelectLocationAndTimeProps> = ({
  selectedType,
  control,
  setValue,
  locationOptions,
  onChangeOrigin,
  onChangeDestination
}) => {
  const { fields, remove, insert } = useFieldArray({
    control,
    name: "TripDetails"
  });

  const tripDetails = useWatch({
    control,
    name: "TripDetails"
  });

  const showRaising = selectedType === "1";

  const destinationAvailable = selectedType == "4";

  // Lógica: agrega una parada justo antes del último (Destino)
  const handleAddStop = () => {
    insert(fields.length - 1, {
      placeId: undefined,
      date: undefined,
      time: undefined,
      requiresRaising: false,
      raisingNum: 0
    });
  };

  const handleRemoveStop = (index: number) => {
    // Sólo puedes borrar si no es origen (0) ni destino (last)
    if (index > 0 && index < fields.length - 1) {
      remove(index);
    }
  };

  return (
    <div className="selectLocationAndTime">
      {fields.map((field, i) => (
        <React.Fragment key={field.id}>
          <div className="stepItem">
            <div className="stepCircleContainer">
              <div
                className={`stepLine ${i === 0 ? "first" : ""} ${
                  i === fields.length - 1 ? "last" : ""
                }`}
              />
              <DotOutline
                className={`stepCircle`}
                size={30}
                weight={i === fields.length - 1 ? "fill" : "regular"}
              />
            </div>

            <div className="stepLabel">
              <Flex gap="0.5rem" align="center" style={{ width: "100%" }}>
                <div className="timeAndLocationCard">
                  {/* Place/Location select */}
                  <Controller
                    control={control}
                    name={`TripDetails.${i}.placeId`}
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="selectPlace"
                        showSearch
                        placeholder={LABELS(i, fields.length)}
                        options={locationOptions}
                        style={{
                          gridColumn: showRaising ? "1 / 8" : "1 / -1"
                        }}
                        value={
                          field.value && tripDetails[i]
                            ? {
                                value: field.value,
                                label: tripDetails[i].placeName || "Seleccionar ubicación"
                              }
                            : undefined
                        }
                        filterOption={(input: string, option?: any) => {
                          return (
                            option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
                          );
                        }}
                        onChange={(
                          value: {
                            value: number;
                            label: string;
                          } | null
                        ) => {
                          setValue(`TripDetails.${i}.placeId`, value?.value);
                          setValue(`TripDetails.${i}.placeName`, value?.label);

                          if (i === 0) {
                            onChangeOrigin(value?.value || 0);
                          }

                          if (i === fields.length - 1) {
                            onChangeDestination(value?.value || 0);
                          }
                        }}
                        labelInValue
                      />
                    )}
                  />

                  {/* Raising checkbox/hours */}
                  {showRaising && (
                    <>
                      <Controller
                        control={control}
                        name={`TripDetails.${i}.requiresRaising`}
                        render={({ field }) => (
                          <Checkbox {...field} checked={!!field.value} className="check">
                            {"Requiere izaje"}
                          </Checkbox>
                        )}
                      />
                      <Controller
                        control={control}
                        name={`TripDetails.${i}.raisingNum`}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            className="inputNumber"
                            placeholder="0 Hrs"
                            min={0}
                            style={{ gridColumn: "11 / -1" }}
                            formatter={(value) => `${value} Hrs`}
                          />
                        )}
                      />
                    </>
                  )}

                  {/* Date */}
                  <Controller
                    control={control}
                    name={`TripDetails.${i}.date`}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        placeholder="aaaa-mm-dd"
                        className="inputDate"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={i > 0 && !destinationAvailable}
                      />
                    )}
                  />

                  {/* Time */}
                  <Controller
                    control={control}
                    name={`TripDetails.${i}.time`}
                    render={({ field }) => (
                      <TimePicker
                        {...field}
                        className="inputTime"
                        placeholder="00:00"
                        format={"HH:mm"}
                        minuteStep={15}
                        hourStep={1}
                        needConfirm={false}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={i > 0 && !destinationAvailable}
                      />
                    )}
                  />
                </div>

                {/* Borrar parada (solo si es una parada, no origen/destino) */}
                {i > 0 && i < fields.length - 1 && (
                  <Trash
                    onClick={() => handleRemoveStop(i)}
                    size={24}
                    style={{ cursor: "pointer" }}
                  />
                )}
              </Flex>
            </div>
          </div>
          <div className={`divider ${i === fields.length - 1 ? "noShow" : ""}`} />
        </React.Fragment>
      ))}

      {/* Botón para agregar una parada */}
      {/* <button
        onClick={handleAddStop}
        className="addStopButton"
        type="button"
        style={{ marginTop: 14 }}
      >
        Agregar parada <Plus size="1rem" />
      </button> */}
    </div>
  );
};

export default SelectLocationAndTime;

const LABELS = (i: number, n: number) =>
  i === 0 ? "Origen" : i === n - 1 ? "Destino" : `Parada ${i}`;
