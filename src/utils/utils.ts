import config from "@/config";
import { ISelectedProject } from "@/lib/slices/createProjectSlice";
import { IChanel } from "@/types/bre/IBRE";
import { CountryCode } from "@/types/global/IGlobal";
import { IComponentPermission } from "@/types/userPermissions/IUserPermissions";

interface Subline {
  id: number;
  description: string;
}

interface MyObject {
  idChannel: number;
  idLine: number;
  subline: Subline;
}
export function removeDuplicatesBySublineId(array: MyObject[]): MyObject[] {
  const uniqueMap = new Map<number, MyObject>();

  array.forEach((item) => {
    const sublineId = item.subline.id;
    if (!uniqueMap.has(sublineId)) {
      uniqueMap.set(sublineId, item);
    }
  });

  const uniqueArray: MyObject[] = Array.from(uniqueMap.values());

  return uniqueArray;
}
export function removeObjectsFromArray(
  originalArray: MyObject[],
  objectsToRemove: MyObject[]
): MyObject[] {
  const objectsToRemoveSet = new Set(objectsToRemove.map((obj) => JSON.stringify(obj)));

  const newArray = originalArray.filter((obj) => !objectsToRemoveSet.has(JSON.stringify(obj)));

  return newArray;
}
export function removeDuplicatesFromArrayNumbers(array: number[]): number[] {
  const uniqueSet = new Set(array);
  const uniqueArray = Array.from(uniqueSet);
  return uniqueArray;
}

export const filterBRbyIdSubline = (brs: any[], sublinesIds: number[]) => {
  if (sublinesIds?.length === 0) return;
  const filteredResults = brs.filter((channel) => {
    if (channel.CHANNEL_LINES) {
      // Filter channels with non-null CHANNEL_LINES
      channel.CHANNEL_LINES = channel.CHANNEL_LINES.filter((line: any) => {
        if (line.sublines?.length > 0) {
          // Filter lines with non-null sublines
          return line?.sublines?.some((subline: any) => sublinesIds?.includes(subline.id));
        }
        return false; // No sublines in this line
      });

      // Keep the channel only if it has lines after filtering
      return channel.CHANNEL_LINES.length > 0;
    }
    return false; // No CHANNEL_LINES in this channel
  });
  return filteredResults;
};

export const transformFormat = (original: any) => {
  const result = [] as any;

  original.forEach((channel: any) => {
    const idChannel = channel.CHANNEL_ID;

    if (channel.CHANNEL_LINES) {
      channel.CHANNEL_LINES.forEach((line: any) => {
        const idLine = line.id;

        if (line.sublines) {
          line.sublines.forEach((subline: any) => {
            const transformedObject = {
              idChannel,
              idLine,
              subline: {
                id: subline.id,
                description: subline.description
              }
            };
            result.push(transformedObject);
          });
        }
      });
    }
  });

  return result;
};

export const extractChannelLineSublines = (brs: IChanel[]) => {
  const extractedData = {
    channels: [] as { id: number; name: string }[],
    lines: [] as { id: number; name: string }[],
    sublines: [] as { id: number; name: string }[]
  };
  brs.forEach((channel) => {
    // Extract channel information
    const channelInfo = {
      id: channel.CHANNEL_ID,
      name: channel.CHANNEL_NAME
    };
    extractedData.channels.push(channelInfo);
    // Extract line information
    if (channel.CHANNEL_LINES) {
      channel.CHANNEL_LINES.forEach((line) => {
        const lineInfo = {
          id: line.id,
          name: line.description
        };
        extractedData.lines.push(lineInfo);

        // Extract subline information
        if (line.sublines) {
          line.sublines.forEach((subline) => {
            const sublineInfo = {
              id: subline.id,
              name: subline.description
            };
            extractedData.sublines.push(sublineInfo);
          });
        }
      });
    }
  });
  return extractedData;
};

export const docTypeIdBasedOnDocType = (documentType: string) => {
  switch (documentType) {
    case "NIT":
      return 1;
    case "Cedula":
      return 2;
    case "Pasaporte":
      return 3;
    case "Cedula de extranjeria":
      return 4;
    default:
      return 0;
  }
};

export function extractSingleParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
export const formatDateBars = (date: string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
};

export const formatDatePlane = (date: string): string => {
  //18 octubre, 2023 en español
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.toLocaleString("es-ES", { month: "long" });
  const day = d.getDate();

  return `${day} ${month}, ${year}`;
};

export const formatDatePlaneWithoutComma = (date: string): string => {
  const [day, month, year] = date.split("/");
  const formattedDate = new Date(`${year}-${month}-${day}`);
  const formattedYear = formattedDate.getFullYear();
  const formattedMonth = formattedDate.toLocaleString("es-ES", { month: "long" });
  const formattedDay = formattedDate.getDate();

  return `${formattedDay} ${formattedMonth}, ${formattedYear}`;
};

export function daysLeft(dateString: string): number {
  const today = new Date();
  const expirationDate = new Date(dateString);

  const diffInMs = expirationDate.getTime() - today.getTime();

  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays;
}

export const insertPeriodEveryThreeDigits = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export function formatMoney(
  amount: string | number | undefined | null,
  countryCode?: CountryCode
): string {
  if (!amount) {
    return "";
  }
  const { currency, id } = countryFormater(countryCode);
  const number = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatter = new Intl.NumberFormat(id, {
    style: "currency",
    currency,
    minimumFractionDigits: 0
  });

  return formatter.format(number);
}

const countryFormater = (currency: CountryCode = "co") => {
  return intFormat[currency];
};

const intFormat = {
  en: { currency: "USD", id: "en-US" },
  eur: { currency: "EUR", id: "en-DE" },
  jpn: { currency: "JPY", id: "ja-JP" },
  ch: { currency: "CNY", id: "zh-CN" },
  kr: { currency: "KRW", id: "ko-KR" },
  es: { currency: "EUR", id: "es-ES" },
  co: { currency: "COP", id: "es-CO" }
};

export const getCityName = (id: number) => {
  const city = locations.find((location) => location.id === id);
  return city?.city;
};

const locations = [
  {
    id: 1,
    city: "Bogotá"
  },
  {
    id: 246,
    city: "Medellin"
  },
  {
    id: 247,
    city: "Cali"
  },
  {
    id: 248,
    city: "Pereira"
  },
  {
    id: 249,
    city: "Barranquilla"
  }
];

export const isNonEmptyObject = (obj: {}) => {
  return !(Object.keys(obj).length === 0 && obj.constructor === Object);
};

export const stringToBoolean = (value: string | boolean | undefined): boolean => {
  if (value === undefined) {
    return false;
  }
  return value === "true" || value === true;
};

export const timeAgo = (date: string): string => {
  const currentDate = new Date();
  const dateToCompare = new Date(date);
  const diffInMs = currentDate.getTime() - dateToCompare.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} minutos`;
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} horas`;
  } else if (diffInDays < 7) {
    return `Hace ${diffInDays} días`;
  } else if (diffInWeeks < 4) {
    return `Hace ${diffInWeeks} semanas`;
  } else {
    return `Hace ${diffInMonths} meses`;
  }
};

export const formatDateAndTime = (date: string): string => {
  const d = new Date(date);
  const day = `0${d.getDate()}`.slice(-2);
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const year = d.getFullYear();
  const hours = `0${d.getHours()}`.slice(-2);
  const minutes = `0${d.getMinutes()}`.slice(-2);
  const period = d.getHours() >= 12 ? "PM" : "AM";

  return `${day}/${month}/${year} - ${hours}:${minutes} ${period}`;
};

export const formatMillionNumber = (number: number | undefined | null): string => {
  if (!number) {
    return "0";
  }

  const formatNumber = number / 1000000;

  if (formatNumber > 1000000) {
    return formatNumber.toFixed(2);
  }
  return formatNumber.toFixed();
};
export const shortenFileName = (fileName: string, maxChars: number = 10): string => {
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex === -1) {
    return fileName.length <= maxChars ? fileName : fileName.substring(0, maxChars);
  }

  const baseName = fileName.substring(0, dotIndex);
  const extension = fileName.substring(dotIndex);

  const maxBaseNameLength = maxChars - extension.length;

  if (baseName.length > maxBaseNameLength) {
    return baseName.substring(0, maxBaseNameLength) + extension;
  }
  return fileName;
};

/**
 * Formatea un número para que no tenga decimales y tenga separador de miles con un punto.
 *
 * @param {number|string} num - El número a formatear, puede ser un número o una cadena.
 * @returns {string} El número formateado como una cadena.
 */
export function formatNumber(num: number | string, decimals = 0) {
  const parsedNum = typeof num === "string" ? parseFloat(num) : num;

  const entireNumber = Math.floor(parsedNum);
  const formattedThousands = entireNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const rest = parsedNum - entireNumber;

  // Convertir el número a una cadena y usar el método replace para añadir separadores de miles
  return decimals
    ? `${formattedThousands},${Math.floor(Math.pow(10, decimals) * rest)}`
    : formattedThousands;
}

export const checkUserViewPermissions = (
  selectedProject: ISelectedProject | undefined,
  view?: string
): boolean => {
  if (config.isLogistics && !view?.includes("TMS")) return false;
  if (!selectedProject) return false;
  if (selectedProject.isSuperAdmin) {
    return true;
  }

  const viewPermissions = selectedProject.views_permissions;
  if (!viewPermissions) {
    return false;
  }

  return viewPermissions.some((permission) => permission.page_name === view);
};

/**
 * Verifie if the user has the required permissions to access a component.
 * the function return the result of the checkFunction
 *
 * @param selectedProject {ISelectedProject | undefined}
 * @param view {string}
 * @param component {string}
 * @param checkFunction {(permission: IComponentPermission) => boolean}
 * @returns {boolean}
 */
export const checkUserComponentPermissions = (
  selectedProject: ISelectedProject | undefined,
  view: string,
  component: string,
  // eslint-disable-next-line no-unused-vars
  checkFunction: (permission: IComponentPermission) => boolean
): boolean => {
  if (config.isLogistics && !view?.includes("TMS")) return false;
  if (!selectedProject) return false;
  if (selectedProject.isSuperAdmin) {
    return true;
  }

  const viewPermissions = selectedProject.views_permissions;
  if (!viewPermissions) {
    return false;
  }

  const haveViewPermission = viewPermissions.find((permission) => permission.page_name === view);
  if (!haveViewPermission) {
    return false;
  }
  console.log(view, component, "asd");
  const componentPermission = haveViewPermission?.components.find(
    (permission) => permission.component_name === component
  );
  if (!componentPermission) {
    return false;
  }
  return checkFunction(componentPermission);
};
