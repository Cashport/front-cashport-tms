import { FC, useContext } from "react";
import Image from "next/image";
import styles from "./dashboard-expired-portfolio.module.scss";
import DashboardGenericItem from "../dashboard-generic-item";
import { ClientDetailsContext } from "../../containers/client-details/client-details";
import { formatMillionNumber, formatMoney } from "@/utils/utils";

interface DashboardExpiredPortfolioProps {
  className?: string;
}

const DashboardExpiredPortfolio: FC<DashboardExpiredPortfolioProps> = ({ className }) => {
  const { portfolioData } = useContext(ClientDetailsContext);
  const formattedPastDuePortfolio = formatMillionNumber(
    portfolioData?.data_wallet?.past_due_ammount
  );
  const pastDuePortfolio = formatMoney(formattedPastDuePortfolio);
  const expiredPercentage = portfolioData?.percentages?.past_due_percentage;
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <DashboardGenericItem
        name="C. vencida"
        badgeText={`${expiredPercentage}%`}
        value={pastDuePortfolio}
        unit="M"
      />
      <Image src="/images/graph-2.svg" alt="Graph" className={styles.img} width={78} height={48} />
    </div>
  );
};

export default DashboardExpiredPortfolio;
