import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Live",
  description: "Sites I have built that are running in production.",
};

export default function Live() {
  const sites = [
    {
      id: 0,
      name: "The Racket Lab",
      domain: "theracketlab.ca",
      url: "https://theracketlab.ca",
      description:
        "Marketing and ordering site for a racket-stringing service in Victoria, BC. Customers choose a string from live stock, book a doorstep pickup, and have the racket back within 24 hours. Includes a string-recommendation wizard, service-area lookup, and an admin dashboard behind Supabase auth.",
      tags: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Zod", "Vercel"],
    },
    {
      id: 1,
      name: "Math4Me Victoria",
      domain: "math4mevic.com",
      url: "https://math4mevic.com",
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
    },
  ];

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Live Sites</h1>

      <p className="mb-8 text-neutral-600 dark:text-neutral-400">
        {`Sites I've built that are running in production today.`}
      </p>

      <div className="flex flex-col gap-6 mb-8">
        {sites.map((site) => (
          <Card
            key={site.id}
            className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 flex-wrap">
                <span>{site.name}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-normal text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </CardTitle>

              <CardDescription className="flex flex-wrap gap-2 w-full">
                {site.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {site.description}
              </p>
            </CardContent>

            <CardFooter className="mt-auto flex flex-col gap-4">
              <div className="flex flex-wrap gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hover:bg-white hover:text-black transition-colors duration-200"
                >
                  <Link
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkIcon />
                    {site.domain}
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
