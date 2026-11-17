import styles from "./Footer.module.css";

export function Footer({ name }: { name: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        © {new Date().getFullYear()} {name}
      </div>
    </footer>
  );
}
