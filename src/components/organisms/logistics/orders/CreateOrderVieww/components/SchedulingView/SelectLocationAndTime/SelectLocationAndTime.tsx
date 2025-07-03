import React, { useEffect, useState } from "react";
import { Select } from "antd";

import { getAllLocations } from "@/services/logistics/locations";

import "./selectLocationAndTime.scss";
import { DotOutline } from "@phosphor-icons/react";

interface ISelectOption {
  label: string;
  value: number;
}

interface SelectLocationAndTimeProps {}

const SelectLocationAndTime: React.FC<SelectLocationAndTimeProps> = () => {
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

  const mockSteps = [
    {
      content: (
        <div className="timeAndLocationCard">
          <Select
            showSearch
            placeholder="Origen"
            style={{ width: "100%" }}
            filterOption={(input: string, option?: { label: string; value: number }) => {
              return option?.label.toLowerCase().includes(input.toLowerCase()) ?? false;
            }}
            options={locationOptions}
          />
        </div>
      ),
      key: "select-location"
    },
    {
      content: (
        <div className="timeAndLocationCard">
          <Select
            showSearch
            placeholder="Origen"
            style={{ width: "100%" }}
            filterOption={(input: string, option?: { label: string; value: number }) => {
              return option?.label.toLowerCase().includes(input.toLowerCase()) ?? false;
            }}
            options={locationOptions}
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
