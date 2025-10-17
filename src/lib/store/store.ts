import { UserSlice, createUserSlice } from "@/lib/slices/createProductSlice";
import { ProjectSlice, createProjectSlice } from "@/lib/slices/createProjectSlice";
import { CarrierForApprovalSlice, createCarrierForApprovalSlice } from "@/lib/slices/createCarrierForApprovalSlice";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createHidrationSlice, Hidration } from "../slices/hidratationSlice";
import { setProjectInApi } from "@/utils/api/api";

interface AppStore extends ProjectSlice, UserSlice, Hidration, CarrierForApprovalSlice {
  resetStore: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...createUserSlice(set),
      ...createProjectSlice(set),
      ...createHidrationSlice(set),
      ...createCarrierForApprovalSlice(set),
      resetStore: () => {
        // Clear the session storage
        localStorage.removeItem("project");
        // Reset the Zustand store to initial state
        set({
          ...createUserSlice(set),
          ...createProjectSlice(set),
          ...createHidrationSlice(set),
          ...createCarrierForApprovalSlice(set)
        });
      }
    }),
    {
      name: "project",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error(error);
        if (state) state.setHydrated();
        setProjectInApi(state?.selectedProject?.ID || 0);
      }
    }
  )
);
