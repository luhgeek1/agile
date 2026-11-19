import Image from 'next/image'

export function Logo() {
  return (
    <span className="brand">
      <Image
        className="brand-image"
        src="/brand/logo.webp"
        width={720}
        height={409}
        alt="Коплю — Трачу — Помогаю"
        loading="eager"
        unoptimized
      />
    </span>
  )
}
