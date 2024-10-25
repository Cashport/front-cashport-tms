import { Typography } from "antd";
import { Check, Plus, Trash, Warning } from "phosphor-react";
import styles from './Document.module.scss';

const Text = Typography;

const Document = () => {
  return (
    <div className={styles.mainDocument}> 
      <div className={styles.itemContainer}>
        <div className={styles.titleContainer}>
          <Text className={styles.title}>Red permit</Text>
          <Text className={styles.subtitle}>*Obligatorio</Text>
        </div>
        <div className={styles.uploadComponent}>
          <div className={styles.iconContainer}><Warning size={16} weight="fill" color="#FFFFFF" /></div>
          <div>
            <Text className={styles.fileTitle}>Seleccionar archivo</Text>
            <Text className={styles.fileSubtitle}>PDF, Word, PNG. (Tamaño max 30MB)</Text>
          </div>
        </div>
      </div>
      <div className={styles.itemContainer}>
        <div className={styles.titleContainer}>
          <Text className={styles.title}>Sustancias controladas</Text>
          <Text className={styles.subtitle}>*Obligatorio</Text>
        </div>
        <div className={styles.uploadComponent}>
          <div className={`${styles.iconContainer} ${styles.green}`}><Check size={16} color="#FFFFFF" /></div>
          <div className={styles.fileContentContainer}>
            <div>
              <Text className={`${styles.fileTitle} ${styles.bold}`}>Nombre del documento</Text>
              <Text className={`${styles.fileSubtitle} ${styles.bold}`}>Vigencia 17/12/2024</Text>
            </div>
            <Trash size={20} color="#141414" />
          </div>
        </div>
      </div>
      <div className={styles.itemContainer}>
        <div />
        <div className={styles.uploadDocuments}>
          <Plus size={20} color="#FFFFFF" />
          <Text className={styles.uploadDocumentText}>Cargar documentos</Text>
        </div>
      </div>
    </div>
  )
}

export default Document;