import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Section.module.css";

/** A full-width translucent band with a centred content column. */
export function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={styles.section}>
      <div className={cx(styles.inner, className)}>{children}</div>
    </section>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className={styles.title}>{children}</h2>;
}
