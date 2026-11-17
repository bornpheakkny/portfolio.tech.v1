import { cx } from "@/lib/cx";
import { Section, SectionTitle } from "@/components/ui/Section";
import link from "@/components/ui/link.module.css";
import { ContactForm } from "@/features/contact/ContactForm";
import styles from "./Contact.module.css";

export function Contact({ email }: { email?: string }) {
  return (
    <Section id="contact" className={styles.inner}>
      <div>
        <SectionTitle>Say hello</SectionTitle>
        <p className={styles.intro}>Have a project, a role or a question? Send a message and I&apos;ll get back to you.</p>
        {email && (
          <a href={`mailto:${email}`} className={cx(link.text, styles.email)}>
            {email}
          </a>
        )}
      </div>
      <ContactForm />
    </Section>
  );
}
