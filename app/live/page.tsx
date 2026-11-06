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
    category: "Math tutoring centre",
    url: "https://math4mevic.com",
    host: "math4mevic.com",
    status: "live",
    description:
      "Marketing site and parent portal for a math tutoring centre in Victoria, BC, serving grades 6 through 12. Self-hosted, the app is containerized and runs on a single-node k3s Kubernetes cluster on a Mac mini at home, behind Traefik ingress and Cloudflare, with GitHub Actions building the image to GHCR and rolling out a new release on every push to main.",
    tags: [
      "SvelteKit",
      "TypeScript",
      "Tailwind CSS",
      "Docker",
      "Kubernetes",
      "GitHub Actions",
      "Cloudflare",
    ],
    icon: "/live/math4me/icon.png",
    screenshot: { src: "/live/math4me/screenshot.webp", height: 2291 },
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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Launching soon
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      Live
    </span>
  );
}

function SiteCard({ site, index }: { site: Site; index: number }) {
  return (
    <article
      className="site-card group relative"
      style={{ "--i": index } as CSSProperties}
    >
      <div className="site-frame overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex h-9 items-center gap-3 border-b border-neutral-200 px-3.5 dark:border-neutral-800">
          <span className="flex shrink-0 gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          </span>
          <span className="flex-1 truncate text-center font-mono text-xs text-neutral-500">
            {site.host}
          </span>
          {/* Balances the dots so the address stays centred. */}
          <span className="w-[42px] shrink-0" aria-hidden />
        </div>

        <div className="site-shot aspect-[16/10] overflow-hidden bg-white">
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
          className="h-11 w-11 shrink-0 rounded-xl ring-1 ring-black/10 dark:ring-white/10"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="outline-none"
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
          <p className="mt-0.5 text-sm text-neutral-500">{site.category}</p>
        </div>

        <ArrowUpRight
          aria-hidden
          className="mt-1 h-5 w-5 shrink-0 text-neutral-400 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-900 dark:group-hover:text-neutral-100"
        />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {site.description}
      </p>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Built with">
        {site.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-neutral-200 px-2.5 py-0.5 font-mono text-[11px] text-neutral-600 dark:border-neutral-800 dark:text-neutral-400"
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
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Live Sites</h1>

      <p className="mb-12 text-neutral-600 dark:text-neutral-400">
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
