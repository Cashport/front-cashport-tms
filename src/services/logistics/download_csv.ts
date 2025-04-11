import { API } from "@/utils/api/api";

export async function downloadCSVFromEndpoint(endpoint: string, filename: string): Promise<void> {
  try {
    const response = await API.get(`${endpoint}`, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
