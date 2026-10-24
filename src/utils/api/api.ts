import axios, { InternalAxiosRequestConfig } from "axios";
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

export let idProject: number | null = null;

const instance = axios.create({
  baseURL: config.API_HOST,
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json; charset=utf-8"
  }
});

interface IError {
  error: boolean;
  message: string;
}

export const fetcher = async (url: string) => {
  return instance
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
        if (error.response?.data) {
          const errorData = error.response.data as IError;
          throw new Error(errorData.message);
        }
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

// set ProjectId in instance
export const setProjectInApi = (projectId: number) => {
  idProject = projectId;
};

// Proyecto seleccionado por el usuario. Si el store aun no se hidrato, se lee
// del mismo almacenamiento que usa el store (localStorage, clave "project").
// Nunca se toma el primer proyecto de la lista: solo el seleccionado, o el
// unico si el usuario tiene uno solo.
export const getProjectId = (): number => {
  if (idProject) return idProject;
  if (typeof window === "undefined") return 0;
  try {
    const project = JSON.parse(localStorage.getItem("project") || "{}");
    const selected = Number(project?.state?.selectedProject?.ID) || 0;
    if (selected) return selected;
    const projects = project?.state?.projectsBasicInfo ?? [];
    return projects.length === 1 ? Number(projects[0]?.ID) || 0 : 0;
  } catch {
    return 0;
  }
};

const setProjectHeader = (request: InternalAxiosRequestConfig) => {
  const projectId = getProjectId();
  if (projectId) request.headers.set("projectId", `${projectId}`);
  else request.headers.delete("projectId");
};

// Un solo interceptor por instancia: axios ejecuta los interceptores de
// request en orden inverso al registro y antes uno pisaba al otro.
instance.interceptors.request.use(async (request) => {
  setProjectHeader(request);
  const token = (await getIdToken(false)) as string;
  request.headers.set("Authorization", `Bearer ${token}`);
  return request;
});

API.interceptors.request.use(async (request) => {
  setProjectHeader(request);
  request.headers.set("Authorization", `Bearer ${await getIdToken()}`);
  return request;
});

API.interceptors.response.use(
  function (response) {
    if (typeof response.data === "string") return response.data;
    response.data.success = true;
    return response.data;
  },
  function (error) {
    error.success = false;
    const response = error.response;
    if (response?.data?.message) {
      error.message = response.data.message;
    }
    throw error;
  }
);

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export { API };
export default instance;
