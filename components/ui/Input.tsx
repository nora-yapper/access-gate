import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

/**
 * Minimal technical input — no heavy borders, subtle glow on focus.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, className = "", id, ...props },
  ref
) {
  return (
    <label htmlFor={id} className="block">
      {label && (
        <span className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted">
          {label}
        </span>
      )}
      <input
        id={id}
        ref={ref}
        className={
          "w-full bg-transparent px-0 py-2.5 text-[15px] tracking-wide text-foreground " +
          "border-0 border-b border-b-[color:var(--line)] outline-none " +
          "placeholder:text-muted/60 caret-accent transition-[box-shadow,border-color] duration-200 " +
          "focus:border-b-accent focus:shadow-[0_1px_0_0_var(--accent),0_8px_24px_-18px_var(--accent)] " +
          "disabled:opacity-50 " +
          className
        }
        {...props}
      />
    </label>
  );
});
