import Layout from "../components/Layout.tsx";

export default function Landing() {
 
  return (
    <Layout>
      <div class="p-4 mx-auto max-w-screen-md">
        <header class="py-8 text-center">
          <h1 class="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
            Welcome to Secure File Sharing
          </h1>

          <p class="text-lg text-black-200">
            Your trusted platform for secure, encrypted, and self-destructing file sharing.
          </p>
        </header>

        <main class="mt-8 space-y-8">
          <article class="bg-white bg-opacity-80 p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-4 text-blue-600">Why Choose Secure File Sharing?</h2>
            <p class="text-gray-700">
              In today's digital age, protecting your sensitive information is more important than ever. Our platform ensures that your files are encrypted with AES-256, providing military-grade security for your data.
            </p>
          </article>

          <article class="bg-white bg-opacity-80 p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-4 text-green-600">Self-Destructing Links</h2>
            <p class="text-gray-700">
              Share files with peace of mind. Our self-destructing links automatically expire after a set time or number of downloads, ensuring your data doesn't linger online longer than necessary.
            </p>
          </article>

          <article class="bg-white bg-opacity-80 p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-4 text-purple-600">Stay Informed</h2>
            <p class="text-gray-700">
              Receive instant email notifications whenever your shared files are downloaded. Stay in control and track your file-sharing activity effortlessly.
            </p>
          </article>

          <article class="bg-white bg-opacity-80 p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-4 text-red-600">Get Started Today</h2>
            <p class="text-gray-700">
              Join thousands of users who trust us for their secure file-sharing needs. Experience the convenience and security of our platform today.
            </p>
          </article>
        </main>

        <footer class="mt-12 text-center text-gray-300">
          <p>&copy; 2025 Secure File Sharing. All rights reserved.</p>
        </footer>

        <div class="relative z-10 flex justify-center space-x-4 pb-8 animate-fade-in">
        <div class="mt-8 flex justify-center">
        <a href="/login">
            <button type="button" class="bg-blue-500 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition flex items-center space-x-2">
              <span>login</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8v1a2 2 0 002 2h12a2 2 0 002-2V8m-4 4l-4-4m0 0l-4 4m4-4v12" />
              </svg>
            </button>
          </a>
      </div>
          <div class="text-center mt-3">
            <a href="/upload" class="text-sm text-blue-500 hover:underline">
              Continue as a Guest
            </a>
          </div>

          <div class="mt-8 flex justify-center">
          <a href="/signup">
            <button type="button" class="bg-green-500 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition flex items-center space-x-2">
              <span>Sign Up</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8v1a2 2 0 002 2h12a2 2 0 002-2V8m-4 4l-4-4m0 0l-4 4m4-4v12" />
              </svg>
            </button>
          </a>
      </div>
        </div>
      </div>
    </Layout>
  );
}
