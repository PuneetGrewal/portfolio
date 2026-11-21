import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Live",
  description: "Sites I have built that are running in production.",
};

type Site = {
  slug: string;
  name: string;
  category: string;
  url: string;
  /** Shown in the browser frame's address bar. */
  host: string;
  status: "live" | "preview";
  description: string;
  tags: string[];
  icon: string;
  /** Full-page capture at 1440 wide; the card pans down it on hover. */
  screenshot: { src: string; height: number };
};

const sites: Site[] = [
  {
    slug: "racketlab",
    name: "The Racket Lab",
    category: "Racket stringing service",
    url: "https://theracketlab.ca",
    host: "theracketlab.ca",
    status: "live",
    description:
      "Marketing and ordering site for a racket-stringing service in Victoria, BC. Customers choose a string from live stock, book a doorstep pickup, and have the racket back within 24 hours. Includes a string-recommendation wizard, service-area lookup, and an admin dashboard behind Supabase auth.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Zod", "Vercel"],
    icon: "/live/racketlab/icon.png",
    screenshot: { src: "/live/racketlab/screenshot.webp", height: 4134 },
  },
  {
    slug: "math4me",
    name: "Math4Me Victoria",
    category: "Tutoring centre",
    url: "https://math4mevic.com",
    host: "math4mevic.com",
    status: "live",
    description:
      "Website for a tutoring centre in Victoria, BC, teaching math, English, science and social studies from grade 1 to 12. Drawn as a chalkboard that flips to a whiteboard, with a price board that shows each grade's prices and subjects, and a free-assessment booking form that emails the centre through a server action. Prices, mentors and hours live in typed content files that are checked at build time, with no database.",
    tags: ["Next.js", "TypeScript", "CSS Modules", "Resend", "Vitest", "Vercel"],
    icon: "/live/math4me/icon.png",
    screenshot: { src: "/live/math4me/screenshot.webp", height: 4395 },
  },
  {
    // Not on budwalconstruction.com until the client sends their material, so
    // this links the demo-content preview. At launch: point url at the real
    // domain, set host to it, flip status to "live", and recapture.
    slug: "budwal",
    name: "Budwal Construction",
    category: "Construction company",
    url: "https://budwal-git-demo-content-puneetgrewals-projects-7a555ee1.vercel.app/",
    host: "preview build",
    status: "preview",
    description:
      "Website for a builder doing new homes and renovations in Victoria, BC. Fully static, with no CMS or database: content is JSON, and project photographs run through a Sharp pipeline that commits AVIF and WebP derivatives. Renovations compare before and after shots with a slider, a toggle, or side-by-side frames, chosen per pair by how well the two line up. Scores 98 for mobile performance on PageSpeed Insights.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Zod", "Sharp", "Resend", "Vercel"],
    icon: "/live/budwal/icon.svg",
    screenshot: { src: "/live/budwal/screenshot.webp", height: 3560 },
  },
];

const VIEWPORT = 900;
// Pan at a steady pace whatever the page length, and never faster than 2s.
const scrollDuration = (height: number) =>
  `${Math.max(2, (height - VIEWPORT) / 650).toFixed(1)}s`;

function Status({ status }: { status: Site["status"] }) {
  if (status === "preview") {
    return (
      <span className="inline-flex items-center gap-1.5 border border-warn/35 bg-warn/10 px-2 py-px text-xs font-medium leading-5 text-warn">
        <span className="h-1.5 w-1.5 rounded-full bg-warn" />
        Launching soon
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 border border-line-strong bg-phosphor/10 px-2 py-px text-xs font-medium leading-5 text-phosphor">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-phosphor opacity-75 motion-safe:animate-ping" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-phosphor" />
      </span>
      Live
    </span>
  );
}

function SiteCard({ site, index }: { site: Site; index: number }) {
  return (
    <article className="site-card group relative">
      <div className="site-frame overflow-hidden border border-border bg-card transition-[border-color,box-shadow] duration-300">
        <div className="flex h-9 items-center gap-3 border-b border-border px-3.5">
          <span className="flex shrink-0 gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 bg-line-strong" />
            <span className="h-2.5 w-2.5 bg-line-strong" />
            <span className="h-2.5 w-2.5 bg-line-strong" />
          </span>
          <span className="flex-1 truncate text-center font-mono text-xs text-muted-foreground">
            {site.host}
          </span>
          {/* Balances the dots so the address stays centred. */}
          <span className="w-[42px] shrink-0" aria-hidden />
        </div>

        <div data-mx-media className="site-shot aspect-[16/10] overflow-hidden bg-background">
          <img
            src={site.screenshot.src}
            alt={`The ${site.name} home page`}
            width={1440}
            height={site.screenshot.height}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover"
            style={
              {
                "--scroll-duration": scrollDuration(site.screenshot.height),
              } as CSSProperties
            }
          />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-4">
        <img
          src={site.icon}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 border border-border"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-lg font-semibold">
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-phosphor outline-hidden group-hover:[text-shadow:0_0_12px_rgb(0_255_65/0.6)]"
              >
                {site.name}
                {site.status === "preview" && (
                  <span className="sr-only"> (preview)</span>
                )}
                {/* Stretches the link over the whole card. */}
                <span className="absolute inset-0 z-10" aria-hidden />
              </a>
            </h2>
            <Status status={site.status} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{site.category}</p>
        </div>

        <ArrowUpRight
          aria-hidden
          className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-phosphor"
        />
      </div>

      <p className="mt-4 text-sm leading-[1.65]">
        {site.description}
      </p>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Built with">
        {site.tags.map((tag) => (
          <li
            key={tag}
            className="border border-line-strong px-2.5 py-px font-mono text-[11px] leading-[18px] text-muted-foreground"
          >
            {tag}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function Live() {
  return (
    <section>
      <h1 className="mx-title font-semibold text-2xl mb-8">Live Sites</h1>

      <p className="mb-12 text-muted-foreground">
        {`Sites I've built that are running in production, plus one about to launch.`}
      </p>

      {/* Pulled wider than the text column so the screenshots read at a
          useful size; the viewport-relative width keeps it centred. */}
      <div className="relative left-1/2 mb-8 flex w-[92vw] max-w-3xl -translate-x-1/2 flex-col gap-20">
        {sites.map((site, index) => (
          <SiteCard key={site.slug} site={site} index={index} />
        ))}
      </div>
    </section>
  );
}
