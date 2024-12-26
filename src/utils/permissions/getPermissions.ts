import { IUserPermissions } from "@/types/userPermissions/IUserPermissions";

export async function getPermissions(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/role/permissions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 200) {
      const data = (await response.json()) as IUserPermissions;
      return data.data;
  }
}
