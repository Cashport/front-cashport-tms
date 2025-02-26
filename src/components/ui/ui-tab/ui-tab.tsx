import { FC } from "react";
import "./ui-tab.scss";
import { Tabs, TabsProps } from "antd";

interface UiTabProps {
  tabs: TabsProps["items"];
  sticky?: boolean;
  // eslint-disable-next-line no-unused-vars
  onChange?: (key: string) => void;
  defaultActiveKey?: string;
  activeKey?: string;
}

const UiTab: FC<UiTabProps> = ({
  tabs,
  sticky = false,
  onChange,
  defaultActiveKey,
  activeKey
}: UiTabProps) => {
  return (
    <div className={`tabsContainer ${sticky && "-sticky"}`}>
      <Tabs
        style={{ width: "100%", height: "100%" }}
        defaultActiveKey={defaultActiveKey}
        items={tabs}
        size="small"
        onChange={onChange}
        activeKey={activeKey}
      />
    </div>
  );
};

export default UiTab;
