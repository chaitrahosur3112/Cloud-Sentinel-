import { useMutation } from "react-query";
import { AxiosError } from "axios";
import { api } from "../lib/axios";
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { addToast } from "../store/slices/uiSlice";

type ApiError = {
  error?: {
    message?: string;
  };
};

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiError>;

  return (
    axiosError.response?.data?.error?.message ??
    axiosError.message ??
    fallback
  );
}

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
        dispatch(
          setCredentials({
            user: data.user,
            accessToken: data.accessToken,
          })
        );

        navigate("/dashboard");
      },

      onError: (error) => {
        dispatch(
          addToast({
            type: "error",
            message: getErrorMessage(error, "Login failed"),
          })
        );
      },
    }
  );
}

export function useRegister() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useMutation(
    async (dto: {
      organizationName: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      const { data } = await api.post("/auth/register", dto);
      return data.data;
    },

    {
      onSuccess: () => {
        dispatch(
          addToast({
            type: "success",
            message:
              "Registration successful! Please check your email.",
          })
        );

        navigate("/login");
      },

      onError: (error) => {
        const message = getErrorMessage(
          error,
          "Registration failed"
        );

        dispatch(
          addToast({
            type: "error",
            message,
          })
        );
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
      const { data } = await api.post(
        "/auth/forgot-password",
        { email }
      );

      return data.data;
    },

    {
      onSuccess: (data) => {
        dispatch(
          addToast({
            type: "success",
            message: data.message,
          })
        );
      },

      onError: (error) => {
        dispatch(
          addToast({
            type: "error",
            message: getErrorMessage(
              error,
              "Failed to send reset email"
            ),
          })
        );
      },
    }
  );
}

export function useResetPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useMutation(
    async (dto: {
      token: string;
      newPassword: string;
    }) => {
      const { data } = await api.post(
        "/auth/reset-password",
        dto
      );

      return data.data;
    },

    {
      onSuccess: () => {
        dispatch(
          addToast({
            type: "success",
            message: "Password reset! Please log in.",
          })
        );

        navigate("/login");
      },

      onError: (error) => {
        dispatch(
          addToast({
            type: "error",
            message: getErrorMessage(
              error,
              "Password reset failed"
            ),
          })
        );
      },
    }
  );
}