import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegister } from "../../queries/auth.queries";
import { Input }  from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function RegisterPage() {
  const [form, setForm] = useState({
    organizationName: "",
    firstName:        "",
    lastName:         "",
    email:            "",
    password:         "",
  });

  // This is the key: when true, show the "check your email" screen
  const [showEmailScreen, setShowEmailScreen] = useState(false);

  const { mutate: register, isLoading } = useRegister();

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleRegister() {
    register(form, {
      onSuccess: () => {
        // Show the email verification screen instead of redirecting
        setShowEmailScreen(true);
      },
    });
  }

  // ── Screen shown AFTER successful registration ──
  if (showEmailScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="w-full max-w-md text-center">

          {/* Big green checkmark */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Check your email!
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mb-4">
            We sent a verification link to:
          </p>

          {/* Show the email address clearly */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 mb-6 inline-block">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {form.email}
            </span>
          </div>

          {/* Step by step */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-4 text-left space-y-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              What to do next:
            </p>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Open your inbox and find the email from <strong>CloudCost Sentinel</strong>
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click the <strong>Verify Email</strong> button in the email
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You will be redirected to the login page automatically
              </p>
            </div>
          </div>

          {/* Spam warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6 text-left flex items-start gap-2">
            <svg className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              Can't find the email? Check your <strong>spam or junk folder</strong>.
              It may take a few minutes to arrive.
            </p>
          </div>

          <Link to="/login">
            <Button variant="secondary" className="w-full justify-center">
              Go to Sign in
            </Button>
          </Link>

        </div>
      </div>
    );
  }

  // ── Normal registration form ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0
                   0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0
                   0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-gray-500 mt-1">Start monitoring cloud costs in minutes</p>
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

          <Button
            className="w-full justify-center"
            loading={isLoading}
            onClick={handleRegister}
          >
            Create account
          </Button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}