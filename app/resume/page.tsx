import Link from "next/link";
import { DownloadIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

const resumeFile = "/resume/Puneet_Grewal_Resume.pdf";

export const metadata = {
  title: "Resume",
  description: "My resume, viewable in the browser or downloadable as a PDF.",
};

const actionButton =
  "hover:bg-white hover:text-black transition-colors duration-200";

export default function Resume() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Resume</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild className={actionButton}>
          <a href={resumeFile} download>
            <DownloadIcon />
            Download PDF
          </a>
        </Button>

        <Button variant="outline" size="sm" asChild className={actionButton}>
          <Link href={resumeFile} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon />
            Open full size
          </Link>
        </Button>
      </div>

      {/* Pulled wider than the page's text column so the resume is actually
          readable; the viewport-relative width keeps it centred either way. */}
      <div className="relative left-1/2 w-[92vw] max-w-4xl -translate-x-1/2">
        {/* Rendered by the browser's own PDF viewer. The children are the
            fallback for browsers, mostly mobile, that can't do that inline. */}
        <object
          data={`${resumeFile}#view=FitH`}
          type="application/pdf"
          aria-label="Resume"
          className="aspect-[8.5/11] w-full rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex aspect-[8.5/11] w-full flex-col items-center justify-center gap-4 rounded-xl border border-neutral-200 bg-neutral-100 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {`Your browser can't show this PDF inline.`}
            </p>
            <Button variant="outline" size="sm" asChild className={actionButton}>
              <Link
                href={resumeFile}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon />
                Open the resume
              </Link>
            </Button>
          </div>
        </object>
      </div>
    </section>
  );
}
