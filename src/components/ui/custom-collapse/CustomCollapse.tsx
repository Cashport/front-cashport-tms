import { Collapse, CollapseProps, ConfigProvider, Empty } from "antd";

export default function CustomCollapse({
  items,
  ghost,
  defaultActiveKey,
  ...rest
}: Readonly<CollapseProps>) {
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
        <Collapse ghost items={items} defaultActiveKey={defaultActiveKey ?? ["0"]} {...rest} />
      ) : (
        <Empty description="No hay información disponible" />
      )}
    </ConfigProvider>
  );
}
