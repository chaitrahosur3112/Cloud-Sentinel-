import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../lib/axios";
import { Report } from "../types";
import { useDispatch } from "react-redux";
import { addToast } from "../store/slices/uiSlice";

export function useReports() {
  return useQuery("reports", async () => {
    const { data } = await api.get("/reports");
    return data.data as Report[];
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch();
  return useMutation(
    async (dto: { type: string; format: string; from?: string; to?: string }) => {
      const { data } = await api.post("/reports", dto);
      return data.data as Report;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("reports");
        dispatch(addToast({ type: "success", message: "Report generated successfully" }));
      },
      onError: () => {
        dispatch(addToast({ type: "error", message: "Report generation failed" }));
      },
    }
  );
}