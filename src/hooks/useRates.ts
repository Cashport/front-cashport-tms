import { useEffect, useState } from "react";
import { API } from "@/utils/api/api";

interface Option {
  value: string | number;
  label: string;
  serviceTypeId: number;
}

export const useProviders = () => {
  const [providers, setProviders] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const response = await API.get("/pricing/providers");
        const formattedProviders = response.data.map((provider: any) => ({
          value: provider.id,
          label: provider.name
        }));
        setProviders(formattedProviders);
      } catch (err) {
        setError("Error al cargar los proveedores");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return { providers, loading, error };
};

export const useContracts = (providerId: string | undefined) => {
  const [contracts, setContracts] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!providerId) {
        setContracts([]);
        return;
      }

      try {
        setLoading(true);
        const response = await API.get(`/pricing/contracts/${providerId}`);
        const formattedContracts = response.data.map((contract: any) => ({
          value: contract.id,
          label: contract.name
        }));
        setContracts(formattedContracts);
      } catch (err) {
        setError("Error al cargar los contratos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [providerId]);

  return { contracts, loading, error };
};

export const useServiceTypes = () => {
  const [serviceTypes, setServiceTypes] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        setLoading(true);
        const response = await API.get("/pricing/service-types");
        const formattedServiceTypes = response.data.map((type: any) => ({
          value: type.id,
          label: type.name
        }));
        setServiceTypes(formattedServiceTypes);
      } catch (err) {
        setError("Error al cargar los tipos de servicio");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceTypes();
  }, []);

  return { serviceTypes, loading, error };
};

export const useVehicleTypes = (serviceTypeId: number) => {
  const [vehicleTypes, setVehicleTypes] = useState<Option[]>([]);
  const [filteredVehicleTypes, setFilteredVehicleTypes] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        setLoading(true);
        if (serviceTypeId && vehicleTypes.length > 0) {
          const filteredVehicleTypes = vehicleTypes.filter(
            (type) => type.serviceTypeId === serviceTypeId
          );
          setFilteredVehicleTypes(filteredVehicleTypes);
          return;
        }

        const response = await API.get(`/vehicle/type`);
        const formattedVehicleTypes = response.data.map((type: any) => ({
          value: type.id,
          label: type.description,
          serviceTypeId: type.id_service_type
        }));
        setVehicleTypes(formattedVehicleTypes);
      } catch (err) {
        setError("Error al cargar los tipos de vehículo");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleTypes();
  }, [serviceTypeId]);

  return { vehicleTypes: filteredVehicleTypes, loading, error };
};

export const useOtherServices = () => {
  const [otherServices, setOtherServices] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOtherServices = async () => {
      try {
        setLoading(true);
        const response = await API.get("/pricing/other-services");
        const formattedOtherServices = response.data.map((service: any) => ({
          value: service.id,
          label: service.name
        }));
        setOtherServices(formattedOtherServices);
      } catch (err) {
        setError("Error al cargar otros servicios");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOtherServices();
  }, []);

  return { otherServices, loading, error };
};
