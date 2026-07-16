const variants = {
  primary: 'bg-latam-estrellada text-white hover:bg-latam-coral',
  outline: 'border-2 border-latam-estrellada text-latam-estrellada hover:bg-latam-estrellada hover:text-white',
  ghost: 'text-latam-estrellada hover:bg-latam-estrellada/5',
}

export default function Button({ as: As = 'button', variant = 'primary', className = '', children, ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold transition active:scale-[0.98] ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </As>
  )
}
