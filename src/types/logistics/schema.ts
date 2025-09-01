import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { DocumentCompleteType, IGetCertificate } from "./certificate/certificate";
import { ApiVehicleType } from "@/components/molecules/tabs/logisticsForms/driverForm/driverFormTab.mapper";
import { IRequirement } from "../transferJourney/ITransferJourney";
import { IUploadRequirementstTableRow } from "@/components/organisms/logistics/proveedores/ModalUploadRequirements/ModalUploadRequirements";

export interface IListData {
  id: any;
  data: Data;
  status: number;
  statusText: string;
  headers: WelcomeHeaders;
  config: Config;
  request: Request;
}

export interface ICreateRegister {
  data: WelcomeData;
  status: number;
  statusText: string;
  headers: WelcomeHeaders;
  config: Config;
  request: Request;
}

export interface Config {
  transitional: Transitional;
  adapter: string[];
  transformRequest: null[];
  transformResponse: null[];
  timeout: number;
  xsrfCookieName: string;
  xsrfHeaderName: string;
  maxContentLength: number;
  maxBodyLength: number;
  env: Request;
  headers: ConfigHeaders;
  method: string;
  url: string;
}

export interface Request {}

export interface ConfigHeaders {
  Accept: string;
  Authorization: string;
}

export interface Transitional {
  silentJSONParsing: boolean;
  forcedJSONParsing: boolean;
  clarifyTimeoutError: boolean;
}

export interface Data {
  status: number;
  message: string;
  data: any[];
}

export interface WelcomeHeaders {
  "content-type": string;
}

export interface WelcomeData {
  status: number;
  message: string;
  data: DataData;
}

export interface DataData {
  project_description: string;
  rgb_config: string;
  logo: string;
  nit: string;
  email: string;
  contact: string;
  phone: string;
  address: string;
  country_id: string;
  currency: Currency[];
  user: User;
  uuid: string;
  id: number;
}

export interface Currency {
  id: string;
  currency_name: string;
}

export interface User {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: Firebase;
  uid: string;
}

export interface Firebase {
  identities: Identities;
  sign_in_provider: string;
}

export interface Identities {
  email: string[];
}

export interface IOrderPslCostCenter {
  key: number;
  idpslcostcenter: number;
  descpslcostcenter: string;
  percent: number;
}

export interface IOrderPsl {
  key: number;
  idpsl: number;
  descpsl: string;
  percent: number;
  costcenters: IOrderPslCostCenter[];
}

/* BD SCHEMA */
/**
 * Exposes all fields present in aditional_by_location as a typescript
 * interface.
 */
export interface IAditionalByLocation {
  id: number;
  id_location: number;
  entity_type: number;
  id_vehicle_type: number;
  description: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as AditionalByLocation,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IAditionalByLocationWithDefaults {
  id?: number;
  id_location: number;
  entity_type: number;
  id_vehicle_type: number;
  description: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in aditional_by_material as a typescript
 * interface.
 */
export interface IAditionalByMaterial {
  key: number;
  id: number;
  id_material: number;
  entity_type: number;
  id_vehicle_type: number;
  description: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  quantity: number;
}

/**
 * Exposes the same fields as AditionalByMaterial,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IAditionalByMaterialWithDefaults {
  id?: number;
  id_material: number;
  entity_type: number;
  id_vehicle_type: number;
  description: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in carrier_by_group as a typescript
 * interface.
 */
export interface ICarrierByGroup {
  id: number;
  id_grouplocation: number;
  id_carrier: number;
  status?: string | null;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as CarrierByGroup,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ICarrierByGroupWithDefaults {
  id?: number;
  id_grouplocation: number;
  id_carrier: number;
  status?: string | null;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in carrier_driver as a typescript
 * interface.
 */
export interface ICarrierDriver {
  id: number;
  phone: number;
  email: string;
  document_type: number;
  document: string;
  license: string;
  license_categorie: string;
  license_expiration: Date;
  name: string;
  last_name: string;
  emergency_number: number;
  emergency_contact: string;
  firebaseguid?: string;
  active: boolean;
  rh: string;
  glasses: boolean;
  birth_date: Date;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
  vehicle_type: number[];
  company_id?: number;
}
/**
 * Exposes all fields present in carrier_drivers as a typescript
 * interface.
 */
export interface ICarrierDrivers {
  id: number;
  id_carrier: number;
  id_driver: number;
  start_date: Date;
  end_date: Date;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as CarrierDrivers,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ICarrierDriversWithDefaults {
  id?: number;
  id_carrier: number;
  id_driver: number;
  start_date: Date;
  end_date: Date;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in carrier_pricing_dynamic as a typescript
 * interface.
 */
export interface ICarrierPricingDynamic {
  id: number;
  id_contract: number;
  id_carrier: number;
  id_vehicle_type: number;
  price: number;
  start_date: Date;
  end_date: Date;
  /**  Defaults to: 0. */
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  unit_type: number;
  from_units: number;
  to_units: number;
  price_unit_aditional: number;
  id_carrier_vehicle_contract: number;
}

/**
 * Exposes the same fields as CarrierPricingDynamic,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ICarrierPricingDynamicWithDefaults {
  id?: number;
  id_contract: number;
  id_carrier: number;
  id_vehicle_type: number;
  price: number;
  start_date: Date;
  end_date: Date;
  /**  Defaults to: 0. */
  active?: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  unit_type: number;
  from_units: number;
  to_units: number;
  price_unit_aditional: number;
  id_carrier_vehicle_contract: number;
}
/**
 * Exposes all fields present in carrier_pricing_trips as a typescript
 * interface.
 */
export interface ICarrierPricingTrips {
  id: number;
  id_contract: number;
  id_carrier: number;
  id_vehicle_type: number;
  valid_from: Date;
  valid_to: Date;
  price: number;
  to_location?: any | null;
  /**  Defaults to: 0. */
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  from_location?: any | null;
  id_carrier_vehicle_contract: number;
}

/**
 * Exposes the same fields as CarrierPricingTrips,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ICarrierPricingTripsWithDefaults {
  id?: number;
  id_contract: number;
  id_carrier: number;
  id_vehicle_type: number;
  valid_from: Date;
  valid_to: Date;
  price: number;
  to_location?: any | null;
  /**  Defaults to: 0. */
  active?: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  from_location?: any | null;
  id_carrier_vehicle_contract: number;
}
/**
 * Exposes all fields present in carrier_request as a typescript
 * interface.
 */
export interface ICarrierRequest {
  id: number;
  id_transfer_request: number;
  date_sended: string;
  id_request: number;
  id_carrier: number;
  id_vehicle_type: number;
  id_vehicle: number;
  response: string;
  date_response: string;
  start_date_flexible: number;
  fare: number;
  status: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in carrier_request_detail as a typescript
 * interface.
 */
export interface ICarrierRequestDetail {
  id: number;
  id_service_type: number;
  id_carrier: number;
  service_type: string;
  start_date: string;
  end_date: string;
  id_start_location: number;
  start_location: string;
  id_end_location: number;
  end_location: string;
  status: string;
  created_at: string;
  created_by: string;
  statusdesc: string;
  color: string;
  vehicles: string;
  elapsedtime: string;
  amount: number;
  id_transfer_request: number;
  id_journey: number;
  id_trip: number;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  //geometry
  geometry: any;
  //datos de contacto!
  carrier_request_contacts?: ICarrierRequestContacts[] | null;
  //documentos!
  carrier_request_documents?: ICarrierRequestDocuments[] | null;
  //material!
  carrier_request_material_by_trip?: ICarrierRequestMaterialByTrip[] | null;
  //personas -- aplica para viaje tipo persona!
  carrier_request_persons?: ICarrierRequestPersons[] | null;
  fee_description?: string;
}

/**
 * Exposes all fields present in carrier_request_contacts as a typescript
 * interface.
 */
export interface ICarrierRequestContacts {
  id: number;
  id_transfer_order: number;
  id_contact: number;
  contact_type: number;
  name: string;
  contact_number: number;
  id_psl: number;
  id_cost_center: number | null;
  active: number;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  id_transfer_request: number;
}

/**
 * Exposes all fields present in carrier_request_documents as a typescript
 * interface.
 */
export interface ICarrierRequestDocuments {
  id: number;
  id_transfer_order: number;
  id_document_type: number;
  url_document: string;
  status: string;
  active: number;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  id_transfer_request: number;
  document_type_desc: string;
}
/**
 * Exposes all fields present in carrier_request_material_by_trip as a typescript
 * interface.
 */
export interface ICarrierRequestMaterialByTrip {
  id: number;
  id_transfer_request: number;
  id_transfer_order: number;
  id_trip: number;
  id_material: number;
  units: number;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  material: IMaterial[];
}
/**
 * Exposes all fields present in carrier_request_material_by_persons as a typescript
 * interface.
 */
export interface ICarrierRequestPersons {
  id: number;
  id_transfer_order: number;
  id_user: number;
  id_user_line: number;
  id_user_subline: number;
  active: number;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  id_transfer_request: number;
  id_trip: number;
}
/**
 * Exposes all fields present in carrier_request_drivers as a typescript
 * interface.
 */
export interface ICarrierRequestDrivers {
  active: boolean;
  birth_date: string;
  company: string;
  company_id: number;
  created_at: string;
  created_by: string;
  document: string;
  document_type: number;
  email: string;
  emergency_contact: string;
  emergency_number: number;
  firebaseguid: string;
  glasses: number;
  id: number;
  last_name: string;
  licence: string;
  licence_category: string;
  licence_expiration: string;
  modified_at: string;
  modified_by: string;
  name: string;
  phone: string;
  rh: string;
  status: IStatusWithStyling;
  subject_id: number;
}
/**
 * Exposes all fields present in carrier_request_vehicles as a typescript
 * interface.
 */
export interface ICarrierRequestVehicles {
  active: boolean;
  aditional_info: string;
  brand: string;
  color: string;
  company: string;
  country: string;
  created_at: string;
  created_by: string;
  gps_link: string;
  gps_password: string;
  gps_user: string;
  has_gps: boolean;
  id: number;
  id_carrier: number;
  id_vehicle_type: number;
  line: string;
  model: string;
  modified_at: string;
  modified_by: string;
  plate_number: string;
  status: IStatusWithStyling;
  subject_id: number;
  vehicle_type: string;
  year: number;
}
/**
 * Exposes the same fields as CarrierRequest,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ICarrierRequestWithDefaults {
  id?: number;
  id_transfer_request: number;
  date_sended: string;
  id_request: number;
  id_carrier: number;
  id_vehicle_type: number;
  id_vehicle: number;
  response: string;
  date_response: string;
  start_date_flexible: number;
  fare: number;
  status: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
export interface ICarrierVehicleDetail {
  active: boolean;
  aditional_info: string;
  brand: string;
  color: string;
  country: string;
  created_at: string;
  created_by: string;
  gps_link: string;
  gps_password: string;
  gps_user: string;
  has_gps: boolean;
  id: number;
  id_carrier: number;
  id_vehicle_type: number;
  line: string;
  model: string;
  modified_at: string;
  modified_by: string;
  plate_number: string;
  year: number;
}
/**
 * Exposes all fields present in carrier_vehicles_contracts as a typescript
 * interface.
 */
export interface ICarrierVehiclesContracts {
  id: number;
  id_contract: number;
  id_carrier: number;
  id_vehicle: number;
  start_date: Date;
  end_date: Date;
  periodicyty: string;
  contract_type: number;
  price_unit: number;
  current_location_lat?: number | null;
  /**  Defaults to: 0. */
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  current_location_lng?: number | null;
}

/**
 * Exposes the same fields as CarrierVehiclesContracts,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ICarrierVehiclesContractsWithDefaults {
  id?: number;
  id_contract: number;
  id_carrier: number;
  id_vehicle: number;
  start_date: Date;
  end_date: Date;
  periodicyty: string;
  contract_type: number;
  price_unit: number;
  current_location_lat?: number | null;
  /**  Defaults to: 0. */
  active?: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  current_location_lng?: number | null;
}
/**
 * Exposes all fields present in carriers as a typescript
 * interface.
 */
export interface ICarriers {
  id: number;
  description: string;
  nit: string;
  icon: string;
  active: string;
  created_at: Date;
  created_by: Date;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as Carriers,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ICarriersWithDefaults {
  id?: number;
  description: string;
  nit: string;
  icon: string;
  active: string;
  created_at: Date;
  created_by: Date;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in certificates as a typescript
 * interface.
 */
export interface ICarriersRequestList {
  statusid: string;
  description: string;
  color: string;
  carrierrequests: ICarrierRequestsListDetail[];
}
/**
 * Exposes all fields present in certificates as a typescript
 * interface.
 */
export interface ICarrierRequestsListDetail {
  id: number;
  order_nro: number;
  id_transfer_request: number;
  service_type: string;
  start_date: string;
  end_date: string;
  start_location: string;
  end_location: string;
  vehicles: string;
  elapsedtime: string;
  amount: number;
}
/**
 * Exposes all fields present in certificates as a typescript
 * interface.
 */
export interface ICertificates {
  id: number;
  entity_type: number;
  id_entity: number;
  url_archive: string;
  start_date: Date;
  expiration_date: Date;
  upload_date: Date;
  status: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_document_type: number;
  template: string;
}

/**
 * Exposes the same fields as Certificates,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ICertificatesWithDefaults {
  id?: number;
  entity_type: number;
  id_entity: number;
  url_archive: string;
  start_date: Date;
  expiration_date: Date;
  upload_date: Date;
  status: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in contracts as a typescript
 * interface.
 */
export interface IContracts {
  id: number;
  description: string;
  url_archive: string;
  id_carrier: number;
  total_amount: number;
  start_date: Date;
  end_date: Date;
  status: string;
  /**  Defaults to: curdate(). */
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  standby_hours: number;
  id_contract_type: number;
}

/**
 * Exposes the same fields as Contracts,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IContractsWithDefaults {
  id?: number;
  description: string;
  url_archive: string;
  id_carrier: number;
  total_amount: number;
  start_date: Date;
  end_date: Date;
  status: string;
  /**  Defaults to: curdate(). */
  created_at?: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  standby_hours: number;
  id_contract_type: number;
}
/**
 * Exposes all fields present in contracts_extension as a typescript
 * interface.
 */
export interface IContractsExtension {
  id: number;
  id_contract: number;
  url_archive: string;
  id_carrier: number;
  total_amount: number;
  current_amount: number;
  status: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as ContractsExtension,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IContractsExtensionWithDefaults {
  id?: number;
  id_contract: number;
  url_archive: string;
  id_carrier: number;
  total_amount: number;
  current_amount: number;
  status: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in contracts_types as a typescript
 * interface.
 */
export interface IContractsTypes {
  id: number;
  description: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as ContractsTypes,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IContractsTypesWithDefaults {
  id?: number;
  description: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in driver_by_carrier_request as a typescript
 * interface.
 */
export interface IDriverByCarrierRequest {
  id: number;
  id_transfer_request: number;
  id_driver: number;
  id_vehicle: number;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  driver: ICarrierDriver;
  vehicle: ICarrierVehicleDetail;
}
/**
 * Exposes the same fields as DriverByCarrierRequest,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IDriverByCarrierRequestWithDefaults {
  id?: number;
  id_driver: number;
  id_vehicle: number;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in drivers as a typescript
 * interface.
 */
export interface IStatus {
  description: string;
  color: string;
}
export interface IDrivers {
  id: number;
  name: string;
  last_name: string;
  document_type: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  phone: string;
  document: string;
  licence: string;
  licence_category?: string | null;
  licence_expiration: Date;
  emergency_number: number;
  emergency_contact: string;
  status: IStatus;
}

/**
 * Exposes the same fields as Drivers,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IDriversWithDefaults {
  id?: number;
  name: string;
  last_name: string;
  document_type: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  phone: string;
  document: string;
  licence: string;
  licence_category?: string | null;
  licence_expiration: Date;
  emergency_number: number;
  emergency_contact: string;
}
/**
 * Exposes all fields present in group_by_location as a typescript
 * interface.
 */
export interface IGroupByLocation {
  id: number;
  description: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  city_id: number;
  geojson?: string | null;
}

/**
 * Exposes the same fields as GroupByLocation,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IGroupByLocationWithDefaults {
  id?: number;
  description: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  city_id: number;
  geojson?: string | null;
}
/**
 * Exposes all fields present in incidents as a typescript
 * interface.
 */
export interface IIncidents {
  id: number;
  id_trip: number;
  incident_type: number;
  url_archive: string;
  description: string;
  incident_date: Date;
  status: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as Incidents,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IIncidentsWithDefaults {
  id?: number;
  id_trip: number;
  incident_type: number;
  url_archive: string;
  description: string;
  incident_date: Date;
  status: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

export interface IState {
  id: number;
  id_country: number;
  description: string;
  codigodane: string;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
}

export interface ICity {
  id: number;
  id_state: number;
  description: string;
  codigodane: string;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
}

export interface ILocationTypes {
  id: number;
  description: string;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
}

export interface IFormLocation {
  general: ILocation;
  files?: DocumentCompleteType[];
  images: CustomFile[];
  IS_ACTIVE: boolean;
}

export interface IGroupLocation {
  id: number;
  name: string;
}

export interface IRouteSecure {
  id: number;
  id_start_location?: number;
  id_end_location?: number;
  id_start_group_location?: number;
  id_end_group_location?: number;
  active: boolean;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
  waypoints: RouteSecureWayPoints[];
}

export interface RouteSecureWayPoints {
  id: number;
  id_route_secure: number;
  description: string;
  latitude: string;
  longitude: string;
  order: number;
  active: boolean;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
}

/**
 * Exposes all fields present in location as a typescript
 * interface.
 */
export interface ILocation {
  id: number;
  description: string;
  city_id: number;
  postal_code: string;
  url_location: string;
  latitude: number;
  longitude: number;
  location_type: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  precision_radio?: number;
  zone_id?: number;
  state_id?: number;
  group_location_id?: string;
  additional_info: string;
  contact_name: string;
  contact_number: string;
  user: string;
  is_community: boolean;
  community_name: string;
  documents?: any[];
}

export interface ITripType {
  id: number;
  description: string;
  idEntityType: number;
}
/**
 * Exposes all fields present in driver as a typescript
 * interface.
 */
export interface IAPIDriver {
  id: number;
  name: string;
  last_name: string;
  document: string;
  document_type: number;
  licence: string;
  licence_category: string;
  licence_expiration: string;
  birth_date: string;
  email: string;
  phone: string;
  rh: string;
  glasses: boolean; // originalmente 0 o 1
  emergency_contact: string;
  emergency_number: number;
  photo: string | null;
  firebaseguid: string;
  firebase_push_token: string | null;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  active: boolean; // originalmente 0 o 1
  subject_id?: number;
  documents: IProviderDocument[];
  features: Ifeature[]; // igual que arriba
  vehicle_type: ApiVehicleType[]; // idem
  status: {
    id: number;
    name: string;
    color: string;
    backgroundColor: string;
  };
}
export interface IFormGeneralDriver {
  id: number;
  phone: string;
  email: string;
  document_type: number;
  vehicle_type: { label: string; value: number }[];
  document: string;
  license: string;
  license_category: number | string;
  license_expiration: Date;
  name: string;
  last_name: string;
  emergency_number: string;
  emergency_contact: string;
  photo?: string;
  rh: string;
  glasses: any;
  birth_date: Date;
  trip_type: { label: string; value: number }[];
}

export interface IGeneralDriverSubmit extends Omit<IFormGeneralDriver, "vehicle_type"> {
  license_categorie: string;
  rhval: string;
  vehicle_type: number[];
  documents: IProviderDocument[];
}

export interface IProviderDocument extends IGetCertificate {
  expiryDate: string;
}
/**
 * Exposes all fields present in vehicle as a typescript
 * interface.
 */
export interface IVehicle {
  id: number;
  id_carrier: number;
  id_vehicle_type: number;
  plate_number: string;
  brand: string;
  line: string;
  model: string;
  year: number;
  color: string;
  country: string;
  aditional_info: string;
  gps_link: string;
  gps_user: string;
  gps_password: string;
  has_gps: boolean;
  active: boolean; // originalmente 0 o 1
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  status: {
    id: number;
    name: string;
    color: string;
    backgroundColor: string;
  };
  subject_id: number;
  documents: IProviderDocument[];
  features?: { id: number }[];
  images?: { url_archive: string }[];
}
/**
 * Exposes all fields present in carrier as a typescript
 * interface.
 */
export interface ICarrier {
  id: number;
  description: string;
  nit: string;
  icon: string;
  active: any;
  vehicles: any;
  drivers: any;
  carrier_type: number;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  photo?: string;
  trip_type: { label: string; value: number }[];
  status: IStatus;
  group_location_ids: number[];
}
export interface IAPICarrier {
  id: number;
  description: string;
  nit: string;
  icon: string;
  active: any;
  vehicles: any;
  drivers: any;
  carrier_type: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  photo?: string;
  features: Ifeature[];
  status: IStatus;
  documents: any[];
}
/**
 * Exposes the same fields as Location,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ILocationWithDefaults {
  id?: number;
  description: string;
  city_id: number;
  postal_code: string;
  url_location: string;
  latitude: number;
  longitude: number;
  location_type: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in location_by_grouplocation as a typescript
 * interface.
 */
export interface ILocationByGrouplocation {
  id: number;
  id_location: number;
  id_grouplocation: number;
  status?: string | null;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as LocationByGrouplocation,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ILocationByGrouplocationWithDefaults {
  id?: number;
  id_location: number;
  id_grouplocation: number;
  status?: string | null;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

export interface IEntityType {
  id: number;
  description: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
}

export interface IDocumentsType {
  id: string;
  entity_type: number;
  description: string;
  optional: string;
  id_location: number;
  id_material_type: number;
  expiry: string;
  template: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
}

/**
 * Exposes all fields present in material as a typescript
 * interface.
 */
export interface IMaterial {
  key: number;
  id: number;
  description: string;
  id_type_material: number;
  kg_weight: number;
  mt_height: number;
  mt_width: number;
  mt_length: number;
  m3_volume: number;
  rotation: string;
  can_stack: string;
  image: string;
  aditional_info?: string | null;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  icon: string;
  restriction?: string | null;
  code_sku: string;
  type_description: string;
  quantity: number;
  material_type: IMaterialTypeByMaterial[];
  material_transport: IMaterialTransportByMaterial[];
}

export interface IFormMaterial {
  general: IMaterial;
  images: CustomFile[];
}

/**
 * Exposes the same fields as Material,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IMaterialWithDefaults {
  id?: number;
  description: string;
  id_type_material: number;
  kg_weight: number;
  mt_height: number;
  mt_width: number;
  mt_length?: number | null;
  m3_volume: number;
  rotation: string;
  can_stack: string;
  image: string;
  aditional_info?: string | null;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  icon: string;
  restriction?: string | null;
}
/**
 * Exposes all fields present in material_type as a typescript
 * interface.
 */
export interface IMaterialType {
  id: number;
  description: string;
  line: string;
  subline: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes all fields present in material_type as a typescript
 * interface.
 */
export interface IMaterialTransportType {
  id: number;
  description: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as MaterialType,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IMaterialTypeWithDefaults {
  id?: number;
  description: string;
  line: string;
  subline: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes all fields present in material_type as a typescript
 * interface.
 */
export interface IMaterialTransport {
  id: number;
  description: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

export interface IMaterialTypeByMaterial {
  id: string;
  id_material: number;
  id_material_type: number;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
}

export interface IMaterialTransportByMaterial {
  id: string;
  id_material: number;
  id_material_transport_type: number;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
}

export interface IOtherRequirements {
  id: number;
  description: string;
  is_incident: string;
  active: Boolean;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
}

export interface ITransferOrderOtherRequirements {
  key: number;
  id: number;
  id_transfer_order: number;
  id_other_requeriments: number;
  quantity: number;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
  other_requirement_desc: string;
  description: string;
}

export interface ITransferOrderVehicle {
  id: number;
  id_transfer_order: number;
  id_vehicle_type: number;
  quantity: number;
  created_at: Date;
  created_by: string | null | undefined;
  modified_at: Date;
  modified_by: string;
  vehicle_type_desc: string;
}

export interface ITransferOrderMaterial {
  id: number;
  id_transfer_order: number;
  id_material: number;
  quantity: number;
  created_at: Date;
  created_by: string | null | undefined;
  modified_at: Date;
  modified_by: string;
  material?: IMaterial[];
}

export interface ISubsidiary {
  id: number;
  description: string;
  active: Boolean;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
}

export interface IPsl {
  id: number;
  descpsl: string;
  idcc: number;
  desccc: string;
}
/**
 * Exposes all fields present in transfer_orders_request as a typescript
 * interface.
 */
export interface ITransferOrdersRequest {
  orders: ITransferOrderRequest[];
  tracking: ITrackingResponse[];
}
/**
 * Exposes all fields present in transfer_request_tracking as a typescript
 * interface.
 */
export interface ITrackingPartial {
  order_to: number;
  id_end_location: number;
  id_start_location: number;
  end_date: string;
  start_date: string;
  id_type_service: number;
}

export interface ITrackingResponse extends ITrackingPartial {
  start_location_desc: string;
  end_location_desc: string;
  type_service_desc: string;
  is_community: 0 | 1;
  community_name: string;
  id?: number;
  start_group_location_desc: string | null;
  end_group_location_desc: string | null;
}

/**
 * Exposes all fields present in transfer_order_request as a typescript
 * interface.
 */
export interface ITransferOrderRequest {
  id: number;
  id_service_type: number;
  id_user: number;
  id_start_location: number;
  id_end_location: number;
  start_date: string;
  end_date: string;
  start_freight_equipment: boolean;
  end_freight_equipment: boolean;
  rotation: boolean;
  start_date_flexible: number;
  end_date_flexible: number;
  id_route: string;
  id_company: number;
  id_client: number;
  status: string;
  active: boolean;
  created_at: string;
  created_by: string;
  created_by_user?: string;
  modified_at: string;
  modified_by: string;
  observation: string;
  freight_origin_time: number;
  freight_destination_time: number;
  service_type_desc: string;
  client_desc: string;
  start_location?: ILocation | null | undefined;
  end_location?: ILocation | null | undefined;
  contract_number?: string;
  declared_cargo_value?: number;
  //geometry
  geometry: any;
  //datos de contacto
  transfer_order_contacts?: ITransferOrderRequestContacts[] | null;
  //centros de costo
  transfer_order_cost_center?: ITransferOrderCostCenter[] | null;
  //documentos
  transfer_order_documents?: ITransferOrderDocuments[] | null;
  //materiales
  transfer_order_material?: ITransferOrderRequestMaterials[] | null;
  //other_requirements
  transfer_order_other_requeriments?: ITransferOrderRequestOtherRequeriments[] | null;
  //personas
  transfer_order_persons?: ITransferOrderPersons[] | null;
  //productos
  transfer_order_products?: ITransferOrderProducts[] | null;
  //vehiculos
  transfer_order_vehicles?: ITransferOrderRequestVehicles[] | null;
  //journey
  transfer_order_journey?: ITransferOrderRequestJourney[] | null;
  //psls
  transfer_order_psl?: ITransferOrderPsls[] | null;
}
/**
 * Exposes all fields present in transfer_order_request_contacts as a typescript
 * interface.
 */
export interface ITransferOrderRequestContacts {
  id: number;
  id_transfer_order: number;
  id_contact: number;
  contact_type: number;
  name: string;
  contact_number: string;
  cost_center_desc: string;
  psl_desc: string;
  id_psl: string;
  id_cost_center: string;
  active: number;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  id_transfer_request?: number;
}
/**
 * Exposes all fields present in transfer_order_request_materials as a typescript
 * interface.
 */
export interface ITransferOrderRequestMaterials {
  id: number;
  id_transfer_order: number;
  id_material: number;
  quantity: number;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  units?: number;
  id_trip?: number;
  id_transfer_request?: number;
  material: IMaterial[];
}
/**
 * Exposes all fields present in transfer_order_request_materials as a typescript
 * interface.
 */
export interface ITransferOrderRequestOtherRequeriments {
  id: number;
  id_transfer_order: number;
  id_other_requeriments: number;
  quantity: number;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  other_requirement_desc: string;
}
/**
 * Exposes all fields present in transfer_order_request_vehicles as a typescript
 * interface.
 */
export interface ITransferOrderRequestVehicles {
  id: number;
  id_transfer_order: number;
  id_vehicle_type: number;
  quantity: number;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  id_journey: number | string | null | undefined;
  vehicle_type_desc: string;
}
/**
 * Exposes all fields present in transfer_order_request_journey as a typescript
 * interface.
 */
export interface ITransferOrderRequestJourney {
  id: number;
  id_transfer_order: number;
  id_start_location: number;
  id_end_location: number;
  id_type_service: number;
  order_to?: number;
  created_at: number;
  created_by: number;
  modified_at: number | null;
  modified_by: number | null;
  order_tr?: number;
  start_date: string;
  end_date: string;
  id_route: string;
  start_location_desc: string;
  end_location_desc: string;
}
/**
 * Exposes all fields present in transfer_order_request_cost_center as a typescript
 * interface.
 */
export interface ITransferOrderRequestCostCenter {
  id: number;
  id_transfer_order: number;
  id_costcenter: number;
  percentage: number;
  active: number;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  id_transfer_request: number;
  cost_center_desc: string;
}
/**
 * Exposes all fields present in transfer_request_step_one as a typescript
 * interface.
 */
export interface ITransferRequestStepOne {
  id: number;
  id_service_type: number;
  service_type: number | null;
  start_date: string;
  end_date: string;
  id_start_location: number;
  id_end_location: number;
  status: string;
  created_at: string;
  created_by: string;
  statusdesc: string | null;
  color: string | null;
  start_location?: ILocation | null | undefined;
  end_location?: ILocation | null | undefined;
  //geometry
  geometry: any;
  //datos de contacto
  transfer_request_contacts?: ITransferOrderRequestContacts[] | null;
  //centros de costo
  transfer_request_cost_center?: ITransferOrderRequestCostCenter[] | null;
  //documentos
  transfer_request_documents?: ITransferOrderDocuments[] | null;
  //journey
  transfer_request_journey?: ITransferOrderRequestJourney[] | null;
  //materiales
  transfer_request_material?: ITransferRequestStepOneMaterial[];
  //materiales por viaje
  transfer_request_material_by_trip?: [] | null;
  //conductores por pedido de provedor
  driver_by_carrier_request?: [] | null;
  //vehiculos sugeridos
  transfer_request_vehicles_sugest?: [] | null;
  //pedidos de viaje
  transfer_request_trips?: [] | null;
  //other_requirements
  transfer_request_other_requeriments?: ITransferOrderRequestOtherRequeriments[] | null;
  //personas
  transfer_request_persons?: ITransferOrderRequestContacts[] | null;
  //productos
  transfer_request_products?: ITransferOrderProducts[] | null;
  //vehiculos
  transfer_request_vehicles?: ITransferOrderRequestVehicles[] | null;
}
/**
 * Exposes all fields present in transfer_request_step_one_material as a typescript
 * interface.
 */
export interface ITransferRequestStepOneMaterial {
  id: number;
  id_material: number;
  units: number;
  id_trip: number;
  id_transfer_order: number;
  id_transfer_request: number;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  material: IMaterialStepOne[];
}
/**
 * Exposes all fields present in material_step_one as a typescript
 * interface.
 */
export interface IMaterialStepOne {
  id: number;
  description: string;
  id_type_material: number;
  kg_weight: number;
  mt_height: number;
  mt_width: number;
  mt_length: number;
  m3_volume: number;
  rotation: boolean;
  can_stack: boolean;
  image: string;
  aditional_info: string;
  active: boolean;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  icon: string;
  restriction: boolean;
  code_sku: string | null;
}
/**
 * Exposes all fields present in transfer_request_journey_step_one as a typescript
 * interface.
 */
export interface ITransferRequestJourneyStepOne {
  id: number;
  id_transfer_order: number;
  id_transfer_request: number;
  id_start_location: number;
  id_end_location: number;
  start_date: string;
  end_date: string;
  id_type_service: number;
  order_tr: number;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  id_route: string;
  start_location_desc: string;
  end_location_desc: string;
}
/**
 * Exposes all fields present in transfer_request_material_step_one as a typescript
 * interface.
 */
export interface ITransferRequestMaterialStepOne {
  id: number;
  id_material: number;
  units: number;
  id_trip: number;
  id_transfer_order: number;
  id_transfer_request: number;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
}
/**
 * Exposes all fields present in transfer_order_request_vehicles_asignation as a typescript
 * interface.
 */
export interface ITransferRequestCreation {
  general?: ITransferRequestGeneral;
  stepOne: {
    transferOrders: ITransferOrderRequest[];
    transferRequest?: ITransferRequestStepOne[];
    transferRequestJourneys?: ITransferRequestJourneyStepOne[];
    transferRequestMaterial?: ITransferRequestMaterialStepOne[];
  };
  stepTwo?: {
    journey?: ITransferRequestJourneyInfo[];
  };
  stepThree?: {
    journey?: ITransferRequestJourneyReview[];
  };
}
/**
 * Exposes all fields present in transfer_request_vehicles_sugest as a typescript
 * interface.
 */
export interface ITransferRequestGeneral {
  transferRequestVehiclesSugest: ITransferRequestVehicleSugest[];
  was_completed: boolean;
}

interface ITransferRequestVehicleSugest {
  id: number;
  id_transfer_order: number;
  id_transfer_request: number;
  id_vehicle_type: number;
  units: number;
  vehicle_type_desc: string;
}
/**
 * Exposes all fields present in transfer_request_journey_info as a typescript
 * interface.
 */
export interface ITransferRequestJourneyInfo {
  id_journey: number;
  id: number;
  id_transfer_order: number;
  id_transfer_request: number;
  id_start_location: number;
  id_end_location: number;
  start_date: string;
  end_date: string;
  id_type_service: number;
  order_tr: number;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  id_route: string;
  start_location_desc: string;
  end_location_desc: string;
  trips: IVehiclesPricingTrips[];
  otherRequirements: IRequirement[];
  is_community: 0 | 1;
  community_name: string;
  end_date_flexible: number;
  start_date_flexible: number;
  route: any;
  distance: number;
  id_route_backup: string | null;
  fixed_rate: number;
  start_group_location_desc: string | null;
  end_group_location_desc: string | null;
}
/**
 * Exposes all fields present in transfer_request_journey_review as a typescript
 * interface.
 */
export interface ITransferRequestJourneyReview {
  id_journey: number;
  start_date: string;
  end_date: string;
  start_location_desc: string;
  end_location_desc: string;
  service_type: number;
  is_community: 0 | 1;
  community_name: string;
  trips: TripCarriersPricing[];
  otherRequirements: TripCarriersPricing[];
  start_group_location_desc?: string | null;
  end_group_location_desc?: string | null;
}
export interface TripCarriersPricing {
  id_trip: number;
  id_tr_other_requirement: number;
  vehicle_type: number;
  vehicle_type_desc: string;
  start_date: string;
  end_date: string;
  start_location_desc: string;
  end_location_desc: string;
  carriers_pricing: CarriersPricing[];
}

export interface CarriersPricing {
  carrier: string;
  order_nro: number;
  plate_number: string;
  id_vehicle: number;
  driver: string;
  phone: any;
  driver_contract: string;
  driver_overcost: number;
  driver_delay: number;
  diver_trips: number;
  driver_score: number;
  driver_id: number;
  id: number;
  id_carrier: number;
  id_service_type: number;
  service_type: string;
  start_date: string;
  end_date: string;
  id_start_location: number;
  start_location: string;
  id_end_location: number;
  end_location: string;
  status: string;
  created_at: string;
  created_by: string;
  statusdesc: string;
  color: string;
  vehicles: string;
  elapsedtime: string;
  amount: number;
  id_transfer_request: number;
  id_journey: number;
  id_trip: number;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  volume: number;
  weight: number;
  observations: string | null;
}
/**
 * Exposes all fields present in transfer_order as a typescript
 * interface.
 */
export interface ITransferOrder {
  id: number;
  id_service_type: string;
  service_type_desc: TripType;
  id_user: number;
  user: string | null | undefined;
  id_start_location: number;
  id_end_location: number;
  start_date?: string;
  end_date?: string;
  start_freight_equipment: boolean | string;
  end_freight_equipment: boolean | string;
  freight_origin_time?: number;
  freight_destination_time?: number;
  rotation: string;
  start_date_flexible: number;
  end_date_flexible: number;
  id_route: string;
  id_company: number;
  id_client: number;
  client_desc: string;
  status: string;
  active: string;
  created_at?: string | null | undefined;
  created_by?: string | null | undefined;
  created_by_user?: string;
  modified_at?: string | null | undefined;
  modified_by?: string | null | undefined;
  observation: string | null | undefined;
  start_location?: ILocation | null | undefined;
  end_location?: ILocation | null | undefined;
  contractNumber?: string;
  declaredCargoValue?: number;
  isFixedRate?: string; // "0" or "1"
  //geometry
  geometry: any;
  //datos de contacto
  transfer_order_contacts?: ITransferOrderContacts[] | null;
  //centros de costo
  transfer_order_cost_center?: ITransferOrderCostCenter[] | null;
  //documentos
  transfer_order_documents?: ITransferOrderDocuments[] | null;
  //material
  transfer_order_material?: ITransferOrderMaterial[] | null;
  //requerimientos adicionales
  transfer_order_other_requeriments?: ITransferOrderOtherRequirements[] | null;
  //personas -- aplica para viaje tipo persona
  transfer_order_persons?: ITransferOrderPersons[] | null;
  //productos
  transfer_order_products?: ITransferOrderProducts[] | null;
  //vehiculo sugerido
  transfer_order_vehicles?: ITransferOrderVehicle[] | null;
  //psls y ccs asociados
  transfer_order_psl?: ITransferOrderPsls[] | null;
}

export interface IFormTransferOrder {
  body: ITransferOrder;
  files?: IDocumentCompleted[];
}

export interface ITransferOrderList {
  color: string;
  description: string;
  statusid: string;
  trasnferorderrequests: TransferOrderListItems[];
}

export interface TransferOrderListItems {
  id: number;
  id_service_type: number;
  service_type: string;
  start_date: string;
  end_date: string;
  id_start_location: number;
  start_location: string;
  id_end_location: number;
  end_location: string;
  status: string;
  created_at: string;
  created_by: string;
  time: string;
  amount: string;
}

/**
 * Exposes the same fields as TransferOrder,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferOrderWithDefaults {
  id?: number;
  id_user: number;
  id_start_location: number;
  id_end_location: number;
  start_date: Date;
  end_date: Date;
  start_freight_equipment: string;
  end_freight_equipment: string;
  rotation: string;
  start_date_flexible: number;
  end_date_flexible: number;
  image: string;
  id_company: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in transfer_order_by_transfer_request as a typescript
 * interface.
 */
export interface ITransferOrderByTransferRequest {
  id: number;
  id_transfer_order: number;
  id_transfer_request: number;
  datastamp: Date;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as TransferOrderByTransferRequest,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferOrderByTransferRequestWithDefaults {
  id?: number;
  id_transfer_order: number;
  id_transfer_request: number;
  datastamp: Date;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in transfer_order_contacts as a typescript
 * interface.
 */
export interface ITransferOrderContacts {
  key: number;
  id: number;
  id_transfer_order: number;
  id_contact: number;
  contact_type: number;
  name: string;
  contact_number: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as TransferOrderContacts,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferOrderContactsWithDefaults {
  id?: number;
  id_transfer_order: number;
  id_contact: number;
  contact_number: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  contact_type: number;
}
/**
 * Exposes all fields present in transfer_order_cost_center as a typescript
 * interface.
 */
export interface ITransferOrderCostCenter {
  id: number;
  id_transfer_order: number;
  id_psl: number;
  id_costcenter: number;
  cost_center_desc: string;
  percentage: number;
  active: string;
  created_at: Date;
  created_by: string | null | undefined;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as TransferOrderCostCenter,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferOrderCostCenterWithDefaults {
  id?: number;
  id_transfer_order: number;
  id_costcenter: number;
  percentage: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in transfer_order_documents as a typescript
 * interface.
 */
export interface ITransferOrderDocuments {
  id: number;
  id_transfer_order: number;
  id_document_type: number;
  document_type_desc: string;
  url_document: string;
  status: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

export type TransferOrderDocumentType = ITransferOrderDocuments & { file: File | undefined } & {
  expirationDate: any;
} & { link?: string } & { description: any };

/**
 * Exposes the same fields as TransferOrderDocuments,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferOrderDocumentsWithDefaults {
  id?: number;
  id_transfer_order: number;
  id_document_type: number;
  url_document: string;
  status: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in transfer_order_persons as a typescript
 * interface.
 */
export interface ITransferOrderPersons {
  key: number;
  id: number;
  id_transfer_order: number;
  id_user: number;
  id_user_line: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_user_subline: number;
  name: string;
  contact_number: string;
  id_psl: number;
  psl_desc: string;
  id_cost_center: number;
  cost_center_desc: string;
  quantity: number;
}

/**
 * Exposes the same fields as TransferOrderPersons,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferOrderPersonsWithDefaults {
  id?: number;
  id_transfer_order: number;
  id_user: number;
  id_user_line: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_user_subline: number;
}
/**
 * Exposes all fields present in transfer_order_products as a typescript
 * interface.
 */
export interface ITransferOrderProducts {
  id: number;
  id_transfer_order: number;
  id_product: number;
  units: number;
  active: string;
  created_at: Date;
  created_by: string | null | undefined;
  modified_at?: Date | null;
  modified_by?: string | null;
  product_desc: string;
}

/**
 * Exposes the same fields as TransferOrderProducts,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferOrderProductsWithDefaults {
  id?: number;
  id_transfer_order: number;
  id_product: number;
  units: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in transfer_request as a typescript
 * interface.
 */
export interface ITransferRequest {
  id: number;
  id_trip: number;
  id_start_location: number;
  id_end_location: number;
  start_date: Date;
  end_date: Date;
  start_freight_equipment: string;
  end_freight_equipment: string;
  start_date_flexible: number;
  end_date_flexible: number;
  id_company: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_user: number;
}
/**
 * Exposes all fields present in transfer_request_detail as a typescript
 * interface.
 */
export interface ITransferRequestDetail {
  id: number;
  id_service_type: string;
  service_type: string;
  id_user: number;
  user: string | null | undefined;
  id_start_location: number;
  id_end_location: number;
  start_date?: string;
  end_date?: string;
  start_freight_equipment: string;
  end_freight_equipment: string;
  rotation: string;
  start_date_flexible: number;
  end_date_flexible: number;
  id_route: string;
  id_company: number;
  id_client: number;
  client_desc: string;
  status: string;
  active: string;
  vehicles: string;
  amount: string;
  created_at?: string | null | undefined;
  created_by?: string | null | undefined;
  modified_at?: string | null | undefined;
  modified_by?: string | null | undefined;
  observation: string | null | undefined;
  start_location?: ILocation | null | undefined;
  end_location?: ILocation | null | undefined;
  //geometry
  geometry: any;
  //datos de conductores
  driver_by_carrier_request?: IDriverByCarrierRequest[] | null;
  //datos de contacto
  transfer_request_contacts?: ITransferRequestContacts[] | null;
  //centros de costo
  transfer_request_cost_center?: ITransferRequestCostCenter[] | null;
  //documentos
  transfer_request_documents?: ITransferRequestDocuments[] | null;
  //material
  transfer_request_material?: ITransferRequestMaterial[] | null;
  //requerimientos adicionales
  transfer_request_other_requeriments?: ITransferRequestOtherRequirements[] | null;
  //personas -- aplica para viaje tipo persona
  transfer_request_persons?: ITransferRequestPersons[] | null;
  //productos
  transfer_request_products?: ITransferRequestProducts[] | null;
  //vehiculo sugerido
  transfer_request_vehicles_sugest?: ITransferRequestVehicle[] | null;
}

/**
 * Exposes the same fields as TransferRequest,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferRequestWithDefaults {
  id?: number;
  id_trip: number;
  id_start_location: number;
  id_end_location: number;
  start_date: Date;
  end_date: Date;
  start_freight_equipment: string;
  end_freight_equipment: string;
  start_date_flexible: number;
  end_date_flexible: number;
  id_company: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_user: number;
}
/**
 * Exposes all fields present in transfer_request_contacts as a typescript
 * interface.
 */
export interface ITransferRequestContacts {
  id: number;
  id_transfer_order: number;
  id_contact: number;
  contact_number: number;
  contact_type: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_transfer_request: number;
}

/**
 * Exposes the same fields as TransferRequestContacts,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferRequestContactsWithDefaults {
  id?: number;
  id_transfer_order: number;
  id_contact: number;
  contact_number: number;
  contact_type: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_transfer_request: number;
}
/**
 * Exposes all fields present in transfer_request_cost_center as a typescript
 * interface.
 */
export interface ITransferRequestCostCenter {
  id: number;
  id_transfer_order: number;
  id_costcenter: number;
  percentage: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_transfer_request: number;
}

/**
 * Exposes the same fields as TransferRequestCostCenter,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferRequestCostCenterWithDefaults {
  id?: number;
  id_transfer_order: number;
  id_costcenter: number;
  percentage: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_transfer_request: number;
}
/**
 * Exposes all fields present in transfer_request_documents as a typescript
 * interface.
 */
export interface ITransferRequestDocuments {
  id: number;
  id_transfer_order: number;
  id_document_type: number;
  url_document: string;
  status: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_transfer_request: number;
  document_type_desc: string;
}
/**
 * Exposes all fields present in transfer_request_material as a typescript
 * interface.
 */
export interface ITransferRequestMaterial {
  concat: any;
  id: number;
  id_transfer_order: number;
  id_material: number;
  quantity: number;
  created_at: Date;
  created_by: string | null | undefined;
  modified_at: Date;
  modified_by: string;
  material?: IMaterial[];
}
/**
 * Exposes all fields present in transfer_request_other_requirements as a typescript
 * interface.
 */
export interface ITransferRequestOtherRequirements {
  key: number;
  id: number;
  id_transfer_order: number;
  id_other_requeriments: number;
  quantity: number;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
  other_requirement_desc: string;
}

/**
 * Exposes the same fields as TransferRequestDocuments,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferRequestDocumentsWithDefaults {
  id?: number;
  id_transfer_order: number;
  id_document_type: number;
  url_document: string;
  status: string;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_transfer_request: number;
}
/**
 * Exposes all fields present in transfer_request_persons as a typescript
 * interface.
 */
export interface ITransferRequestPersons {
  id: number;
  id_transfer_order: number;
  id_user: number;
  id_user_line: number;
  id_user_subline: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_transfer_request: number;
}

/**
 * Exposes the same fields as TransferRequestPersons,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferRequestPersonsWithDefaults {
  id?: number;
  id_transfer_order: number;
  id_user: number;
  id_user_line: number;
  id_user_subline: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_transfer_request: number;
}
/**
 * Exposes all fields present in transfer_request_products as a typescript
 * interface.
 */
export interface ITransferRequestProducts {
  id: number;
  id_transfer_order: number;
  id_product: number;
  units: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_transfer_request: number;
}
/**
 * Exposes all fields present in transfer_request_materials as a typescript
 * interface.
 */
export interface ITransferRequestMaterials {
  active: boolean;
  aditional_info: string;
  can_stack: boolean;
  created_at: string;
  created_by: string;
  description: string;
  icon: string;
  id: number;
  id_type_material: number;
  image: string;
  kg_weight: number;
  m3_volume: number;
  modified_at: null;
  modified_by: null;
  mt_height: number;
  mt_length: number;
  mt_width: number;
  restriction: boolean;
  rotation: boolean;
}
/**
 * Exposes all fields present in transfer_request_vehicle as a typescript
 * interface.
 */
export interface ITransferRequestVehicle {
  id: number;
  id_transfer_order: number;
  id_transfer_request: number;
  id_vehicle_type: number;
  units: number;
  vehicle_type: IVehicleType;
}
/**
 * Exposes the same fields as TransferRequestProducts,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITransferRequestProductsWithDefaults {
  id?: number;
  id_transfer_order: number;
  id_product: number;
  units: number;
  active: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_transfer_request: number;
}
/**
 * Exposes all fields present in traveling_restrictions_by_locations as a typescript
 * interface.
 */
export interface ITravelingRestrictionsByLocations {
  id: number;
  id_location: number;
  id_location_dest: number;
  status?: string | null;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as TravelingRestrictionsByLocations,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITravelingRestrictionsByLocationsWithDefaults {
  id?: number;
  id_location: number;
  id_location_dest: number;
  status?: string | null;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in traveling_restrictions_by_material as a typescript
 * interface.
 */
export interface ITravelingRestrictionsByMaterial {
  id: number;
  id_type_material: number;
  id_material: number;
  status?: string | null;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as TravelingRestrictionsByMaterial,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITravelingRestrictionsByMaterialWithDefaults {
  id?: number;
  id_type_material: number;
  id_material: number;
  status?: string | null;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in trip as a typescript
 * interface.
 */
export interface ITrip {
  id: number;
  id_start_location: number;
  id_end_location: number;
  start_time: Date;
  end_time?: Date | null;
  fare: number;
  status: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as Trip,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITripWithDefaults {
  id?: number;
  id_start_location: number;
  id_end_location: number;
  start_time: Date;
  end_time?: Date | null;
  fare: number;
  status: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in trip_costcenter as a typescript
 * interface.
 */
export interface ITripCostcenter {
  id: number;
  id_trip: number;
  id_costcenter: number;
  percentage: number;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as TripCostcenter,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITripCostcenterWithDefaults {
  id?: number;
  id_trip: number;
  id_costcenter: number;
  percentage: number;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in trip_events as a typescript
 * interface.
 */
export interface ITripEvents {
  id: number;
  id_trip: number;
  id_status: number;
  location: string;
  date: Date;
  url_image: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as TripEvents,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITripEventsWithDefaults {
  id?: number;
  id_trip: number;
  id_status: number;
  location: string;
  date: Date;
  url_image: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in trip_incidents as a typescript
 * interface.
 */
export interface ITripIncidents {
  id: number;
  id_trip: number;
  id_driver: number;
  id_incident_type: number;
  description: string;
  url_image: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  date: Date;
}

/**
 * Exposes the same fields as TripIncidents,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITripIncidentsWithDefaults {
  id?: number;
  id_trip: number;
  id_driver: number;
  id_incident_type: number;
  description: string;
  url_image: string;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  date: Date;
}
/**
 * Exposes all fields present in trip_material as a typescript
 * interface.
 */
export interface ITripMaterial {
  id: number;
  id_trip: number;
  id_request: number;
  id_vehicle: number;
  id_material: number;
  units: number;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as TripMaterial,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITripMaterialWithDefaults {
  id?: number;
  id_trip: number;
  id_request: number;
  id_vehicle: number;
  id_material: number;
  units: number;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in trip_request as a typescript
 * interface.
 */
export interface ITripRequest {
  id: number;
  id_trip: number;
  id_request: number;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as TripRequest,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITripRequestWithDefaults {
  id?: number;
  id_trip: number;
  id_request: number;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in trip_vehicle as a typescript
 * interface.
 */
export interface ITripVehicle {
  id: number;
  id_trip: number;
  id_carrier_request_id: number;
  id_vehicle: number;
  id_contract: number;
  id_driver: number;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}

/**
 * Exposes the same fields as TripVehicle,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface ITripVehicleWithDefaults {
  id?: number;
  id_trip: number;
  id_carrier_request_id: number;
  id_vehicle: number;
  id_contract: number;
  id_driver: number;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
}
/**
 * Exposes all fields present in vehicle_type as a typescript
 * interface.
 */
export interface IVehicleType {
  key: number;
  id: number;
  description: string;
  vehicle_subtype: number;
  actyvity_type: number;
  kg_capacity: number;
  m3_volume: number;
  width: number;
  height: number;
  aditional_info?: string | null;
  length?: number | null;
  passenger_capacity: number;
  speed_multiple: number;
  active: string;
  created_at: Date;
  created_by: string | null;
  modified_at?: Date | null;
  modified_by?: string | null;
  icon: string;
  image: string;
  quantity: number;
  plate_number: number;
}
/**
 * Exposes all fields present in vehicle_pricing as a typescript
 * interface.
 */
export interface IVehiclesPricing {
  id_carrier_pricing: string;
  valid_from: string;
  valid_to: string;
  description: string;
  disponibility: number;
  rates: number;
  price: number;
  id: number;
  m3_volume: number;
  kg_capacity: number;
  width: number;
  height: number;
  length: number;
  m2_area: number;
  passenger_capacity: number;
  aditional_info: string;
}
/**
 * Exposes all fields present in vehicle_pricing_trips as a typescript
 * interface.
 */
export interface IVehiclesPricingTrips {
  id: number;
  id_journey: number;
  id_transfer_request: number;
  id_vehicle_type: number;
  id_carrier_request: number;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  status: string;
  material?: IVehiclesPricingTripsMaterial[];
  persons?: {
    id_person_transfer_request: number;
  }[];
}
/**
 * Exposes all fields present in vehicle_pricing_trips_material as a typescript
 * interface.
 */
export interface IVehiclesPricingTripsMaterial {
  id_transfer_request_material: number;
  id_transfer_order: number;
  id_trip: number;
  id_material: number;
  units: number;
  description: string;
  mt_height: number;
  mt_width: number;
  mt_length: number;
  m3_volume: number;
  m2_area: number;
}
/**
 * Exposes all fields present in vehicle_pricing_list as a typescript
 * interface.
 */
export interface IVehiclesPricingList {
  vehiclesPricing: IVehiclesPricing[];
  trips: IVehiclesPricingTrips[];
}
/**
 * Exposes the same fields as VehicleType,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IVehicleTypeWithDefaults {
  id?: number;
  description: string;
  vehicle_subtype: number;
  actyvity_type: number;
  kg_capacity: number;
  m3_volume: number;
  width: number;
  height: number;
  aditional_info?: string | null;
  length?: number | null;
  passenger_capacity: number;
  speed_multiple: number;
  active: string;
  created_at: Date;
  created_by: Date;
  modified_at?: Date | null;
  modified_by?: string | null;
  icon: string;
  image: string;
}
/**
 * Exposes all fields present in vehicles as a typescript
 * interface.
 */
export interface IVehicles {
  id: number;
  plate_number: string;
  brand: string;
  line: string;
  active: string;
  created_at: Date;
  created_by: Date;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_carrier: number;
  id_vehicle_type: number;
  model: string;
  year: number;
  color: string;
  country: number;
  aditional_info?: string | null;
  gps_link?: string | null;
  gps_user?: string | null;
  gps_password?: string | null;
}

/**
 * Exposes the same fields as Vehicles,
 * but makes every field containing a DEFAULT value optional.
 *
 * This is especially useful when generating inserts, as you
 * should be able to omit these fields if you'd like
 */
export interface IVehiclesWithDefaults {
  id?: number;
  plate_number: string;
  brand: string;
  line: string;
  active: string;
  created_at: Date;
  created_by: Date;
  modified_at?: Date | null;
  modified_by?: string | null;
  id_carrier: number;
  id_vehicle_type: number;
  model: string;
  year: number;
  color: string;
  country: number;
  aditional_info?: string | null;
  gps_link?: string | null;
  gps_user?: string | null;
  gps_password?: string | null;
}

export interface IFormDriver<TGeneral = IFormGeneralDriver> {
  general: TGeneral;
  logo?: FileObject[];
}

export interface ISubmitDriver extends IFormDriver<IGeneralDriverSubmit> {
  uploadedFiles?: IUploadRequirementstTableRow[];
}
export interface CustomFile extends File {
  url_archive: string;
  uid?: string;
}
export interface IFormGeneralVehicle extends IVehicle {
  // Aquí puedes agregar campos específicos para el formulario de vehículo
  trip_type?: {
    label: string;
    value: number;
  }[];
}
export interface IFormVehicle {
  general: IFormGeneralVehicle;
  files?: DocumentCompleteType[];
  images: CustomFile[];
  IS_ACTIVE: boolean;
}
export interface IFormCarrier extends ICarrier {
  // TEMPORARY - MADE UP:`
  phone?: string;
  email?: string;
  group_location_select: { label: string; value: number }[];
}
export interface Ifeature {
  description: string;
  id: number;
  idEntityType: number;
  idFeatureEntity: number;
}

export interface VehicleType {
  id: number;
  description: string;
  vehicle_subtype: number;
  actyvity_type: number;
  kg_capacity: number;
  m3_volume: number;
  width: number;
  height: number;
  aditional_info: string;
  length: number;
  passenger_capacity: number;
  speed_multiple: number;
  active: ActiveVehicleType;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
  icon: string;
  image: string;
  available: number;
  price: number;
  trip_type: number;
}

export interface ActiveVehicleType {
  type: string;
  data: number[];
}

export interface IListDataVehiche {
  id: any;
  data: DataVihicleType;
  status: number;
  statusText: string;
  headers: WelcomeHeaders;
  config: Config;
  request: Request;
}
export interface IListDataVehicheDetail {
  id: any;
  data: DataVihicleDetail;
  status: number;
  statusText: string;
  headers: WelcomeHeaders;
  config: Config;
  request: Request;
}

export interface DataVihicleType {
  status: number;
  message: string;
  data: VehicleType[];
}
export interface DataVihicleDetail {
  status: number;
  message: string;
  data: VihicleDetail;
}

export interface VihicleDetail {
  id: number;
  plate_number: string;
  brand: string;
  line: string;
  active: ActiveVehicleType;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  modified_by: string;
  id_carrier: number;
  id_vehicle_type: number;
  model: string;
  year: number;
  color: string;
  country: number;
  aditional_info: string;
  gps_link: string;
  gps_user: string;
  gps_password: string;
  documents: any[];
  images: any[];
}

export interface ICompanyCode {
  id: number;
  description: string;
  active: boolean;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
}

export interface IClient {
  id: number;
  description: string;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
}

export interface ISelectOptionOrders {
  value: string | null | undefined;
  label: string | null | undefined;
}
export interface CustomOptionType {
  value: string;
  label: React.JSX.Element;
  key: string;
}
export interface CCOptionType {
  description: string;
  id: number;
  id_psl: number;
}
export interface PSLOptionType {
  value: number;
  label: string;
  costcenters: CCOptionType[];
}

export interface ITransferOrderCostCenter {
  id: number;
  id_transfer_order: number;
  id_costcenter: number;
  percentage: number;
  cost_center_desc: string;
  id_psl: number;
}
export interface ITransferOrderPsls {
  id: number;
  description: string;
  transfer_order_cost_center: ITransferOrderCostCenter[];
}

export interface IIncident {
  id: number;
  id_trip: number;
  id_driver: number;
  id_incident_type: number;
  incident_type_name: string;
  id_pricing: number | null;
  fare: number;
  units: number;
  description: string;
  url_image: string;
  date: string;
  user: string;
  status: string;
  status_description: string;
  status_color: string;
}

export interface ITripBilling {
  id: number;
  id_journey: number;
  id_transfer_request: number;
  id_vehicle_type: number;
  id_carrier_request: number;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  status: string;
  vehicle_type_desc: string;
  drivers: string;
  plate_number: string;
  fare: number;
  material: IMaterial[];
  incidents: IIncident[];
  overcost: number;
  total: number;
}

export interface IMaterial {
  id_transfer_request_material: number;
  id_transfer_order: number | null;
  id_trip: number;
  id_material: number;
  units: number;
  description: string;
  mt_height: number;
  mt_width: number;
  mt_length: number;
  m3_volume: number;
  m2_area: number;
}

export interface IJourney {
  id: number;
  id_transfer_order: number;
  id_transfer_request: number;
  id_start_location: number;
  id_end_location: number;
  start_date: string;
  end_date: string;
  id_type_service: number;
  order_tr: number;
  created_at: string;
  created_by: string;
  modified_at: string | null;
  modified_by: string | null;
  id_route: string;
  start_location_desc: string;
  end_location_desc: string;
  trips: ITripBilling[];
  requirements: IRequirement[];
}

export interface ICarrierRequestDetailAPI extends ICarrierRequestDetail {
  vehicle: ICarrierRequestVehicles;
  drivers: ICarrierRequestDrivers[];
  observation?: string;
}

export interface IFormGeneralUser {
  id: number;
  phone: number;
  email: string;
  document_type: number;
  vehicle_type: { label: string; value: number }[];
  document: string;
  license: string;
  license_category: string;
  licence_category?: string;
  license_expiration: Date;
  name: string;
  last_name: string;
  emergency_number: number;
  emergency_contact: string;
  firebaseguid?: string;
  active: any;
  status?: any;
  created_at: Date;
  created_by: string;
  modified_at?: Date | null;
  modified_by?: string | null;
  company: string;
  rh: string;
  glasses: any;
  birth_date: Date;
  photo?: string;
  company_id?: string;
}

export enum TripType {
  Personas = "Personas",
  Carga = "Carga",
  Izaje = "Izaje"
}

/**
 * Exposes all fields present in location as a typescript
 * interface.
 */
export interface IUser {
  id: number;
  email: string;
  user_name: string;
  phone: string;
  rol_id: string;
  carrier_id?: string;
  psl_id: string;
  cost_center_id: string;
  position: string;
  active: string;
  photo?: string;
  firebaseguid?: string;
  carrier: any;
  psl: any;
  ACTIVE: string;
}

export interface IFormUser {
  general: IUser;
  logo?: FileObject[];
}

export interface IDocumentsAPI {
  id_document_type: number;
  description: string;
  optional: boolean;
}

export interface IDocumentCompleted extends IDocumentsAPI {
  link?: string;
  file?: File;
  expirationDate: any;
}
interface IFile {
  id: number;
  entity_type: number;
  description: string;
  optional: boolean;
  id_location: number | null;
  id_material_type: number | null;
  expiry: boolean;
  template: string;
  active: boolean;
  created_at: string; // ISO date string
  created_by: string;
  modified_at: string | null; // ISO date string or null
  modified_by: string;
  file: {
    uid: string;
  };
  expirationDate: string; // ISO date string
}
export interface CreateDriver {
  id: number;
  phone: string;
  email: string;
  document_type: number;
  document: string;
  license: string;
  license_categorie: string;
  license_expiration: string; // ISO date string
  name: string;
  last_name: string;
  emergency_number: string;
  emergency_contact: string;
  rh: string;
  glasses: 1 | 0;
  birth_date: string; // ISO date string
  vehicle_type: number[];
  company_id: string;
  files: IFile[];
}

export interface CreateOrderResponse {
  id_user: number;
  id_service_type: string;
  id_start_location: number;
  id_end_location: number;
  start_date: string; // ISO string format
  end_date: string; // ISO string format
  start_freight_equipment: string;
  end_freight_equipment: string;
  rotation: string;
  start_date_flexible: string;
  end_date_flexible: string;
  freight_destination_time: number;
  freight_origin_time: number;
  id_route: string;
  id_company: string;
  id_client: number;
  status: string; // UUID format
  id: number;
  active: string; // "true" or "false"
  created_at: string; // ISO string format
  created_by: string;
  modified_at: string; // ISO string format
  modified_by: string;
  observation: string | null;
  user: string;
  geometry: string;
  service_type_desc: string;
  client_desc: string;
}
export interface ITripSummaryAPI {
  id: number;
  id_service_type: string;
  service_type_desc: TripType;
  id_user: number;
  user: string | null | undefined;
  id_start_location: number;
  id_end_location: number;
  start_date?: string;
  end_date?: string;
  start_freight_equipment: boolean | string;
  end_freight_equipment: boolean | string;
  freight_origin_time?: number;
  freight_destination_time?: number;
  rotation: string;
  start_date_flexible: number;
  end_date_flexible: number;
  id_route: string;
  id_company: number;
  id_client: number;
  client_desc: string;
  status: string;
  active: string;
  created_at?: string | null | undefined;
  created_by?: string | null | undefined;
  created_by_user?: string;
  modified_at?: string | null | undefined;
  modified_by?: string | null | undefined;
  observation: string | null | undefined;
  start_location?: ILocation | null | undefined;
  end_location?: ILocation | null | undefined;
  contract_number?: string;
  declared_cargo_value?: number;
  //geometry
  geometry: any;
  //datos de contacto
  transfer_order_contacts?: ITransferOrderContacts[] | null;
  //centros de costo
  transfer_order_cost_center?: ITransferOrderCostCenter[] | null;
  //documentos
  transfer_order_documents?: ITransferOrderDocuments[] | null;
  //material
  transfer_order_material?: ITransferOrderMaterial[] | null;
  //requerimientos adicionales
  transfer_order_other_requeriments?: ITransferOrderOtherRequirements[] | null;
  //personas -- aplica para viaje tipo persona
  transfer_order_persons?: ITransferOrderPersons[] | null;
  //productos
  transfer_order_products?: ITransferOrderProducts[] | null;
  //vehiculo sugerido
  transfer_order_vehicles?: ITransferOrderVehicle[] | null;
  //psls y ccs asociados
  transfer_order_psl?: ITransferOrderPsls[] | null;
}

export interface ISelectLocation {
  id: number;
  description: string;
  citydesc: string;
  statedesc: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  location_type: string;
  active: boolean;
}

export interface IIntersection {
  entry: boolean[];
  bearings: number[];
  duration?: number;
  mapbox_streets_v8?: any;
  is_urban?: boolean;
  admin_index: number;
  out?: number;
  weight?: number;
  geometry_index: number;
  railway_crossing?: boolean;
  location: [number, number];
}

export interface IStep {
  intersections: IIntersection[];
  maneuver?: any;
  name: string;
  duration: number;
  distance: number;
  driving_side?: string;
  weight: number;
  mode?: string;
  geometry: IGeometry[];
}

export interface IRouteLeg {
  via_waypoints: any[];
  admins: any[];
  weight: number;
  duration: number;
  steps: IStep[];
  distance: number;
  summary?: string;
}

export interface IGeometry {
  coordinates: [number, number][]; // Array of coordinates in [longitude, latitude] format
  type: string;
}
export interface IRoute {
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
  legs: IRouteLeg[];
  geometry: IGeometry;
}

export interface IWaypoint {
  name: string;
  location: [number, number]; // [longitude, latitude]
  distance?: number;
}

export interface IDirectionsMapboxResponse {
  routes: IRoute[];
  waypoints: IWaypoint[];
  code: string;
  uuid: string;
}

export interface ISuggestedVehicle {
  id: number;
  description: string;
  vehicle_subtype: number;
  id_service_type: number;
  kg_capacity: number;
  m3_volume: number;
  width: number;
  height: number;
  aditional_info: string;
  length: number;
  passenger_capacity: number;
  speed_multiple: number;
  active: boolean;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  icon: string;
  image: string;
  available: number;
  price: number;
}

export interface ICostCenter {
  id: number;
  description: string;
  id_psl: number;
}

export interface IGetPSL {
  cost_center: ICostCenter[];
  description: string;
  id: number;
}

export interface IGetAllPeople {
  id: number;
  name: string;
  contact_number: string;
  id_psl: number;
  psl_desc: string;
  id_cost_center: number;
  cost_center_desc: string;
}

export interface IAddTransferOrderContact {
  id_contact: string;
  contact_type: string;
  name: string;
  contact_number: string;
}

export interface IAddTransferOrderCostCenter {
  id_psl: string;
  id_costcenter: string;
  percentage: string;
}

export interface IAddTransferOrderDocument {
  id_document_type: string;
  url_document?: string;
  status?: string;
}

export interface IAddTransferOrderMaterial {
  id_material: string;
  quantity: string;
  weight: number;
  height: number;
  width: number;
  length: number;
  is_controlled_substance: number;
}

export interface IAddTransferOrderOtherRequirements {
  id_other_requeriments: string;
  quantity: string;
}

export interface IAddTransferOrderPerson {
  id_user: string;
  id_user_line: string;
}

export interface IAddTransferOrderProduct {
  id_product: string;
  units: string;
}

export interface IAddTransferOrderVehicle {
  id_vehicle_type: string;
  quantity: string;
}

export interface IAddTransferOrder {
  id: number;
  id_user: string;
  user: string;
  id_start_location: string;
  id_end_location: string;
  start_date: string; // formato: "YYYY-MM-DD HH:mm:ss"
  end_date: string; // formato: "YYYY-MM-DD HH:mm:ss"
  start_freight_equipment: string;
  end_freight_equipment: string;
  freight_origin_time: number;
  freight_destination_time: number;
  rotation: string;
  start_date_flexible: string;
  end_date_flexible: string;
  id_route?: string;
  id_company: string;
  isFixedRate: string;
  status?: string;
  active?: string;
  created_at?: string;
  created_by?: string;
  modified_at?: string;
  modified_by?: string;
  transfer_order_contacts: IAddTransferOrderContact[];
  transfer_order_cost_center: IAddTransferOrderCostCenter[];
  transfer_order_documents: IAddTransferOrderDocument[];
  transfer_order_material: IAddTransferOrderMaterial[];
  transfer_order_other_requeriments: IAddTransferOrderOtherRequirements[];
  transfer_order_persons: IAddTransferOrderPerson[];
  transfer_order_products: IAddTransferOrderProduct[];
  transfer_order_vehicles: IAddTransferOrderVehicle[];
  geometry: IRoute[]; // JSON string del array de rutas
  id_service_type: string;
  id_client: number;
  observation: string | null;
  service_type_desc: string;
  client_desc: string;
  contractNumber: string;
  declaredCargoValue: number;
  files: any[];
}

export interface IGetFrequentRoutes {
  id: number;
  idStartLocation: number;
  idEndLocation: number;
  distanceKm: number;
  updatedAt: string;
  version: number;
  jsonRoute: Array<{
    legs: any[];
    weight: number;
    distance: number;
    duration: number;
    geometry: {
      type: string;
      coordinates: [number, number][];
    };
    weight_name: string;
  }>;
}

interface IStatusWithStyling {
  backgroundColor: string;
  color: string;
  description: string;
  id: string;
  name: string;
  subjectId: number;
}

export interface IMaterialInput {
  id: number;
  weight: number;
  length: number;
  width: number;
  height: number;
}

export interface ISuggestedVehiclesByMaterialsRequest {
  serviceTypeId: number;
  vehiclesSelected?: {
    id?: number;
    quantity: number;
  }[];
  // load and hoisting Types
  materials?: IMaterialInput[];
  requireLift?: boolean;
  // people Types
  passengers?: number;
}

interface ITotalMaterials {
  volume: number;
  kg: number;
}

export interface IVehicleWithOccupation {
  id: number;
  description: string;
  vehicle_subtype: number;
  kg_capacity: number;
  m3_volume: number;
  width: number;
  height: number;
  aditional_info: string | null;
  length: number;
  passenger_capacity: number;
  speed_multiple: number;
  active: boolean;
  icon: string;
  image: string;
  id_service_type: number;
  available: number;
  price: number;
  ocupationM3: number;
  ocupationKg: number;
  ocupationPassengers: number;
}

interface IMaterialCalculated {
  id: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  volume: number;
}

export interface ISuggestedVehiclesByMaterials {
  totalMaterials: ITotalMaterials;
  vehiclesWithOcupation: IVehicleWithOccupation[];
  materialCalculated: IMaterialCalculated[];
  vehiclesSelectedWithOcupation: IVehicleWithOccupation[];
}
