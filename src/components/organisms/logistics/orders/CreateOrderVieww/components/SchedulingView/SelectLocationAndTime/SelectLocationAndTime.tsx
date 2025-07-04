import React, { useEffect, useState } from "react";
import { Control, Controller, useFieldArray } from "react-hook-form";
import { Flex, Select } from "antd";
import { Checkbox, DatePicker, InputNumber, TimePicker } from "antd";
import { DotOutline, Plus, Trash } from "@phosphor-icons/react";

import { getAllLocations } from "@/services/logistics/locations";

import { IFormCreateOrder } from "../../../CreateOrderVieww";

import "./selectLocationAndTime.scss";

interface ISelectOption {
  label: string;
  value: number;
}

interface SelectLocationAndTimeProps {
  selectedType: string;
  control: Control<IFormCreateOrder, any>;
}

const SelectLocationAndTime: React.FC<SelectLocationAndTimeProps> = ({ selectedType, control }) => {
  const [locationOptions, setLocationOptions] = useState<ISelectOption[]>([]);

  const { fields, remove, insert } = useFieldArray({
    control,
    name: "TripDetails"
  });

  useEffect(() => {
    const loadLocations = async () => {
      if (locationOptions.length) return;
      const result = await getAllLocations();
      if (result?.data?.length) {
        const locationOptions = result.data.map((item) => ({
          label: item.description,
          value: item.id
        }));
        setLocationOptions(locationOptions);
      }
    };
    loadLocations();
  }, []);

  const showRaising = selectedType === "1";

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
              <Flex gap="0.5rem" align="center">
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
                        filterOption={(input: string, option?: any) => {
                          return (
                            option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
                          );
                        }}
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
                            placeholder="0"
                            min={0}
                            style={{ gridColumn: "11 / -1" }}
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
                        value={field.value}
                        onChange={field.onChange}
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

      <button
        onClick={handleAddStop}
        className="addStopButton"
        type="button"
        style={{ marginTop: 14 }}
      >
        Agregar parada <Plus size="1rem" />
      </button>
    </div>
  );
};

export default SelectLocationAndTime;

const LABELS = (i: number, n: number) =>
  i === 0 ? "Origen" : i === n - 1 ? "Destino" : `Parada ${i}`;
