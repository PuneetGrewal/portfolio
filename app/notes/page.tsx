import { NoteItem } from '@/components/noteitem'
import { getNotes, groupNotesBySubject } from '@/lib/notes'

export const metadata = {
  title: 'Notes',
  description: 'Handwritten notes of mine, free to preview or download.',
}

export default function Notes() {
  const groups = groupNotesBySubject(getNotes())

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Notes</h1>

      <p className="mb-8 text-neutral-600 dark:text-neutral-400">
        {`Handwritten notes I've made during my time teaching at Math4Me. Notes are free to use and distribute.`}
      </p>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center text-neutral-600 dark:text-neutral-400">
          No notes posted yet — check back soon.
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.subject ?? 'other'}>
            {group.subject && (
              <h2 className="font-semibold text-xl mb-8 tracking-tighter">
                {group.subject}
              </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {group.notes.map((note) => (
                <NoteItem key={note.slug} note={note} />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  )
}
