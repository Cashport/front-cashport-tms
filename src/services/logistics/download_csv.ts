import config from "@/config";
import { getIdToken, getProjectId } from "@/utils/api/api";
import axios from "axios";

export async function downloadCSVFromEndpoint(endpoint: string, filename: string): Promise<void> {
  try {
    const projectId = await getProjectId();
    const token = await getIdToken();

    const response = await axios.get(`${config.API_HOST}/${endpoint}`, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Authorization: `Bearer ${token}`,
        projectId: `${projectId}`
      }
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading the XLSX file:", error);
  }
}

