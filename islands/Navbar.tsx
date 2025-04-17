import { h } from "preact";
import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import Navbar from "../islands/Navbar.tsx"; // Import the Navbar component

export default function Dashboard() {
  const user = useSignal<any>(null); // We'll store user data here
  const files = useSignal<any[]>([]); // We'll store files related to the user here

  // Fetch user data (e.g., from an API or localStorage)
  useEffect(() => {
    const fetchUserData = () => {
      // Mock data, replace with actual API call
      user.value = {
        username: "John Doe",
        email: "johndoe@example.com",
      };

      files.value = [
        { name: "File 1", date: "2025-04-07", downloads: 5 },
        { name: "File 2", date: "2025-04-06", downloads: 3 },
      ];
    };

    fetchUserData();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove auth token
    window.location.href = "/"; // Redirect to landing page
  };

  return (
    <div>
      <Navbar /> {/* Include the Navbar here */}

      <div class="p-6">
        {/* User info section */}
        <section class="mb-6">
          <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Welcome, {user.value?.username || "User"}!
          </h2>
          <p class="text-gray-600 dark:text-gray-400">{user.value?.email}</p>
        </section>

        {/* Files section */}
        <section class="mb-6">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Your Files</h3>
          <div class="mt-4">
            {files.value.length === 0 ? (
              <p class="text-gray-500 dark:text-gray-400">You haven't uploaded any files yet.</p>
            ) : (
              <table class="min-w-full table-auto">
                <thead>
                  <tr>
                    <th class="px-4 py-2 text-left">File Name</th>
                    <th class="px-4 py-2 text-left">Date Uploaded</th>
                    <th class="px-4 py-2 text-left">Downloads</th>
                  </tr>
                </thead>
                <tbody>
                  {files.value.map((file, index) => (
                    <tr key={index} class="border-t">
                      <td class="px-4 py-2">{file.name}</td>
                      <td class="px-4 py-2">{file.date}</td>
                      <td class="px-4 py-2">{file.downloads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Logout button */}
        <section>
          <button
            onClick={handleLogout}
            class="w-full bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </section>
      </div>
    </div>
  );
}
