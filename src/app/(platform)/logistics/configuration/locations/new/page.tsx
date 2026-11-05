"use client";

import { CreateLocationView } from "@/components/organisms/logistics/configuration/locations/createLocation/createLocation";

function LocationInfoPage() {
  return <CreateLocationView params={{
    id: "",
    locationId: ""
  }} />;
}

export default LocationInfoPage;
