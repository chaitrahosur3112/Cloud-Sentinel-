import { useState } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../../queries/auth.queries";
import { Input }  from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isLoading } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CloudCost Sentinel</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
          <div className="space-y-4">
            <Input label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"/>
            <Input label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"/>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button className="w-full justify-center" loading={isLoading}
              onClick={() => login({ email, password })}>
              Sign in
            </Button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}