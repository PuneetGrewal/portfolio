import fs from 'fs'
import path from 'path'

export type NoteImage = {
  src: string
  width: number
  height: number
}

export type Note = {
  slug: string
  file: string
  title: string
  description?: string
  subject?: string
  date?: string
  size: string
  /** Rendered page images, in order. Their count is the note's page count. */
  pages: NoteImage[]
  /** Small render of page one, shown on the card. */
  thumb?: NoteImage
}

/**
 * Every PDF dropped into /public/notes shows up on the notes page on its own,
 * titled from its file name and ordered by it, so a `01-`, `02-` prefix is
 * enough to control the sequence.
 *
 * Page images are read from /public/note-previews, keyed by a slug of the file
 * name — see scripts/render-notes.sh, which writes them. A note with no
 * rendered pages still lists and downloads; it just has nothing to preview.
 *
 * This map is only for making an entry nicer than its file name. Keys are the
 * file name exactly as it appears on disk, and anything left out falls back to
 * the file name. A `subject` groups notes under a shared heading on the page.
 */
const noteMeta: Record<
  string,
  { title?: string; description?: string; subject?: string; date?: string }
> = {
  // 'csc370-relational-algebra.pdf': {
  //   title: 'Relational Algebra',
  //   subject: 'CSC 370',
  //   date: 'Fall 2023',
  //   description: 'Selection, projection and joins, plus the identities used to rewrite queries.',
  // },
}

const notesDir = path.join(process.cwd(), 'public', 'notes')
const previewsDir = path.join(process.cwd(), 'public', 'note-previews')

function titleFromFileName(fileName: string) {
  return fileName
    .replace(/\.pdf$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

/** Must match the slug that scripts/render-notes.sh names its output with. */
function previewSlug(fileName: string) {
  return fileName
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let size = bytes / 1024
  let unit = 0

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit++
  }

  return `${size < 10 ? size.toFixed(1) : Math.round(size)} ${units[unit]}`
}

/** Width and height straight out of the PNG's IHDR chunk. */
function pngSize(filePath: string) {
  const header = Buffer.alloc(24)
  const handle = fs.openSync(filePath, 'r')

  try {
    fs.readSync(handle, header, 0, 24, 0)
  } finally {
    fs.closeSync(handle)
  }

  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) }
}

function toImage(fileName: string): NoteImage {
  return {
    src: `/note-previews/${fileName}`,
    ...pngSize(path.join(previewsDir, fileName)),
  }
}

export function getNotes(): Note[] {
  if (!fs.existsSync(notesDir)) return []

  const previewFiles = fs.existsSync(previewsDir)
    ? fs.readdirSync(previewsDir)
    : []

  return fs
    .readdirSync(notesDir)
    .filter((fileName) => fileName.toLowerCase().endsWith('.pdf'))
    .map((fileName) => {
      const meta = noteMeta[fileName] ?? {}
      const filePath = path.join(notesDir, fileName)
      const slug = previewSlug(fileName)

      const pages = previewFiles
        .filter((preview) => new RegExp(`^${slug}-p\\d+\\.png$`).test(preview))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map(toImage)

      const thumbFile = `${slug}-thumb.png`

      return {
        slug,
        file: `/notes/${encodeURIComponent(fileName)}`,
        title: meta.title ?? titleFromFileName(fileName),
        description: meta.description,
        subject: meta.subject,
        date: meta.date,
        size: formatSize(fs.statSync(filePath).size),
        pages,
        thumb: previewFiles.includes(thumbFile) ? toImage(thumbFile) : undefined,
      }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug, undefined, { numeric: true }))
}

/**
 * Groups notes under their subject heading, keeping the order the notes came
 * in. Notes without a subject collect into a single trailing group.
 */
export function groupNotesBySubject(notes: Note[]) {
  const groups: { subject?: string; notes: Note[] }[] = []

  for (const note of notes) {
    const group = groups.find((candidate) => candidate.subject === note.subject)

    if (group) {
      group.notes.push(note)
    } else {
      groups.push({ subject: note.subject, notes: [note] })
    }
  }

  return groups.sort((a, b) => Number(!a.subject) - Number(!b.subject))
}
