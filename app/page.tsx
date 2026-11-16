import Link from "next/link";

const link =
  "underline underline-offset-2 decoration-neutral-400 hover:decoration-neutral-900 dark:hover:decoration-neutral-100";

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Hi, I'm Puneet
      </h1>
      <p className="mb-4">
        {`I'm a software developer in Victoria, BC. I studied Computer Science at UVic, with a minor in Business.`}
      </p>

      <p className="mb-4">
        {`Right now I work at Math4Me, a tutoring centre with three locations. I built the portal parents use to see attendance and progress reports, and I rebuilt the centre's website. I also help run the day to day, from scheduling 75+ students to hiring and training new mentors.`}
      </p>

      <p className="mb-4">
        {`On the side I run The Racket Lab, a racket stringing service I started. I built the booking site myself, and it has taken over 75 orders from more than 50 customers so far. I also keep an old Mac mini at home running as a small server that hosts some of my live sites.`}
      </p>

      <p className="mb-4">
        {`Before that I did two co-op terms at Lantronix in Vancouver, testing network hardware and an in-car entertainment system, and writing scripts to take care of the repetitive work.`}
      </p>

      <p className="mb-4">
        You can see the sites I've built on the{" "}
        <Link href="/live" className={link}>
          Live
        </Link>{" "}
        page, or check out my other{" "}
        <Link href="/projects" className={link}>
          projects
        </Link>
        .
      </p>
    </section>
  );
}
