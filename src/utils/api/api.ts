import axios from "axios";
import config from "@/config";
import { auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export async function getIdToken(forceRefresh?: boolean) {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken(forceRefresh);
  } else {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) resolve(await user.getIdToken(forceRefresh));
        else reject(new Error("Token not found"));
      });
    });
  }
}
const instance = (token: string) =>
  axios.create({
    baseURL: config.API_HOST,
    timeout: 10000,
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`
    }
  });

export const fetcher = async (url: string) => {
  const token = (await getIdToken(false)) as string;
  return instance(token)
    .get(url)
    .then((res) => {
      if (!res.data) {
        throw Error(res.data.message);
      }

      return res.data;
    })
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        throw new Error("La solicitud ha sido cancelada debido a un timeout");
      } else {
        if (error?.message) {
          throw new Error(error.message);
        }
        throw new Error("error");
      }
    });
};

const API = axios.create({
  responseType: "json",
  baseURL: config.API_HOST
});

export const setProjectInApi = (projectId: number) => {
  API.interceptors.request.use((request) => {
    request.headers.set("projectId", `${projectId}`);
    return request;
  });
};

export const getProjectId = async () => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const project = JSON.parse(sessionStorage.getItem("project") || "{}");
  const projectId = (project?.state?.projectsBasicInfo?.find(() => true)?.ID as number) || 0;
  return projectId;
};

API.interceptors.request.use(async (request) => {
  request.headers.set("Accept", "application/json, text/plain, */*");
  request.headers.set("Content-Type", "application/json; charset=utf-8");
  request.headers.set("Authorization", `Bearer ${await getIdToken()}`);
  if (!request.headers.get("projectId") || request.headers.get("projectId") === "0") {
    const projectId = await getProjectId();
    request.headers.set("projectId", `${projectId}`);
  }
  return request;
});

API.interceptors.response.use(
  function (response) {
    response.data.success = true;
    return response.data;
  },
  function (error) {
    error.success = false;
    const response = error.response;
    if (response?.data?.message) {
      error.message = response.data.message;
    }
    return Promise.resolve(error);
  }
);

export { API };
export default instance;
