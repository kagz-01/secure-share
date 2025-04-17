import SignupForm from "../islands/SignupForm.tsx";
import Layout from "../components/Layout.tsx";

export default function Signup() {
  return (
    <Layout>
      <div class="p-4 max-w-sm mx-auto min-h-screen flex flex-col justify-center items-center">
        <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">Create Your Account</h1>
        <SignupForm />
        <div class="mt-4 text-center">
          <a href="/login" class="text-blue-500 hover:underline">
            Already have an account? Login
          </a>
        </div>
      </div>
    </Layout>
  );
}
