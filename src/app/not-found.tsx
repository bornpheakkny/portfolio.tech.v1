import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl font-semibold">Lost in space</h1>
      <p className="mt-3 text-muted">This page drifted out of orbit.</p>
      <Link href="/" className="mt-8 rounded-full bg-brass px-6 py-3 font-medium text-void">
        Back home
      </Link>
    </main>
  );
}
