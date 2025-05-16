import { GenericResponse } from "@/types/global/IGlobal";
import { IChangeStatusTrip } from "@/types/logistics/tracking/tracking";
import { API } from "@/utils/api/api";


export const updateTripTrackingStatus = async (data: IChangeStatusTrip): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("status_id", data.tripStatus);
    formData.append("comment", data.comment);
    formData.append("trip_id", data.tripId.toString());

    const response: GenericResponse = await API.post(`/cashport/update-trip-tracking`, formData, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
