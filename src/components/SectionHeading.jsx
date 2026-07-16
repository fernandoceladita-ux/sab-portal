export default function SectionHeading({ eyebrow, title, icon: Icon }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[2px] text-latam-coral">{eyebrow}</p>
      )}
      <h2 className="flex items-center gap-2.5 text-2xl font-extrabold text-latam-estrellada sm:text-[28px]">
        {Icon && <Icon className="h-6 w-6 flex-shrink-0" />}
        {title}
      </h2>
    </div>
  )
}
