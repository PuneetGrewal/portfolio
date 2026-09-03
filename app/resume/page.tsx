import Link from "next/link";
import { DownloadIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

const resumeFile = "/resume/Puneet_Grewal_Resume.pdf";

// Rendered from the PDF at 200 DPI. Showing the page as an image keeps the
// browser's PDF viewer chrome — toolbar, sidebar, zoom — off the page; the
// buttons above hand over the real PDF.
const resumePage = {
  src: "/resume/resume-page.png",
  width: 1700,
  height: 2200,
};

export const metadata = {
  title: "Resume",
  description: "My resume, viewable here or downloadable as a PDF.",
};

const actionButton =
  "hover:bg-white hover:text-black transition-colors duration-200";

export default function Resume() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Resume</h1>

      <div className="mb-8 flex flex-wrap gap-2">
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

      {/* Pulled wider than the page's text column, which is too narrow to read
          a letter-size page in. The viewport-relative width stays centred. */}
      <div className="relative left-1/2 mb-8 w-[92vw] max-w-3xl -translate-x-1/2">
        {/* A plain img, not next/image: this is one fixed static page render,
            so the optimizer buys nothing and costs an image transform per
            visitor. Width and height are set to reserve the space. */}
        <img
          src={resumePage.src}
          alt="Puneet Grewal's resume"
          width={resumePage.width}
          height={resumePage.height}
          className="h-auto w-full rounded-xl shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800"
        />
      </div>
    </section>
  );
}
