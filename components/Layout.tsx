import { ComponentChildren } from "preact";

interface LayoutProps {
  children: ComponentChildren;
  user?: { id: string; email: string } | null;
}

export default function Layout({ children, user }: LayoutProps) {
  return (
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <a href="/" class="font-bold text-xl text-blue-600">SecureShare</a>
          
          <nav>
            <ul class="flex space-x-6">
              {user ? (
                <>
                  <li>
                    <a href="/dashboard" class="text-gray-700 hover:text-blue-500">
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="/upload" class="text-gray-700 hover:text-blue-500">
                      Upload
                    </a>
                  </li>
                  <li>
                    <a href="/encrypt-decrypt" class="text-gray-700 hover:text-blue-500">
                      Encrypt/Decrypt
                    </a>
                  </li>
                  <li>
                    <a href="/logout" class="text-gray-700 hover:text-blue-500">
                      Logout
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a href="/login" class="text-gray-700 hover:text-blue-500">
                      Login
                    </a>
                  </li>
                  <li>
                    <a href="/signup" class="text-gray-700 hover:text-blue-500">
                      Register
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      
      <main class="flex-grow">{children}</main>
      
      <footer class="bg-white border-t">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p class="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SecureShare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
