import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import {
  GitHubLogoIcon,
  CalendarIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Projects",
  description: "Look at some of my projects.",
};

export default function Projects() {
  const personalProjects = [
    {
      id: 0,
      title: "Math4Me",
      date: "2023",
      github: "https://github.com/PuneetGrewal/Math4Me",
      description: 
        "An educational web application designed to help students practice and improve their math skills. The platform provides interactive problem-solving exercises and immediate feedback to enhance learning experience.",
      tags: ["Python", "Django", "JavaScript", "HTML/CSS"],
    },
    {
      id: 1,
      title: "Size-Saver",
      date: "2023",
      github: "https://github.com/PuneetGrewal/Size-Saver",
      description:
        "A mobile application that helps users track and manage their clothing sizes across different brands and stores. The app simplifies the shopping experience by maintaining a personal size database and providing size recommendations.",
      tags: ["Python", "Pan", "Firebase"],
    },
  ];

  const courseworkProjects = [
    {
      id: 1,
      title: "Database Systems (CSC 370)",
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
      tags: ["Python", "Algorithms", "Optimization"],
    },
  ];

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Personal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {personalProjects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription className="grid grid-rows-2 gap-2">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {project.date}
                </div>

                <div className="flex flex-wrap gap-2 w-full">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p
                dangerouslySetInnerHTML={{ __html: project.description }}
                className="text-sm text-muted-foreground"
              />
            </CardContent>
            <CardFooter className="mt-auto flex flex-col gap-4">
              <div className="flex flex-wrap gap-2 w-full">
                {project.github && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GitHubLogoIcon />
                      Source Code
                    </Link>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        Coursework
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {courseworkProjects.map((project) => (
          <Card key={project.id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>

              <CardDescription className="flex flex-wrap gap-2 w-full">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p
                dangerouslySetInnerHTML={{ __html: project.description }}
                className="text-sm text-muted-foreground"
              />
            </CardContent>
            <CardFooter className="mt-auto flex flex-col gap-4">
              <div className="flex flex-wrap gap-2 w-full">
                {project.github && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GitHubLogoIcon />
                      Source Code
                    </Link>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}