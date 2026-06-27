type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Procedural action button. Reads as a system control, not a marketing CTA.
 */
export function Button({ className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={
        "group w-full select-none border border-[color:var(--accent-dim)] bg-transparent " +
        "px-4 py-4 sm:py-3 text-[13px] sm:text-[12px] uppercase tracking-[0.28em] text-accent " +
        "transition-[background-color,box-shadow,opacity] duration-200 " +
        "hover:bg-[color:var(--secondary)] hover:shadow-[0_0_24px_-8px_var(--accent)] " +
        "active:translate-y-px " +
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
