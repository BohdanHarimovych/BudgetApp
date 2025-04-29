import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register | Expense Tracker",
  description: "Create an account to start tracking your expenses",
};

export default function RegisterPage() {
  return (
    <div className="container max-w-md mx-auto py-10">
      <RegisterForm />
    </div>
  );
}
