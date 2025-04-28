import { shortenFileName } from "@/utils/utils";
import { Button, Flex, Typography } from "antd";
import { FileArrowDown, Trash } from "phosphor-react";

const { Text } = Typography;

type Props = {
  showTrash: boolean;
  onDelete: () => void;
  linkFile: string;
  nameFile: string;
  fullName?: boolean;
};

export default function UploadDocumentChild(props: Props) {
  const { showTrash, onDelete, linkFile, nameFile, fullName } = props;
  return (
    <Flex gap={20} align="center" justify="space-between">
      <Button type="text" href={linkFile} target="_blank" style={{ padding: 0 }}>
        <FileArrowDown size={"25px"} />
        <Text className="nameFile">{fullName ? nameFile : shortenFileName(nameFile, 22)}</Text>
      </Button>
      {showTrash && (
        <Button
          className="deleteDocButton"
          type="text"
          onClick={onDelete}
          icon={<Trash size={"20px"} />}
        />
      )}
    </Flex>
  );
}
