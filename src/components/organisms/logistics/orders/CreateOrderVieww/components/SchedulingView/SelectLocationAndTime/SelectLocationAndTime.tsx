import React, { useEffect, useState } from "react";
import { Select } from "antd";
import { Checkbox, DatePicker, InputNumber, TimePicker } from "antd";
import { DotOutline } from "@phosphor-icons/react";

import { getAllLocations } from "@/services/logistics/locations";

import "./selectLocationAndTime.scss";

interface ISelectOption {
  label: string;
  value: number;
}

interface SelectLocationAndTimeProps {
  selectedType: string;
}

const SelectLocationAndTime: React.FC<SelectLocationAndTimeProps> = ({ selectedType }) => {
  const [locationOptions, setLocationOptions] = useState<ISelectOption[]>([]);

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

  const mockSteps = [
    {
      content: (
        <div className="timeAndLocationCard">
          <Select
            showSearch
            placeholder="Origen"
            style={{ gridColumn: showRaising ? "1 / 8" : "1 / -1" }}
            filterOption={(input: string, option?: { label: string; value: number }) => {
              return option?.label.toLowerCase().includes(input.toLowerCase()) ?? false;
            }}
            options={locationOptions}
          />

          {showRaising && (
            <>
              <Checkbox className="check">{"Requiere izaje"}</Checkbox>

              <InputNumber
                className="inputNumber"
                style={{ gridColumn: "11 / -1" }}
                placeholder="0"
                min={0}
              />
            </>
          )}

          <DatePicker placeholder="aaaa-mm-dd" className="inputDate" />

          <TimePicker
            className="inputTime"
            placeholder="00:00"
            format={"HH:mm"}
            minuteStep={15}
            hourStep={1}
            needConfirm={false}
            type={"time"}
          />
        </div>
      ),
      key: "select-location"
    },
    {
      content: (
        <div className="timeAndLocationCard">
          <Select
            className="selectPlace"
            showSearch
            placeholder="Destino"
            style={{ width: "100%", gridColumn: showRaising ? "1 / 8" : "1 / -1" }}
            filterOption={(input: string, option?: { label: string; value: number }) => {
              return option?.label.toLowerCase().includes(input.toLowerCase()) ?? false;
            }}
            options={locationOptions}
          />

          {showRaising && (
            <>
              <Checkbox className="check">{"Requiere izaje"}</Checkbox>

              <InputNumber
                className="inputNumber"
                style={{ gridColumn: "11 / -1" }}
                placeholder="0"
                min={0}
              />
            </>
          )}

          <DatePicker placeholder="aaaa-mm-dd" className="inputDate" />

          <TimePicker
            className="inputTime"
            placeholder="00:00"
            format={"HH:mm"}
            minuteStep={15}
            hourStep={1}
            needConfirm={false}
            type={"time"}
          />
        </div>
      ),
      key: "select-time"
    }
  ];

  return (
    <div className="selectLocationAndTime">
      {mockSteps?.map((step, index) => (
        <>
          <div key={step.key} className="stepItem">
            <div className="stepCircleContainer">
              <div
                className={`stepLine ${index === 0 && "first"} ${index === mockSteps.length - 1 && "last"}`}
              />
              <DotOutline
                className={`stepCircle `}
                size={30}
                weight={index === 0 ? "regular" : "fill"}
              />
            </div>

            <div className="stepLabel">{step.content}</div>
          </div>
          <div className={`divider ${index === mockSteps.length - 1 ? "noShow" : ""}`} />
        </>
      ))}
    </div>
  );
};

export default SelectLocationAndTime;
