import button from "@/components/ui/button.module.css";
import styles from "./Hero.module.css";

/** You are the sun: name and headline over the orrery. */
export function Hero({ name, location, headline, hasProjects }: { name: string; location?: string; headline?: string; hasProjects: boolean }) {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.location} style={{ animationDelay: "0.1s" }}>
          {location}
        </p>
        <h1 className={styles.name} style={{ animationDelay: "0.2s" }}>
          {name}
        </h1>
        <p className={styles.tagline} style={{ animationDelay: "0.35s" }}>
          {headline}. Every planet out there is a technology I work with.
        </p>
        <div className={styles.actions} style={{ animationDelay: "0.5s" }}>
          <a href={hasProjects ? "#work" : "#stack"} className={button.primary}>
            {hasProjects ? "See my work" : "See my stack"}
          </a>
          <a href="#contact" className={button.outline}>
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
