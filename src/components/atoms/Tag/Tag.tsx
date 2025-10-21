import React, { ReactNode } from "react";
import { Flex } from "antd";

interface TagProps {
  content: ReactNode; // Contenido del tag, puede ser texto o cualquier componente
  icon?: ReactNode; // Icono opcional
  style?: React.CSSProperties; // Estilos personalizados del tag
  iconGap?: number; // Espaciado entre el contenido y el icono
  iconPosition?: "left" | "right"; // Posición del icono en el tag
  color?: string; // Color del tag
  withBorder?: boolean; // Mostrar borde en el tag
}

interface TagGroupProps {
  tags: Array<{ content: ReactNode; icon?: ReactNode }>; // Lista de tags con contenido e icono opcional
  wrap?: boolean; // Permitir que los tags se envuelvan en múltiples líneas
  gap?: number; // Espaciado entre tags
  style?: React.CSSProperties; // Estilos personalizados del contenedor de tags,
}

const Tag: React.FC<TagProps> = ({
  content,
  icon,
  style,
  iconGap = 4,
  iconPosition = "left",
  color,
  withBorder = true
}) => (
  <Flex
    align="center"
    gap={icon ? iconGap : 0}
    style={{
      backgroundColor: `${color ? `${color}14` : "#FFFFFF"}`,
      padding: "4px 8px",
      fontSize: 16,
      fontWeight: 300,
      border: withBorder ? `1px solid ${color ?? "#DDDDDD"}` : "",
      color: color ?? "#141414",
      borderRadius: 8,
      ...style // Permite sobrescribir estilos predeterminados
    }}
  >
    {icon && iconPosition === "left" && icon}
    {content}
    {icon && iconPosition === "right" && icon}
  </Flex>
);

const TagGroup: React.FC<TagGroupProps> = ({ tags, wrap = true, gap = 8, style }) => (
  <Flex align="center" gap={gap} wrap={wrap} style={style}>
    {tags.map((tag, index) => (
      <Tag key={index} content={tag.content} icon={tag.icon} />
    ))}
  </Flex>
);

export { Tag, TagGroup };
