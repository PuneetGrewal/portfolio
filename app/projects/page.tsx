import { Card, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  GitHubLogoIcon,
  CalendarIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Projects",
  description: "Look at some of my projects.",
};

type Project = {
  id: number;
  title: string;
  date?: string;
  github?: string;
  description: string;
  tags: string[];
};

// One card per row: at this column width, two columns of monospace text leave
// about 27 characters a line.
function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <CardTitle className="text-base leading-6 tracking-normal text-phosphor">
          {project.title}
        </CardTitle>
        {project.date && (
          <div className="flex items-center text-[13px] leading-6 text-muted-foreground">
            <CalendarIcon className="h-3.5 w-3.5 mr-2" />
            <span>{project.date}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 w-full">
        {project.tags.map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className="rounded-none border-line-strong px-2 py-px text-xs font-normal leading-5 text-muted-foreground"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <p
        dangerouslySetInnerHTML={{ __html: project.description }}
        className="text-sm leading-[1.65]"
      />

      {project.github && (
        <div className="flex flex-wrap gap-2 w-full">
          <Button variant="outline" size="sm" asChild className="h-11 min-w-11 sm:h-8 sm:min-w-0">
            <Link
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubLogoIcon />
              Source Code
            </Link>
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function Projects() {
  const personalProjects: Project[] = [
    {
      id: 2,
      title: "Math4Me Parent Portal",
      date: "2026",
      github: "https://github.com/PuneetGrewal/math4me-portal",
      description:
        "Internal tool for a tutoring centre: staff record attendance and write a report after each class, and the report is texted to every parent who has consented, with email as the fallback. Every write runs through an audited SQL function, staff sign in with enforced TOTP MFA, and the browser never touches the database directly. Over 600 automated tests gate every merge.",
      tags: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "RingCentral API", "Resend"],
    },
    {
      id: 0,
      title: "Math4Me",
      date: "2025",
      github: "https://github.com/PuneetGrewal/Math4Me",
      description:
        "An educational web application designed to help students practice and improve their math skills. The platform provides interactive problem-solving exercises and immediate feedback to enhance learning experience.",
      tags: ["Next.js", "Supabase", "JavaScript", "TailwindCSS"],
    },
    {
      id: 1,
      title: "Size-Saver",
      date: "2023",
      github: "https://github.com/PuneetGrewal/Size-Saver",
      description:
        "A mobile application that helps users track and manage their clothing sizes across different brands and stores. The app simplifies the shopping experience by maintaining a personal size database and providing size recommendations.",
      tags: ["Python", "Pandas", "BeautifulSoup", "wget"],
    },
  ];

  const courseworkProjects: Project[] = [
    {
      id: 1,
      title: "Database Systems",
      github: "https://github.com/PuneetGrewal/CSC_370",
      description:
        "Implementation of database management systems concepts including SQL queries, database design, and optimization techniques. Developed solutions for complex database problems and queries.",
      tags: ["SQL", "Database Design", "Python"],
    },
    {
      id: 2,
      title: "Train Scheduler",
      github: "https://github.com/PuneetGrewal/Train_Scheduler",
      description:
        "A scheduling system that optimizes train routes and timetables using constraint satisfaction algorithms. The project demonstrates efficient resource allocation and scheduling in transportation systems.",
      tags: ["C", "Algorithms", "Optimization", "Threads"],
    },
  ];

  return (
    <section>
      <h1 className="sr-only">Projects</h1>
      <h2 className="mx-section font-semibold text-2xl mb-8">Personal</h2>
      <div className="flex flex-col gap-6 mb-8">
        {personalProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <h2 className="mx-section font-semibold text-2xl mb-8">Coursework</h2>
      <div className="flex flex-col gap-6 mb-8">
        {courseworkProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
