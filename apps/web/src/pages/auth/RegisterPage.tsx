import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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

  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: register, isLoading } = useRegister();

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));

      // Clear the error when the user starts correcting the form
      setErrorMessage("");
    };

  const handleRegister = () => {
    setErrorMessage("");

    // Frontend validation
    if (!form.organizationName.trim()) {
      setErrorMessage("Organization name is required.");
      return;
    }

    if (!form.firstName.trim()) {
      setErrorMessage("First name is required.");
      return;
    }

    if (!form.lastName.trim()) {
      setErrorMessage("Last name is required.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    // Send registration request
    register(form, {
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.error?.message ||
            "Registration failed. Please try again.";

          setErrorMessage(message);
        } else {
          setErrorMessage("Registration failed. Please try again.");
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            Create your account
          </h1>

          <p className="text-gray-500 mt-1">
            Start monitoring cloud costs in minutes
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm space-y-4">

          {/* Organization */}
          <Input
            label="Organization name"
            value={form.organizationName}
            onChange={set("organizationName")}
            placeholder="Acme Corp"
          />

          {/* First and Last Name */}
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

          {/* Email */}
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="jane@acme.com"
          />

          {/* Password */}
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="Min 8 chars, uppercase, number"
          />

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Register Button */}
          <Button
            className="w-full justify-center"
            loading={isLoading}
            onClick={handleRegister}
          >
            Create account
          </Button>

          {/* Login Link */}
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