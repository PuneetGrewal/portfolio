import { ReplayIntro } from '@/components/matrix/replay-intro'

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="mb-16">
      <ul className="text-[13px] mt-8 flex flex-col space-x-0 space-y-2 text-muted-foreground md:flex-row md:space-x-6 md:space-y-0">
        <li>
          <a
            className="flex min-h-11 items-center transition-colors hover:text-phosphor sm:min-h-0"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/PuneetGrewal"
          >
            <ArrowIcon />
            <p className="ml-2 h-7 leading-7">github</p>
          </a>
        </li>
        <li>
          <ReplayIntro />
        </li>
      </ul>
      <p className="mt-8 text-[13px] text-muted-foreground">
        © {new Date().getFullYear()} Puneet Grewal. All rights reserved.
      </p>
    </footer>
  )
}
