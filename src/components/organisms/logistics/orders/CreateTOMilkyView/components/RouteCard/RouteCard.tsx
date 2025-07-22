import { MenuProps } from "antd";
import React from "react";
import { RouteCardHeader } from "../RouteCardHeader/RouteCardHeader";
import dayjs from "dayjs";
import { TripInfo } from "../TripInfo/TripInfo";
import { DiscountCTA } from "../DiscountCTA/DiscountCTA";

interface RecommendationTripcardProps {
  recommendationData?: any;
  currentUserLoad: number;
  onSelectRoute: () => void;
  onSeeLoad: () => void;
}

const RouteCard: React.FC<RecommendationTripcardProps> = ({
  recommendationData = "",
  currentUserLoad,
  onSelectRoute,
  onSeeLoad
}) => {
  return (
    <div className="createTOMilkyView__recommendationTripCard">
      <RouteCardHeader
        companyLogo={recommendationData.companyInfo.companyLogo}
        companyName={recommendationData.companyInfo.companyName}
        tripDescription={recommendationData.tripDescription}
        isRecommended={recommendationData.isRecommended}
        dedicatedFleet={recommendationData.dedicatedFleet}
        driversInfo={recommendationData.driversInfo}
      />

      <div className="createTOMilkyView__recommendationTripCard__content">
        <TripInfo
          tripInfo={recommendationData.tripInfo}
          stops={recommendationData.stops}
          currentUserLoad={currentUserLoad}
          onSeeLoad={onSeeLoad}
        />

        <DiscountCTA
          discountPercentage={recommendationData.discountPercentage}
          onSelectRoute={onSelectRoute}
        />
      </div>
    </div>
  );
};

export default RouteCard;
