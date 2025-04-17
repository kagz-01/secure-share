import { useSignal } from "@preact/signals";

export default function SignupForm() {
  const error = useSignal<string | null>(null);
  const loading = useSignal(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error.value = null;
    loading.value = true;

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!email || !password || !confirmPassword) {
      error.value = "All fields are required";
      loading.value = false;
      return;
    }

    if (password !== confirmPassword) {
      error.value = "Passwords do not match";
      loading.value = false;
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        error.value = data.message || "Something went wrong";
      } else {
        globalThis.location.href = "/login";
      }
    } catch (err) {
      error.value = "Network error";
    } finally {
      loading.value = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} class="w-full space-y-5 bg-white p-6 rounded shadow-md">
      <div>
        <label class="block mb-1 font-medium text-sm text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          required
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm text-gray-700">Password</label>
        <input
          type="password"
          name="password"
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          required
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-sm text-gray-700">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading.value}
        class={`w-full ${
          loading.value ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        } text-white font-semibold py-3 rounded-lg transition duration-200`}
      >
        {loading.value ? "Signing up..." : "Sign Up"}
      </button>

      {error.value && (
        <div class="bg-red-100 text-red-700 border border-red-400 px-4 py-3 rounded mb-4 w-full text-sm">
          {error.value}
        </div>
      )}
    </form>
  );
}