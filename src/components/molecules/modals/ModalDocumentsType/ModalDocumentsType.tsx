import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import {
  FileObject,
  UploadDocumentButton
} from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";
import { CertificateType, DocumentCompleteType } from "@/types/logistics/certificate/certificate";
import { Button, Col, DatePicker, Flex, GetProp, message, Modal, Row, Select, Spin, Switch, Tabs, TabsProps, Typography, Upload, UploadFile, UploadProps } from "antd";
import { CheckCircle, FileArrowUp, FloppyDisk, X } from "phosphor-react";
import { Controller, useForm } from "react-hook-form";
import { SelectInputForm } from "../../logistics/SelectInputForm/SelectInputForm";
import { InputCreateDocument } from "@/components/atoms/inputs/inputCreate/InputCreateDocument";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import { useEffect, useState } from "react";
import { ICertificates, IDocumentsType, IEntityType } from "@/types/logistics/schema";
import { addDocumentsType, getAllEntityType } from "@/services/logistics/locations";
import useSWR from "swr";

const { Title } = Typography;
const { Option } = Select;
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

type PropsModalDocuments = {
  mockFiles: DocumentCompleteType[];
  setFiles: React.Dispatch<React.SetStateAction<any[] | FileObject[]>>;
  documentsType?: CertificateType[];
  isLoadingDocuments: boolean;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleChange: (value: string[]) => void;
  allOptional?: boolean;
  setSelectedFiles?: React.Dispatch<React.SetStateAction<DocumentCompleteType[]>>
};

export default function ModalDocuments(props: PropsModalDocuments) {
  const {
    mockFiles,
    setSelectedFiles,
    setFiles,
    documentsType,
    isLoadingDocuments,
    isOpen,
    onClose,
    handleChange,
    allOptional = false
  } = props;

  const {
    watch,
    control,
  } = useForm<CertificateType>();
  const [messageApi, contextHolder] = message.useMessage();
  
  const [documentName, setDocumentName] = useState<string>('');
  const [documentType, setDocumentType] = useState<number>(0);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const upprops: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);

      return false;
    },
    fileList,
  };

  const { data: entityTypeData, isLoading: isLoadingEntity } = useSWR(
    "entity",
    getAllEntityType,
    { revalidateIfStale:false,
      revalidateOnFocus:false,
      revalidateOnReconnect:false
    }
  );
  
  const convertEntityTypeToSelectOptions = (entityTypes: IEntityType[]) => {
    return entityTypes?.map((entityType) => ({
      value: entityType.description,
      id: entityType.id,
    }));
  };

  const handleCreate = async () => {
    const data: IDocumentsType ={
      id: "",
      entity_type: documentType,
      description: documentName,
      optional: "0",
      id_location: 0,
      id_material_type: 0,
      expiry: "",
      template: "",
      active: "1",
      created_at: new Date(),
      created_by: "",
      modified_at: new Date(),
      modified_by: ""
    }
    // const formData = new FormData();

    setUploading(true);

    const form = new FormData();
    const body: any = { ...data };
    body.files = fileList;
    fileList.forEach((file) => {
      form.append('files[]', file as FileType);
    });
    form.append("body", JSON.stringify(body));

    await addDocumentsType(form)
    .then((result)=>{
      setFileList([]);
      // refresh list 
      const newvalue : CertificateType = result.data;
      documentsType?.push(newvalue);
      const newdoccomplete: DocumentCompleteType =result.data;
      entityTypeData?.filter((f)=> f.id == documentType).map((m)=>  newdoccomplete.entity_type_desc = m.description);
      mockFiles.push(newdoccomplete);

      messageApi.success('Tipo de documento creado exitosamente!')
    }).catch((error) => {
      messageApi.error(error);
    })
    .finally(() => {
      setUploading(false);
    });
  };

  useEffect(() => {
    const subscription = watch((data, {name, type}) =>{
        console.log(data, name, type);
        if(name == 'description'){
          setDocumentName(String(data?.description))
        }
        if(name == 'entity_type'){
          setDocumentType(Number(data?.entity_type))
        }
      }
    )
    return () => subscription.unsubscribe()
  }, []);
  
  return (
    <Modal
      title="Cargar documentos"
      styles={{ body: { maxHeight: "30rem", overflowY: "auto", paddingRight: "0.5rem" } }}
      centered
      open={isOpen}
      onOk={onClose}
      onClose={() => {
        onClose()
      }}
      closeIcon={<X onClick={onClose} />}
      afterOpenChange={()=>{
        console.log(mockFiles)
      }}
      footer={
        <Flex justify="flex-end">
          <PrincipalButton onClick={onClose}>Cerrar</PrincipalButton>
        </Flex>
      }
    >
      <Tabs
        type="card"
        items = {[{
          key: '1',
          label: 'Tipo de Documento Existente',
          children:
            <>
            <Flex style={{ width: "100%" }} justify="space-between">
              <Row style={{ width: "100%" }} justify="space-between">
                <Col span={24} style={{marginTop:'1rem'}}>
                  <Title className="title" level={5} style={{marginTop:'1rem'}}>
                    Seleccione tipo de documento existente
                  </Title>
                  {documentsType && Array.isArray(documentsType) ? (
                    <Select
                      mode="multiple"
                      allowClear={false}
                      style={{ width: "100%" }}
                      placeholder="Seleccione documento"
                      defaultValue={mockFiles?.map((document) => document.id.toString()) || []}
                      loading={isLoadingDocuments}
                      onChange={(value)=>{ handleChange(value)}}
                      options={documentsType?.map((document) => ({
                        label: <span>{document.description}</span>,
                        value: document.id.toString(),
                        //disabled: allOptional ? false : !document.optional
                      }))}
                    />
                  ) : (
                    <Spin spinning={true}>Loading documents...</Spin>
                  )}

                </Col>
                <Col span={12} offset={12} style={{marginTop:'1rem', marginBottom:'1rem', textAlign:'right'}}>

                </Col>
              </Row>
            </Flex>
            </>          
        },
        {
          key: '2',
          label: 'Nuevo Tipo de Documento',
          children:
          <>
          <Flex style={{ width: "100%" }} justify="space-between">
            <Row style={{ width: "100%", marginBottom:'2rem' }} justify="space-between">
              <Col span={24}>                        
                <InputForm
                  placeholder="Ingresar nombre del documento"
                  titleInput="Nombre del documento"
                  nameInput="description"
                  validationRules={{ required: true }} control={control} error={undefined}
                  />
                    <div className="containerInput" style={{marginTop:'1rem'}}>
                      <Title className="input-form-title" level={5}>
                        Tipo de documento
                      </Title>
                    </div>
                    <Controller
                    name="entity_type"
                    control={control}
                    rules={{ required: true }}                    
                    render={({ field }) => (
                      <SelectInputForm
                        placeholder="Seleccionar"
                        field={field}
                        loading={isLoadingEntity}
                        options={convertEntityTypeToSelectOptions((entityTypeData as any) || [])}       
                        error={undefined} 
                        />
                      )}                    
                    /> 
              </Col>
              <Col span={12} style={{marginTop:'1rem', textAlign:'left'}}>
                  <Controller
                    name="template"
                    control={control}
                    render={({ field }) => (
                      <>
                      <Upload
                        className="uploadDocumentButton"
                        {...upprops}>
                          <Button htmlType="button" className="">
                            <FileArrowUp size={16} />
                            Cargar Plantilla
                          </Button>{" "}
                      </Upload>
                      </>
                    )}
                  />
              </Col>
              <Col span={12} style={{marginTop:'1rem', textAlign:'right'}}>
                <Button htmlType="button" className="" onClick={handleCreate}>
                  <FloppyDisk size={16} />
                  Guardar
                </Button>{" "}
              </Col>
            </Row>
          </Flex>
          </>
        }]}
      />
      
    </Modal>
  );
}
