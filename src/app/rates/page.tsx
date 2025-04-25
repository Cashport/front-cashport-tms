"use client";

import { Flex, Typography, Button } from "antd";
import { Plus } from "phosphor-react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

const { Title } = Typography;

export default function RatesPage() {
  const router = useRouter();

  return (
    <div className={styles.pageContainer}>
      <Flex className={styles.header}>
        <Title level={2} className={styles.title}>Listado de Tarifas</Title>
        <Button
          type="primary"
          icon={<Plus size={20} />}
          onClick={() => router.push("/rates/create")}
          className={styles.createButton}
        >
          Crear Tarifa
        </Button>
      </Flex>
      {/* Aquí irá la tabla de tarifas en el futuro */}
    </div>
  );
} 