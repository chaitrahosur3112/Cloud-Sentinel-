import { useMutation } from "react-query";
import { api } from "../lib/axios";
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { addToast } from "../store/slices/uiSlice";

export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation(
    async (credentials: { email: string; password: string }) => {
      const { data } = await api.post("/auth/login", credentials);
      return data.data;
    },
    {
      onSuccess: (data) => {
        dispatch(setCredentials({
          user:        data.user,
          accessToken: data.accessToken,
        }));
        navigate("/dashboard");
      },
      onError: (error: {
        response?: { data?: { error?: { message?: string } } };
      }) => {
        dispatch(addToast({
          type:    "error",
          message: error.response?.data?.error?.message ?? "Login failed",
        }));
      },
    }
  );
}

export function useRegister(options?: { onSuccess?: () => void }) {
  const dispatch = useDispatch();

  return useMutation(
    async (dto: {
      organizationName: string;
      firstName:        string;
      lastName:         string;
      email:            string;
      password:         string;
    }) => {
      const { data } = await api.post("/auth/register", dto);
      return data.data;
    },
    {
      onSuccess: () => {
        dispatch(addToast({
          type:    "success",
          message: "Account created! Please check your email to verify.",
        }));
        options?.onSuccess?.();
      },
      onError: (error: {
        response?: { data?: { error?: { message?: string } } };
      }) => {
        dispatch(addToast({
          type:    "error",
          message: error.response?.data?.error?.message ?? "Registration failed",
        }));
      },
    }
  );
}

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation(
    async () => {
      await api.post("/auth/logout");
    },
    {
      onSettled: () => {
        dispatch(clearCredentials());
        navigate("/login");
      },
    }
  );
}

export function useForgotPassword() {
  const dispatch = useDispatch();

  return useMutation(
    async (email: string) => {
      const { data } = await api.post("/auth/forgot-password", { email });
      return data.data;
    },
    {
      onSuccess: (data) => {
        dispatch(addToast({
          type:    "success",
          message: data.message,
        }));
      },
      onError: () => {
        dispatch(addToast({
          type:    "error",
          message: "Failed to send reset email. Please try again.",
        }));
      },
    }
  );
}

export function useResetPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useMutation(
    async (dto: { token: string; newPassword: string }) => {
      const { data } = await api.post("/auth/reset-password", dto);
      return data.data;
    },
    {
      onSuccess: () => {
        dispatch(addToast({
          type:    "success",
          message: "Password reset! Please log in.",
        }));
        navigate("/login");
      },
      onError: () => {
        dispatch(addToast({
          type:    "error",
          message: "Reset failed. The link may have expired.",
        }));
      },
    }
  );
}