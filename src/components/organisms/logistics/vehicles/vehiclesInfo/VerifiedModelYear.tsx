import { useEffect, useState } from "react";
import { Button, Flex, InputNumber, message, Modal, Typography } from "antd";

import { updateVehicleVerifiedYear } from "@/services/logistics/vehicle";
import { IVehicle } from "@/types/logistics/schema";

const { Text } = Typography;

interface Props {
  vehicle: IVehicle;
  onSaved: () => void;
}

/**
 * Modelo del vehículo verificado por el auditor contra la tarjeta de propiedad.
 * Es el dato con el que se valida la antigüedad máxima del proyecto (el año del
 * formulario lo edita el proveedor). El back solo deja guardarlo a los roles de auditoría.
 */
export const VerifiedModelYear = ({ vehicle, onSaved }: Props) => {
  const [year, setYear] = useState<number | null>(vehicle.verified_model_year ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setYear(vehicle.verified_model_year ?? null);
  }, [vehicle.verified_model_year]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateVehicleVerifiedYear(vehicle.id, year);
      if (result.compliant) {
        message.success("Modelo verificado registrado", 2);
      } else {
        Modal.warning({
          title: "El vehículo quedó inactivo por antigüedad",
          content: result.reason,
          okText: "Entendido"
        });
      }
      onSaved();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al registrar el modelo verificado",
        3
      );
    } finally {
      setSaving(false);
    }
  };

  const maxYear = new Date().getFullYear() + 1;

  return (
    <Flex gap={12} align="center" wrap="wrap" style={{ marginBottom: 16 }}>
      <Text strong>Modelo según tarjeta de propiedad:</Text>
      <InputNumber
        min={1950}
        max={maxYear}
        value={year}
        onChange={(value) => setYear(value ?? null)}
        placeholder="Ej. 2018"
      />
      <Button
        onClick={handleSave}
        loading={saving}
        disabled={year === (vehicle.verified_model_year ?? null)}
      >
        Guardar modelo verificado
      </Button>
      {vehicle.verified_model_year_by ? (
        <Text type="secondary">
          Verificado por {vehicle.verified_model_year_by}
          {vehicle.verified_model_year_at
            ? ` el ${new Date(vehicle.verified_model_year_at).toLocaleDateString("es-CO")}`
            : ""}
        </Text>
      ) : (
        <Text type="secondary">Pendiente de verificar contra la tarjeta de propiedad</Text>
      )}
    </Flex>
  );
};
