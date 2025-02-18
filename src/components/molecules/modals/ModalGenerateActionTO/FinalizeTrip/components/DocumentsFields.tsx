import { useFieldArray } from "react-hook-form";
import UploadFileButton from "../../../ModalBillingAction/UploadFileButton/UploadFileButton";
import AddRemoveButton from "@/components/organisms/logistics/acept_carrier/detail/components/VehicleAndDriverAsignation/components/AddRemoveButton/AddRemoveButton";
import { Flex } from "antd";
import { FinalizeTripForm, ICarrier } from "../controllers/finalizetrip.types";
import { UploadDocumentButton } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";

export function DocumentFields({
  control,
  register,
  carrierIndex,
  entityIndex,
  handleOnDeleteDocument,
  handleOnChangeDocument,
  currentCarrier,
  entityType,
  disabled = false
}: Readonly<{
  control: any;
  register: any;
  carrierIndex: number;
  entityIndex: number;
  entityType: "trip" | "requirement";
  handleOnDeleteDocument: (entityIndex: number, documentIndex: number, entityType: "trip" | "requirement") => void;
  handleOnChangeDocument: (fileToSave: any, entityIndex: number, documentIndex: number, entityType: "trip" | "requirement") => void;
  currentCarrier: ICarrier;
  disabled?: boolean;
}>) {
  const { fields: documentFields, append: appendDocument } = useFieldArray<FinalizeTripForm>({
    control,
    name: `carriers.${carrierIndex}.${entityType == "trip" ? "vehicles" : "requirements"}.${entityIndex}.documents`
  });

  return (
    <div>
      <Flex vertical gap={8}>
        {documentFields.map((document: any, documentIndex) => {
          if (document.link) {
            return (
              <UploadDocumentButton
                key={`carrier-${carrierIndex}-${entityType === "trip" ? "vehicle" : "requirement"}-${entityIndex}-doc-${documentIndex}`}
                title={"Documento MT"}
                showTitleAndMandatory={documentIndex === 0}
                isMandatory={true}
                setFiles={() => {}}
                disabled
              >
                <UploadDocumentChild
                  linkFile={document.link}
                  nameFile={document.link.split("-").pop() ?? ""}
                  showTrash={false}
                  onDelete={() => {}}
                />
              </UploadDocumentButton>
            );
          }
          return (
            <UploadFileButton
              key={`carrier-${carrierIndex}-${entityType === "trip" ? "vehicle" : "requirement"}-${entityIndex}-doc-${documentIndex}`}
              title={"Documento MT"}
              showTitleAndMandatory={documentIndex === 0}
              handleOnDelete={() => handleOnDeleteDocument(entityIndex, documentIndex, entityType)}
              handleOnChange={(file) => handleOnChangeDocument(file, entityIndex, documentIndex, entityType)}
              fileName={
                currentCarrier[entityType === "trip" ? "vehicles" : "requirements"]?.[entityIndex].documents?.[documentIndex].file?.name ??
                undefined
              }
              fileSize={
                currentCarrier[entityType === "trip" ? "vehicles" : "requirements"]?.[entityIndex].documents?.[documentIndex].file?.size ??
                undefined
              }
              isMandatory={true}
              disabled={disabled}
            />
          );
        })}
      </Flex>
      <Flex justify="flex-end">
        <AddRemoveButton
          type="add"
          onClick={() => appendDocument({ docReference: "", file: undefined, aditionalData: {} })}
          disabled={disabled}
          text="Agregar otro documento"
        />
      </Flex>
    </div>
  );
}
