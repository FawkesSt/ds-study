// src/components/Button/Button.jsx
import './Button.css'

export function Button({
  variant  = 'primary',
  disabled = false,
  onClick,
  children,
}) {
  return (
    <button
      className={[
        'ds-button',
        `ds-button--${variant}`,
        disabled ? 'ds-button--disabled' : '',
      ].join(' ')}
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}
    >
      <span className="ds-button__label">{children}</span>
    </button>
  )
}