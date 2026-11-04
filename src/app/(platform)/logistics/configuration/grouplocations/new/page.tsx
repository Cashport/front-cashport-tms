"use client";

import { CreateGroupLocationView } from "@/components/organisms/logistics/configuration/grouplocations/createGrouplocation/createGrouplocation";

function GroupLocationInfoPage() {
  return <CreateGroupLocationView params={{
    id: "",
    groupLocationId: ""
  }} />;
}

export default GroupLocationInfoPage;
