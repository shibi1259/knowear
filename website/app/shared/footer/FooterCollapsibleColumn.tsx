"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type FooterLink = {
  title: string;
  link: string;
};

type Props = {
  title: string;
  links: FooterLink[];
  defaultOpen?: boolean;
  /** When true, the column is hidden on lg+ (used for mobile-only Terms & Policies). */
  mobileOnly?: boolean;
  /** When true, links open in a new tab (used for policy links). */
  externalLinks?: boolean;
};

const FooterCollapsibleColumn = ({
  title,
  links,
  defaultOpen = false,
  mobileOnly = false,
  externalLinks = false,
}: Props) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  const wrapperClass = mobileOnly
    ? "border-b lg:hidden"
    : "border-b lg:border-0";

  const headerClass = `flex items-center justify-between ${
    mobileOnly ? "" : "lg:justify-start"
  } mb-4 ${open ? "border-b lg:border-0" : "border-0"}`;

  // On lg screens (non-mobile-only columns) the list is always visible.
  const listVisibilityClass = mobileOnly
    ? open
      ? ""
      : "hidden"
    : open
    ? ""
    : "hidden lg:block";

  return (
    <div className={wrapperClass}>
      <div className={headerClass}>
        <h4 className="font-bold text-sm uppercase">{title}</h4>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={mobileOnly ? "" : "lg:hidden"}
          aria-expanded={open}
          aria-label={`Toggle ${title}`}
        >
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      <ul className={`space-y-2 ${listVisibilityClass}`}>
        {links.map((item, index) => (
          <li key={index}>
            <Link
              href={item.link}
              className="text-sm text-gray-600 hover:text-black transition-colors"
              {...(externalLinks
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterCollapsibleColumn;
