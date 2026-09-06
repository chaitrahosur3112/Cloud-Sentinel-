import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegister } from "../../queries/auth.queries";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function RegisterPage() {
  const [form, setForm] = useState({
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [registered, setRegistered] = useState(false);

  const {
    mutate: register,
    isLoading,
    error,
  } = useRegister({
    onSuccess: () => setRegistered(true),
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [key]: e.target.value,
      }));
    };

  const getErrorMessage = () => {
    const err = error as any;

    return (
      err?.response?.data?.error?.message ??
      err?.message ??
      "Registration failed. Please try again."
    );
  };

  const handleRegister = () => {
    register(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold">
            Create your account
          </h1>

          <p className="text-gray-500 mt-1">
            Start monitoring cloud costs in minutes
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm space-y-4">

          <Input
            label="Organization name"
            value={form.organizationName}
            onChange={set("organizationName")}
            placeholder="Acme Corp"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              value={form.firstName}
              onChange={set("firstName")}
              placeholder="Jane"
            />

            <Input
              label="Last name"
              value={form.lastName}
              onChange={set("lastName")}
              placeholder="Doe"
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="jane@acme.com"
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="Min 8 chars, uppercase, number"
          />

          {/* Verification message */}
          {registered && (
            <p className="text-center text-sm text-green-600 font-medium">
              Please check your email for verification before logging in.
            </p>
          )}

          {/* Error */}
          {!!error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {getErrorMessage()}
            </div>
          )}

          <Button
            className="w-full justify-center"
            loading={isLoading}
            disabled={isLoading || registered}
            onClick={handleRegister}
          >
            {registered ? "Account created" : "Create account"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}