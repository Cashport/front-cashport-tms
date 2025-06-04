import React from "react";
import { Button } from "antd";
import { ButtonProps } from "antd/lib/button";

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode; // El ícono que se mostrará en el botón
  backgroundColor?: string; // Color de fondo opcional
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  backgroundColor = "transparent", // Por defecto no tiene fondo
  style,
  ...props
}) => <Button type="text" icon={icon} style={{ backgroundColor, ...style }} {...props} />;

export default IconButton;
