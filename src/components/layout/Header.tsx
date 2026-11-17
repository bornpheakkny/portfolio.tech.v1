"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import styles from "./Header.module.css";

/** True once the page has scrolled past the top few pixels. */
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update(); // e.g. reload mid-page or arriving at /#contact
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);
  return scrolled;
}

export function Header({ name, hasProjects }: { name: string; hasProjects: boolean }) {
  const scrolled = useScrolled();
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
    <header className={cx(styles.header, scrolled && styles.scrolled)}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand} aria-label={`${name}, home`}>
          <span className={styles.brandDot} />
          {initials}
        </Link>
        <ul className={styles.links}>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={styles.link}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="/#contact" className={styles.mobileCta}>
          Contact
        </a>
      </nav>
    </header>
  );
}
