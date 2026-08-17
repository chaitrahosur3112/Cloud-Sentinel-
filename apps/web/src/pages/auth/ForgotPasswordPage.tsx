import { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../../queries/auth.queries";
import { Input }  from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { mutate, isLoading } = useForgotPassword();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Forgot password?</h1>
          <p className="text-gray-500 mt-1">Enter your email and we'll send a reset link</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm space-y-4">
          <Input label="Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"/>
          <Button className="w-full justify-center" loading={isLoading}
            onClick={() => mutate(email)}>
            Send reset link
          </Button>
          <p className="text-center text-sm text-gray-500">
            <Link to="/login" className="text-brand-600 hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}