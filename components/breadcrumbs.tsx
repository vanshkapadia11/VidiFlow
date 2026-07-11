// components/breadcrumbs.tsx
import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "lucide-react";

interface Crumb {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: Crumb[]; // does NOT include Home — it's added automatically
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const baseUrl = "https://www.vidiflow.co";

  const fullTrail: Crumb[] = [{ name: "Home", href: "/" }, ...items];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fullTrail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.href === "/" ? "" : crumb.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-6 pt-6">
        <ol className="flex items-center flex-wrap gap-1.5 text-[10px] font-black uppercase tracking-widest">
          {fullTrail.map((crumb, i) => {
            const isLast = i === fullTrail.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {i === 0 ? (
                  <Link
                    href={crumb.href}
                    className="flex items-center gap-1 text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    <HomeIcon className="h-3 w-3" />
                    <span>{crumb.name}</span>
                  </Link>
                ) : isLast ? (
                  <span className="text-zinc-800">{crumb.name}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
                {!isLast && (
                  <ChevronRightIcon className="h-3 w-3 text-zinc-300 shrink-0" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
