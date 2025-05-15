import { Button, Flex, Typography, Upload } from "antd";
import { FileArrowUp, Trash } from "phosphor-react";
import type { UploadFile, UploadProps } from "antd";
import { UploadChangeParam } from "antd/es/upload";

import { shortenFileName } from "@/utils/utils";
import { FILE_EXTENSIONS } from "@/utils/constants/globalConstants";

import "./documentbutton.scss";

const { Text } = Typography;
const { Dragger } = Upload;

export interface DocumentButtonProps {
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
  children?: React.ReactNode;
  accept?: string;
  handleOnClick?: () => void;
  deletable?: boolean;
}

export const DocumentButton = ({
  title = "file",
  fileName = "Seleccionar archivo",
  fileSize = "PDF, Word, PNG (Tamaño max 30mb)",
  accept = FILE_EXTENSIONS.join(","),
  deletable = true,
  handleOnChange,
  handleOnDrop,
  handleOnDelete,
  handleOnClick,
  disabled,
  className,
  children
}: DocumentButtonProps) => {
  const props: UploadProps = {
    name: title,
    onChange: handleOnChange,
    onDrop: handleOnDrop,
    accept,
    showUploadList: false,
    customRequest: () => {
      return;
    },
    beforeUpload: (file) => {
      const reader = new FileReader();

      reader.onload = (e) => {};
      reader.readAsText(file);

      // Prevent upload
      return false;
    },
    disabled,
    onRemove: () => false
  };

  if (typeof fileSize !== "string") {
    fileSize = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <div style={{ minHeight: " 4.75rem" }} onClick={handleOnClick}>
      <Dragger
        className={className ? `documentDragger ${className}` : "documentDragger"}
        {...props}
        openFileDialogOnClick={fileName === "Seleccionar archivo"}
      >
        {children || (
          <Flex justify="space-between" align="center">
            <Flex align="left" vertical>
              <Flex>
                <FileArrowUp size={"25px"} />
                <Text className="nameFile">{shortenFileName(fileName, 22)}</Text>
              </Flex>
              <Text className="sizeFile">{fileSize}</Text>
            </Flex>
            {deletable && !disabled && fileName !== "Seleccionar archivo" ? (
              <Button
                onClick={handleOnDelete}
                className="deleteDocButton"
                type="text"
                icon={<Trash size={"20px"} />}
              />
            ) : null}
          </Flex>
        )}
      </Dragger>
    </div>
  );
};
