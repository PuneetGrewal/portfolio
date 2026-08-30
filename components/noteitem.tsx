import { Download, ExternalLink, Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Note } from '@/lib/notes'

const actionButton =
  'hover:bg-white hover:text-black transition-colors duration-200'

export function NoteItem({ note }: { note: Note }) {
  const details = [
    note.date,
    note.pages ? `${note.pages} ${note.pages === 1 ? 'page' : 'pages'}` : null,
    note.size,
  ].filter(Boolean)

  return (
    <Card className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-start gap-2">
          <FileText className="h-4 w-4 mt-[3px] shrink-0 text-neutral-500" />
          <span>{note.title}</span>
        </CardTitle>

        {/* The subject is already the heading this card sits under, so the
            only thing left to say here is how big the download is. */}
        <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
          {details.join(' · ')}
        </CardDescription>
      </CardHeader>

      {note.description && (
        <CardContent className="flex-grow">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {note.description}
          </p>
        </CardContent>
      )}

      <CardFooter className="mt-auto flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className={actionButton}>
              <Eye />
              Preview
            </Button>
          </DialogTrigger>

          <DialogContent
            aria-describedby={undefined}
            className="flex flex-col gap-0 p-0 w-[95vw] max-w-5xl h-[90vh] overflow-hidden bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 py-3 pl-4 pr-12">
              <DialogTitle className="truncate text-base">
                {note.title}
              </DialogTitle>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={actionButton}
                >
                  <a
                    href={note.file}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink />
                    <span className="hidden sm:inline">Open</span>
                  </a>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={actionButton}
                >
                  <a href={note.file} download>
                    <Download />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                </Button>
              </div>
            </div>

            {/* Rendered by the browser's own PDF viewer; the children below are
                the fallback for browsers (mostly mobile) that can't do that. */}
            <object
              data={`${note.file}#view=FitH`}
              type="application/pdf"
              className="min-h-0 w-full flex-1"
            >
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {`Your browser can't show this PDF inline.`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={actionButton}
                >
                  <a
                    href={note.file}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink />
                    Open the PDF
                  </a>
                </Button>
              </div>
            </object>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" asChild className={actionButton}>
          <a href={note.file} download>
            <Download />
            Download
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
