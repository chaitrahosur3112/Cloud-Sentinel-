import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../lib/axios";
import { Resource, ResourceDetail, CloudAccount, Pagination } from "../types";
import { useDispatch } from "react-redux";
import { addToast } from "../store/slices/uiSlice";

export function useResources(params: {
  type?: string; provider?: string; region?: string; page?: number; limit?: number;
}) {
  return useQuery(
    ["resources", params],
    async () => {
      const { data } = await api.get("/resources", { params });
      return data as { data: Resource[]; pagination: Pagination };
    }
  );
}

export function useResource(id: string) {
  return useQuery(["resource", id], async () => {
    const { data } = await api.get(`/resources/${id}`);
    return data.data as ResourceDetail;
  }, { enabled: !!id });
}

export function useCloudAccounts() {
  return useQuery("cloud-accounts", async () => {
    const { data } = await api.get("/cloud-accounts");
    return data.data as CloudAccount[];
  });
}

export function useConnectCloudAccount() {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch();
  return useMutation(
    async (dto: { provider: string; accountName: string; credentialsRef: string }) => {
      const { data } = await api.post("/cloud-accounts", dto);
      return data.data as CloudAccount;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("cloud-accounts");
        dispatch(addToast({ type: "success", message: "Cloud account connected successfully" }));
      },
    }
  );
}

export function useDisconnectCloudAccount() {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch();
  return useMutation(
    async (id: string) => { await api.delete(`/cloud-accounts/${id}`); },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("cloud-accounts");
        dispatch(addToast({ type: "success", message: "Cloud account disconnected" }));
      },
    }
  );
}