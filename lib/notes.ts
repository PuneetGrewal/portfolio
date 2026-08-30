import fs from 'fs'
import path from 'path'

export type Note = {
  slug: string
  file: string
  title: string
  description?: string
  subject?: string
  date?: string
  pages?: number
  size: string
}

/**
 * Every PDF dropped into /public/notes shows up on the notes page on its own,
 * titled from its file name and ordered by it, so a `01-`, `02-` prefix is
 * enough to control the sequence.
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

function titleFromFileName(fileName: string) {
  return fileName
    .replace(/\.pdf$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
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

// Best effort only: a PDF that keeps its page tree in a compressed object
// stream won't match here, and we'd rather show no page count than a wrong one.
function countPages(buffer: Buffer) {
  const matches = buffer.toString('latin1').match(/\/Type\s*\/Page[^s]/g)
  return matches?.length || undefined
}

export function getNotes(): Note[] {
  if (!fs.existsSync(notesDir)) return []

  return fs
    .readdirSync(notesDir)
    .filter((fileName) => fileName.toLowerCase().endsWith('.pdf'))
    .map((fileName) => {
      const meta = noteMeta[fileName] ?? {}
      const filePath = path.join(notesDir, fileName)

      return {
        slug: fileName.replace(/\.pdf$/i, ''),
        file: `/notes/${encodeURIComponent(fileName)}`,
        title: meta.title ?? titleFromFileName(fileName),
        description: meta.description,
        subject: meta.subject,
        date: meta.date,
        pages: countPages(fs.readFileSync(filePath)),
        size: formatSize(fs.statSync(filePath).size),
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
