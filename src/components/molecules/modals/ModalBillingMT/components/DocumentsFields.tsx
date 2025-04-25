import { useFieldArray } from "react-hook-form";
import AddRemoveButton from "@/components/organisms/logistics/acept_carrier/detail/components/VehicleAndDriverAsignation/components/AddRemoveButton/AddRemoveButton";
import { Flex } from "antd";
import { UploadDocumentButton } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";
import { EvidenceByVehicleForm, FileWithLink } from "../controllers/formbillingmt.types";
import UploadFileButton from "../../ModalBillingAction/UploadFileButton/UploadFileButton";

export function DocumentFields({
  control,
  register,
  handleOnDeleteDocument,
  handleOnChangeDocument,
  currentDocuments,
  mode
}: Readonly<{
  control: any;
  register: any;
  handleOnDeleteDocument?: (documentIndex: number) => void;
  handleOnChangeDocument: (fileToSave: any, documentIndex: number) => void;
  currentDocuments: FileWithLink[];
  mode: "view" | "edit";
}>) {
  const {
    fields: documentFields,
    append: appendDocument,
    remove: removeDocument
  } = useFieldArray<EvidenceByVehicleForm>({
    control,
    name: `documents`
  });

  const internalDeleteDocument = (index: number) => {
    handleOnDeleteDocument && handleOnDeleteDocument(index);
    removeDocument(index);
  };

  return (
    <div>
      <Flex vertical gap={8}>
        {documentFields.map((document: any, documentIndex) => {
          if (document.link) {
            return (
              <UploadDocumentButton
                key={`doc-${documentIndex}-${document.id}`}
                title={"Documento MT"}
                showTitleAndMandatory={documentIndex === 0}
                isMandatory={true}
                setFiles={() => {}}
                disabled
              >
                <UploadDocumentChild
                  linkFile={document.link}
                  nameFile={document.name || document.link.split("-").pop() || ""}
                  showTrash={mode === "edit"}
                  onDelete={() => internalDeleteDocument(documentIndex)}
                  fullName
                />
              </UploadDocumentButton>
            );
          }
          return (
            <UploadFileButton
              key={`doc-${documentIndex}-${document.id}`}
              title={"Documento MT"}
              showTitleAndMandatory={documentIndex === 0}
              handleOnDelete={() => internalDeleteDocument(documentIndex)}
              handleOnChange={(file) => handleOnChangeDocument(file, documentIndex)}
              fileName={currentDocuments?.[documentIndex]?.file?.name ?? undefined}
              fileSize={currentDocuments?.[documentIndex]?.file?.size ?? undefined}
              isMandatory={true}
            />
          );
        })}
      </Flex>
      {mode === "edit" && (
        <Flex justify="flex-end">
          <AddRemoveButton
            type="add"
            onClick={() => appendDocument({ docReference: "", file: undefined, aditionalData: {} })}
            disabled={false}
            text="Agregar otro documento"
          />
        </Flex>
      )}
    </div>
  );
}
