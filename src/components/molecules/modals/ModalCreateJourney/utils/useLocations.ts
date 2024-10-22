// useLocations.ts
import { useState, useEffect } from "react";
import { getAllLocations } from "@/services/logistics/locations";
import { ILocation } from "@/types/logistics/schema";

export const useLocations = () => {
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);

  useEffect(() => {
    const loadLocations = async () => {
      const result = await getAllLocations();
      if (result.data.data.length > 0) {
        const listlocations: any[] = [];
        const listlocationoptions: { label: any; value: any }[] = [];

        result.data.data.forEach((item) => {
          listlocations.push(item);
          listlocationoptions.push({ label: item.description, value: item.id });
        });

        setLocations(listlocations);
        setLocationOptions(listlocationoptions);
      }
    };

    if (locations.length === 0) loadLocations();
  }, [locations]);

  return { locations, locationOptions };
};
