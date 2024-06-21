export interface ICreateShipTo {
  client_id: string;
  accounting_code: string;
  project_id: number;
  depency_client: number;
  description: string;
  zone: number[];
  channel: number[];
  line: number[];
  subline: number[];
  id_address: number;
  condition_payment: number;
  radication_type: number;
}

export type ShipToFormType = {
  shipTo: {
    code: string;
    address: string;
    address_id: number;
    billing_period: string | undefined;
    radication_type: ISelectType | undefined;
    condition_payment: ISelectType | undefined;
    dependency_client: boolean;
  };
};

interface ISelectType {
  value: number;
  label: string;
}

export interface IShipTos {
  status: number;
  message: string;
  data: IShipTo[];
}

export interface IGetOneShipTo {
  status: number;
  message: string;
  data: IShipTo;
}
export interface IShipTo {
  accounting_code: string;
  address_id: number;
  billing_period: string;
  channels: IChannels[];
  city: string;
  client_id: number;
  // condition_day: number;
  condition_payment: number;
  contacts: string;
  dependecy_client: number;
  // full_address: string;
  is_deleted: number;
  lines_info: ILines[];
  //location_id: number;
  project_id: number;
  // radication_name: string;
  radication_type: number;
  shipto_description: string;
  sublines: ISubLines[];
  zones: IZones[];
}

export interface IUpdateShipTo {
  client_id: string;
  depency_client: number;
  id_location: number;
  contacts: any;
  description: string;
  zone: number[];
  channel: number[];
  line: number[];
  subline: number[];
  project_id: number;
}

interface IChannels {
  id: number;
  description: string;
}

interface ILines {
  id: number;
  description: string;
}

interface ISubLines {
  id: number;
  description: string;
}

interface IZones {
  id: number;
  description: string;
}
