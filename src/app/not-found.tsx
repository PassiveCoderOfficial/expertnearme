// src/app/not-found.tsx
export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        Sorry, the page you are looking for does not exist.
      </p>
      <a href="/" className="text-[#b84c4c] hover:underline">
        Go back home
      </a>
    </main>
  );
}
