import config from "@/config";
import { IChangeStatusTrip } from "@/types/logistics/tracking/tracking";
import { getIdToken } from "@/utils/api/api";

import axios, { AxiosResponse } from "axios";

export const updateTripTrackingStatus = async (data: IChangeStatusTrip): Promise<any> => {
  try {
    const token = await getIdToken();
    const formData = new FormData();
    formData.append("status_id", data.tripStatus);
    formData.append("comment", data.comment);
    formData.append("trip_id", data.tripId.toString());

    const response: AxiosResponse = await axios.post(
      `${config.API_HOST}/cashport/update-trip-tracking`,
      formData,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log("primer response", response);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
