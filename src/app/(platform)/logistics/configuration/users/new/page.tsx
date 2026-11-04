"use client";

import { CreateUserView } from "@/components/organisms/logistics/configuration/users/createUser/createUser";

function UserInfoPage() {
  return <CreateUserView params={{
    id: "",
    userId: ""
  }} />;
}

export default UserInfoPage;
