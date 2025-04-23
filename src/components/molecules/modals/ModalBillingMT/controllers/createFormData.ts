import { IParsedFormValues } from "./formbillingmt.types";

export function createFormDataFinalizeTrip(docs: IParsedFormValues[]): FormData {
  const formData = new FormData();
  const documentsMTs: { flag: "new" | "update" | "delete"; file?: string; url?: string }[] = [];

  docs.forEach((document, index) => {
    if (document.file) {
      documentsMTs.push({
        flag: "new",
        file: `MT-${index}`
      });
      formData.append(`MT-${index}`, document.file);
    }
    if (document.url) {
      documentsMTs.push({
        flag: document.flag as "new" | "update" | "delete",
        url: document.url
      });
    }
  });
  formData.append("request", JSON.stringify({ documentsMTs }));
  return formData;
}
