import { cx } from "@/lib/cx";
import styles from "./TechList.module.css";

/** Pill list of technologies. Spacing above it is the caller's job (pass `className`). */
export function TechList({ items, small, className }: { items: string[]; small?: boolean; className?: string }) {
  if (!items.length) return null;
  return (
    <ul className={cx(styles.list, className)}>
      {items.map((t) => (
        <li key={t} className={cx(styles.tag, small && styles.small)}>
          {t}
        </li>
      ))}
    </ul>
  );
}
