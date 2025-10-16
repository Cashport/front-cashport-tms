import React, { ReactNode } from "react";
import { Button, Dropdown, MenuProps } from "antd";
import { DotsThree, ListChecks } from "phosphor-react";
import { TruckTrailer, TipJar } from "@phosphor-icons/react";
import "./generateActionButton.scss";

interface GenerateActionButtonProps {
  onProvidersClick: () => void;
  onTenderClick: () => void;
}

export default function GenerateActionButton({
  onProvidersClick,
  onTenderClick
}: GenerateActionButtonProps) {
  const customDropdown = (menu: ReactNode) => <div className="dropdownGenerateAction">{menu}</div>;

  const generateActionOptions: MenuProps["items"] = [
    {
      key: "Proveedores",
      icon: <TruckTrailer size={12} />,
      label: "Proveedores",
      onClick: onProvidersClick
    },
    {
      key: "Enviar licitación",
      icon: <TipJar size={12} />,
      label: "Enviar licitación",
      onClick: onTenderClick
    },
    {
      key: "Solicitar aprobación",
      icon: <ListChecks size={12} />,
      label: "Solicitar aprobación"
    }
  ];

  return (
    <Dropdown
      dropdownRender={customDropdown}
      menu={{ items: generateActionOptions }}
      trigger={["click"]}
    >
      <Button className="generateActionBtn">
        <DotsThree size={20} weight="bold" />
        Generar acción
      </Button>
    </Dropdown>
  );
}
