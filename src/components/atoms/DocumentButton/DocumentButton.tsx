import { Button, Flex, Typography } from "antd";
import { FileArrowUp, Trash } from "phosphor-react";
import type { UploadFile, UploadProps } from "antd";
import { Upload } from "antd";
const { Dragger } = Upload;

import "./documentbutton.scss";
import { UploadChangeParam } from "antd/es/upload";

const { Text } = Typography;

// interface FileFromDragger {
//   lastModified: number;
//   lastModifiedDate: Date;
//   name: string;
//   originFileObj: File;
//   percent: number;
//   size: number;
//   status: string;
//   type: string;
//   uid: string;
// }

// interface FileObjectFromButton {
//   file: FileFromDragger;
//   fileList: FileFromDragger[];
// }
interface Props {
  title?: string;
  fileName?: string;
  fileSize?: any;
  className?: any;
  // eslint-disable-next-line no-unused-vars
  handleOnChange?: (info: UploadChangeParam<UploadFile<any>>) => void;
  handleOnDrop?: () => void;
  // eslint-disable-next-line no-unused-vars
  handleOnDelete?: (_: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
}

export const DocumentButton = ({
  title = "file",
  fileName = "Seleccionar archivo",
  fileSize = "PDF, Word, PNG (Tamaño max 30mb)",
  handleOnChange,
  handleOnDrop,
  handleOnDelete,
  disabled,
  className
}: Props) => {
  const props: UploadProps = {
    name: title,
    onChange: handleOnChange,
    onDrop: handleOnDrop,
    accept: ".pdf, .png, .doc, .docx",
    showUploadList: false,
    customRequest: () => {
      return;
    },
    disabled,
    onRemove: () => false
  };

  if (typeof fileSize !== "string") {
    fileSize = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <Dragger
      className={className ? `documentDragger ${className}` : "documentDragger"}
      {...props}
      openFileDialogOnClick={fileName === "Seleccionar archivo"}
    >
      <Flex justify="space-between" align="center">
        <Flex align="left" vertical>
          <Flex>
            <FileArrowUp size={"25px"} />
            <Text className="nameFile">{fileName}</Text>
          </Flex>
          <Text className="sizeFile">{fileSize}</Text>
        </Flex>
        {!disabled && fileName !== "Seleccionar archivo" ? (
          <Button
            onClick={handleOnDelete}
            className="deleteDocButton"
            type="text"
            icon={<Trash size={"20px"} />}
          />
        ) : null}
      </Flex>
    </Dragger>
  );
};
