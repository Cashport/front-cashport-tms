import { useMemo } from "react";
import { Dropdown } from "antd";
import styles from "./chipsRow.module.scss";

interface IChip {
  name: string;
  quantity: number;
  id: number;
}
interface IChipsRow {
  chips: IChip[];
  maxVisibleChips?: number;
}
const ChipsRow = ({ chips, maxVisibleChips = 3 }: IChipsRow) => {
  const { visibleChips, hiddenChips } = useMemo(() => {
    if (chips.length <= maxVisibleChips) {
      return { visibleChips: chips, hiddenChips: [] };
    }
    return {
      visibleChips: chips.slice(0, maxVisibleChips),
      hiddenChips: chips.slice(maxVisibleChips)
    };
  }, [chips]);

  return (
    <div className={styles.chipRow}>
      {visibleChips?.map((veh) => (
        <div className={styles.chip} key={veh.id}>
          {veh.name} <small>{veh.quantity}</small>
        </div>
      ))}

      {hiddenChips.length > 0 && (
        <Dropdown
          overlay={
            <div className={styles.dropdown}>
              {hiddenChips.map((hc) => (
                <div key={hc.id} className={styles.dropdownItem}>
                  {hc.name} <small>{hc.quantity}</small>
                </div>
              ))}
            </div>
          }
          placement="bottomLeft"
        >
          <div className={styles.chip} style={{ cursor: "pointer" }}>
            +{hiddenChips.length}
          </div>
        </Dropdown>
      )}
    </div>
  );
};

export default ChipsRow;
