import { Collapse, CollapseProps, ConfigProvider, Empty } from "antd";
import "./customCollapse.scss";

interface CustomCollapseProps extends CollapseProps {
  stickyLabel?: boolean;
  labelStickyOffset?: string;
}

export default function CustomCollapse({
  items,
  ghost,
  defaultActiveKey,
  stickyLabel,
  labelStickyOffset,
  ...rest
}: Readonly<CustomCollapseProps>) {
  const hasValidItems = items && items.length > 0;
  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            headerPadding: "16px 12px 0 0"
          }
        }
      }}
    >
      {hasValidItems ? (
        <Collapse
          style={
            {
              "--sticky-offset": `${labelStickyOffset ? labelStickyOffset : "5.6rem"}`
            } as React.CSSProperties
          }
          className={`genericCollapse ${stickyLabel ? "sticky" : ""}`}
          ghost
          items={items}
          defaultActiveKey={defaultActiveKey ?? ["0"]}
          {...rest}
        />
      ) : (
        <Empty description="No hay información disponible" />
      )}
    </ConfigProvider>
  );
}
