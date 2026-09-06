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

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const {
    mutate: register,
    isLoading,
    error,
  } = useRegister();

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
    register(form, {
      onSuccess: () => {
        setRegistrationSuccess(true);
      },
    });
  };

  // -----------------------------------------
  // SUCCESS / EMAIL VERIFICATION SCREEN
  // -----------------------------------------
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm text-center">

            {/* Success icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <span className="text-3xl">✓</span>
            </div>

            <h1 className="text-2xl font-bold">
              Account created successfully!
            </h1>

            <p className="text-gray-500 mt-3">
              We've sent a verification email to:
            </p>

            <p className="font-medium mt-2 break-all">
              {form.email}
            </p>

            <p className="text-gray-500 mt-4 text-sm leading-6">
              Please check your inbox and click the verification link
              to verify your email address before signing in.
            </p>

            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                Go to Login
              </Link>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Didn't receive the email? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // REGISTRATION FORM
  // -----------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            Create your account
          </h1>

          <p className="text-gray-500 mt-1">
            Start monitoring cloud costs in minutes
          </p>
        </div>

        {/* Card */}
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

          {/* API ERROR */}
          {!!error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {getErrorMessage()}
            </div>
          )}

          {/* REGISTER BUTTON */}
          <Button
            className="w-full justify-center"
            loading={isLoading}
            disabled={isLoading}
            onClick={handleRegister}
          >
            {isLoading ? "Creating account..." : "Create account"}
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