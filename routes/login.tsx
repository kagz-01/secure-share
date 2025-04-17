import Layout from "../components/Layout.tsx";
import LoginForm from "../islands/LoginForm.tsx";

export default function Login() {
  return (
    <Layout>
      <div class="p-4 max-w-sm mx-auto">
        <h1 class="text-2xl font-bold mb-4">Login</h1>
        <LoginForm />
        <div class="mt-4 text-center">
          <a href="/signup" class="text-blue-500 hover:underline">
            Don't have an account? Register
          </a>
        </div>
      </div>
    </Layout>
  );
}
