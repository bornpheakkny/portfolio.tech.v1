import Link from "next/link";
import { cx } from "@/lib/cx";
import button from "@/components/ui/button.module.css";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Lost in space</h1>
      <p className={styles.text}>This page drifted out of orbit.</p>
      <Link href="/" className={cx(button.primary, styles.cta)}>
        Back home
      </Link>
    </main>
  );
}
