import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../lib/axios";
import { Alert, Pagination } from "../types";
import { useDispatch } from "react-redux";
import { addToast } from "../store/slices/uiSlice";

export function useAlerts(params: { status?: string; type?: string; page?: number; limit?: number }) {
  return useQuery(["alerts", params], async () => {
    const { data } = await api.get("/alerts", { params });
    return data as { data: Alert[]; pagination: Pagination };
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch();
  return useMutation(
    async (id: string) => { await api.patch(`/alerts/${id}/acknowledge`); },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("alerts");
        queryClient.invalidateQueries("dashboard-alerts");
        dispatch(addToast({ type: "success", message: "Alert acknowledged" }));
      },
    }
  );
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch();
  return useMutation(
    async (id: string) => { await api.patch(`/alerts/${id}/resolve`); },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("alerts");
        queryClient.invalidateQueries("dashboard-alerts");
        dispatch(addToast({ type: "success", message: "Alert resolved" }));
      },
    }
  );
}