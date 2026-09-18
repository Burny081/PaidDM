import { AppHeader } from "@/components/app-header";
import { LoginPanel } from "@/features/auth/login-panel";

export default function LoginPage() {
  return <main className="app-page"><AppHeader /><LoginPanel /></main>;
}
