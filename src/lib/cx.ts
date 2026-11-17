/** Join class names, skipping falsy values: cx(styles.a, on && styles.b). */
export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");
