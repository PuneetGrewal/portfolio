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
      <h1 className="mx-title font-semibold text-2xl mb-8">Notes</h1>

      <p className="mb-8 text-muted-foreground">
        {`Handwritten notes I've made during my time teaching at Math4Me. Notes are free to use and distribute.`}
      </p>

      {groups.length === 0 ? (
        <div className="border border-dashed border-line-strong p-8 text-center text-muted-foreground">
          No notes posted yet — check back soon.
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.subject ?? 'other'}>
            {group.subject && (
              <h2 className="mx-section font-semibold text-xl mb-8">
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
