import { useSignal } from "@preact/signals";

export default function LoginForm() {
  const error = useSignal("");
  const loading = useSignal(false);

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    loading.value = true;
    error.value = "";

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem("authToken", result.token);
        globalThis.location.href = "/dashboard";
      } else {
        error.value = result.error || "Login failed";
      }
    } catch (err) {
      error.value = "Something went wrong. Please try again.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  return (
    <form onSubmit={handleLogin} class="space-y-4">
      <div>
        <label class="block mb-1">Email</label>
        <input
          type="email"
          name="email"
          class="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
      <div>
        <label class="block mb-1">Password</label>
        <input
          type="password"
          name="password"
          class="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
      <button
        type="submit"
        class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition w-full"
        disabled={loading.value}
      >
        {loading.value ? "Logging in..." : "Login"}
      </button>
      {error.value && <div class="bg-red-100 p-2 mt-4 text-red-700">{error.value}</div>}
    </form>
  );
}