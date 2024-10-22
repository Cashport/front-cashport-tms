import {
  CaretDoubleRight,
  ChartLineUp,
  Check,
  FileArrowDown,
  Files,
  MapTrifold,
  Money,
  NewspaperClipping,
  NotePencil,
  PencilLine,
  User,
  X
} from "phosphor-react";
import styles from "./drawerBody.module.scss";
import { Button, Typography } from "antd";
import { FC, useState } from "react";
import { INovelty, INoveltyEvidenceBody } from "@/types/novelty/INovelty";
import { formatMoney } from "@/utils/utils";
import { FileDownloadModal } from "@/components/molecules/modals/FileDownloadModal/FileDownloadModal";
import { STATUS } from "@/utils/constants/globalConstants";

const Text = Typography;

interface IDrawerBodyProps {
  onClose: () => void;
  novelty: INovelty | null;
  // eslint-disable-next-line no-unused-vars
  approbeOrReject: (id: number, isApprobe: boolean) => void;
  handleEdit: () => void;
  canEdit: boolean;
}

export const DrawerBody: FC<IDrawerBodyProps> = ({
  onClose,
  novelty,
  approbeOrReject,
  handleEdit,
  canEdit = true
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [evidence, setEvidence] = useState<INoveltyEvidenceBody | null>(null);

  const handleOpenModal = (evidence: INoveltyEvidenceBody) => {
    setEvidence(evidence);
    setIsModalOpen(true);
  };
  console.log("can edit", canEdit, novelty);
  return (
    <div className={styles.mainDrawerBody}>
      <div onClick={onClose} className={styles.closeContainer}>
        <CaretDoubleRight size={20} />
      </div>
      <div className={styles.titleSection}>
        <div className={styles.titleContainer}>
          <Text className={styles.title}>Novedad</Text>
          <Text className={styles.subtitle}>ID {novelty?.id}</Text>
        </div>
        <div className={styles.btnContainer}>
          <div className={styles.mapBtn}>
            <MapTrifold color="#666666" size={24} />
            <Text className={styles.mapLabel}>Recorrido</Text>
          </div>
          <Button
            onClick={() => {
              if (novelty) {
                approbeOrReject(novelty.id, false);
              }
            }}
            disabled={!canEdit || novelty?.status_id === STATUS.NOVELTY.RECHAZADA}
          >
            <X color="#141414" size={12} />
            <Text className={styles.approbeLabel}>Rechazar</Text>
          </Button>
          <Button
            onClick={() => {
              if (novelty) {
                approbeOrReject(novelty.id, true);
              }
            }}
            type="text"
            className={styles.approbeBtn}
            disabled={
              !canEdit ||
              novelty?.status_id === STATUS.NOVELTY.ACEPTADA ||
              novelty?.status_id === STATUS.NOVELTY.RECHAZADA
            }
          >
            <Check color="#141414" size={12} />
            <Text className={styles.approbeLabel}>Aprobar</Text>
          </Button>
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.body}>
        <div className={styles.leftSection}>
          <div className={styles.bodyTitleContainer}>
            <User color="#666666" size={20} />
            <Text className={styles.bodyTitle}>Creador</Text>
          </div>
          <div className={styles.bodyTitleContainer}>
            <NewspaperClipping color="#666666" size={20} />
            <Text className={styles.bodyTitle}>Tipo de novedad</Text>
          </div>
          <div className={styles.bodyTitleContainer}>
            <ChartLineUp color="#666666" size={20} />
            <Text className={styles.bodyTitle}>Cantidad</Text>
          </div>
          <div className={styles.bodyTitleContainer}>
            <Money color="#666666" size={20} />
            <Text className={styles.bodyTitle}>Valor unitario</Text>
          </div>
          <div className={styles.bodyTitleContainer}>
            <Money color="#666666" size={20} />
            <Text className={styles.bodyTitle}>Valor sobrecosto</Text>
          </div>
          <div className={styles.bodyTitleContainer}>
            <NotePencil color="#666666" size={20} />
            <Text className={styles.bodyTitle}>Observaciones</Text>
          </div>
          <div className={`${styles.bodyTitleContainer} ${styles.evidence}`}>
            <Files color="#666666" size={20} />
            <Text className={styles.bodyTitle}>Evidencia</Text>
          </div>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.editContainer}>
            <Text className={styles.text}>{novelty?.created_by}</Text>
            <div
              onClick={() => {
                if (
                  novelty?.status_id !== STATUS.NOVELTY.ACEPTADA &&
                  novelty?.status_id !== STATUS.NOVELTY.RECHAZADA &&
                  canEdit
                ) {
                  handleEdit();
                }
              }}
              className={styles.editBtn}
            >
              <PencilLine color="#666666" size={20} />
            </div>
          </div>
          <Text className={styles.text}>{novelty?.novelty_type}</Text>
          <Text className={styles.text}>{novelty?.quantity}</Text>
          <Text className={styles.text}>{formatMoney(novelty?.unit_value) || "$0"}</Text>
          <Text className={styles.text}>{formatMoney(novelty?.value) || "$0"}</Text>
          <Text className={styles.text}>{novelty?.observation}</Text>
          <div className={styles.evidenceContainer}>
            {novelty?.evidences.map((evidence) => {
              const imageExtensions = ["jpg", "jpeg", "png"];
              const extension = evidence.url.split(".").pop()?.toLowerCase();
              if (extension && imageExtensions.includes(extension)) {
                return (
                  <div
                    onClick={() => handleOpenModal(evidence)}
                    key={evidence.id}
                    className={styles.evidence}
                  >
                    <Text className={styles.evidenceTitle}>{evidence.name}</Text>
                    <FileArrowDown color="#141414" size={20} />
                  </div>
                );
              }
              return (
                <a
                  key={`evidence-${evidence.id}`}
                  className={styles.evidence}
                  download={evidence.url}
                  href={evidence.url}
                  target="_blank"
                >
                  <Text className={styles.evidenceTitle}>{evidence.name}</Text>
                  <FileArrowDown color="#141414" size={20} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className={styles.divider} />
      <FileDownloadModal
        isModalOpen={isModalOpen}
        onCloseModal={setIsModalOpen}
        url={evidence?.url ?? ""}
      />
    </div>
  );
};
