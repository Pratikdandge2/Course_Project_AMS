"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
};

export function ScrollRevealTextureSection({ className = "", innerClassName = "", children }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      {
        root: null,
        threshold: 0.12,
        rootMargin: "-10% 0px -15% 0px",
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={(node) => {
        ref.current = node;
      }}
      className={[
        "texture-reveal-section",
        visible ? "is-visible" : "",
        className,
      ].join(" ")}
    >
      <div className={innerClassName}>{children}</div>
    </section>
  );
}

