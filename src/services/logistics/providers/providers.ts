import axios from "axios";
import { IAuditTableRow } from "@/components/organisms/logistics/proveedores/ModalAuditRequirements/ModalAuditRequirements";
import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

export const auditRequirements = async (documents: IAuditTableRow[]) => {
  try {
    const body = {
      documents: documents.map((doc) => ({
        documentTypeSubjectId: doc.id,
        accept: doc.audit?.toLowerCase() === "aprobar" ? true : false,
        comments: doc.commentary ?? "",
        expiryDate: doc.expiryDate || null
      }))
    };

    const response = await API.post("/subject/audit", body);
    return response;
  } catch (error) {
    console.error("Error al auditar requerimientos:", error);

    // Extract error message from Axios error response
    if (axios.isAxiosError(error)) {
      const errorMessage = error.message || "Error al auditar requerimientos";
      throw errorMessage;
    }
    throw error;
  }
};

export interface IDocument {
  id: number;
  project_id: number;
  document_type: string;
  name: string;
  template_url: string | null;
}

export const getAvailableDocumentTypes = async (subjectId: number) => {
  try {
    const response: GenericResponse<IDocument[]> = await API.get(
      `/subject/${subjectId}/available-document-types`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener documentos disponibles:", error);
    throw error;
  }
};

export const createDocumentBySubjectId = async (subjectId: any, documentTypeId: any) => {
  try {
    const response: GenericResponse<any> = await API.post(
      `/subject/${subjectId}/documents-type/${documentTypeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al crear documento por ID de sujeto:", error);
    throw error;
  }
};

export const deleteDocumentById = async (subjectId: number, documentTypeId: number) => {
  try {
    const response: GenericResponse<any> = await API.delete(
      `/subject/${subjectId}/documents-type/${documentTypeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar documento por ID:", error);
    throw error;
  }
};
