import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegister } from "../../queries/auth.queries";
import { Input }  from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function RegisterPage() {
  const [form, setForm] = useState({
    organizationName: "", firstName: "", lastName: "", email: "", password: "",
  });
  const { mutate: register, isLoading } = useRegister();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-gray-500 mt-1">Start monitoring cloud costs in minutes</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm space-y-4">
          <Input label="Organization name" value={form.organizationName}
            onChange={set("organizationName")} placeholder="Acme Corp"/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.firstName}
              onChange={set("firstName")} placeholder="Jane"/>
            <Input label="Last name" value={form.lastName}
              onChange={set("lastName")} placeholder="Doe"/>
          </div>
          <Input label="Email" type="email" value={form.email}
            onChange={set("email")} placeholder="jane@acme.com"/>
          <Input label="Password" type="password" value={form.password}
            onChange={set("password")} placeholder="Min 8 chars, uppercase, number"/>
          <Button className="w-full justify-center" loading={isLoading}
            onClick={() => register(form)}>
            Create account
          </Button>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}