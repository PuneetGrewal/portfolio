export default function Page() {
  return (
    <section className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        My Portfolio
      </h1>
      <p className="mb-4">
        {`I’m a software developer with hands-on experience in full-stack development and advanced hardware testing. Currently at Math4Me I am working on a custom enrollment system to streamline client data—improving efficiency and replacing the numerous existing Google Forms and Sheets in use.`}
      </p>

      <p className="mb-4">
        {`Past experience includes working on Network configurations, QA Testing, creating Software Acceptance Test Plans and working in Python to automate tasks. My tech stack includes Java, Python, C, and TypeScript, and I have experience with Next.js, React, Supabase, and SQL, bringing both robust technical solutions and user-friendly designs to every project.`}
      </p>
    </section>
  );
}