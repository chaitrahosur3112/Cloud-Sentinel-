import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../lib/axios";
import { Budget } from "../types";
import { useDispatch } from "react-redux";
import { addToast } from "../store/slices/uiSlice";

export function useBudgets() {
  return useQuery("budgets", async () => {
    const { data } = await api.get("/budgets");
    return data.data as Budget[];
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch();
  return useMutation(
    async (dto: { name: string; scope: string; monthlyLimit: number }) => {
      const { data } = await api.post("/budgets", dto);
      return data.data as Budget;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("budgets");
        queryClient.invalidateQueries("dashboard-budgets");
        dispatch(addToast({ type: "success", message: "Budget created successfully" }));
      },
    }
  );
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch();
  return useMutation(
    async ({ id, ...dto }: { id: string; name: string; scope: string; monthlyLimit: number }) => {
      const { data } = await api.put(`/budgets/${id}`, dto);
      return data.data as Budget;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("budgets");
        dispatch(addToast({ type: "success", message: "Budget updated" }));
      },
    }
  );
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch();
  return useMutation(
    async (id: string) => { await api.delete(`/budgets/${id}`); },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("budgets");
        dispatch(addToast({ type: "success", message: "Budget deleted" }));
      },
    }
  );
}