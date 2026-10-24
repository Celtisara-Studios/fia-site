import './phone-note.css'

/** Phones get a note instead of the desk: it's made to be panned around on a bigger screen. */
export function PhoneNote() {
  return (
    <main className="phone-note">
      <img className="phone-note-pup" src="/art/puppy.svg" alt="" draggable={false} />
      <h1 className="phone-note-name">Fia Bondy</h1>
      <p className="phone-note-text">My desk needs a bigger screen. Come find it on a laptop or desktop computer.</p>
    </main>
  )
}
