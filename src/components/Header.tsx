import Link from "next/link";

export function Header({ name, hasProjects }: { name: string; hasProjects: boolean }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  const links = [
    hasProjects && { href: "/#work", label: "Work" },
    { href: "/#stack", label: "Stack" },
    { href: "/#about", label: "About" },
    { href: "/#contact", label: "Contact" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-sm font-semibold tracking-wide text-star" aria-label={`${name}, home`}>
          <span className="mr-2 inline-block size-2.5 rounded-full bg-brass align-middle shadow-[0_0_14px_#e3b866]" />
          {initials}
        </Link>
        <ul className="hidden gap-1 sm:flex rounded-full border border-orbit/70 bg-void/60 px-2 py-1 text-sm backdrop-blur">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="block rounded-full px-3 py-1 text-muted transition-colors hover:text-star">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="/#contact" className="rounded-full border border-orbit/70 bg-void/60 px-4 py-1.5 text-sm text-star backdrop-blur sm:hidden">
          Contact
        </a>
      </nav>
    </header>
  );
}
