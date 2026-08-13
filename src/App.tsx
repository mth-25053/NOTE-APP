import { useState, useEffect } from "react";
import "./App.css";

type Note = {
  id: number;
  title: string,
  createdAt: string;
  description: string;
  color: string;
};

const colors = [
  "#fde68a",
  "#bbf7d0",
  "#bfdbfe",
  "#fbcfe8",
  "#ddd6fe",
];

function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem("notes");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [nextId, setNextId] = useState(() => {
    try {
      const saved = localStorage.getItem("nextId");
      const parsed = saved ? Number(saved) : NaN;
      return Number.isFinite(parsed) ? parsed : 1;
    } catch {
      return 1;
    }
  });
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("nextId", String(nextId));
  }, [nextId]);

  function addNote() {
    if (title.trim() === "" || description.trim() === "") {
      alert("يجب عليك ملء العنوان والملاحظة");
      return;
    }

    const newNote: Note = {
      id: nextId,
      title: title,
      createdAt: new Date().toLocaleString("fr-FR"),
      description: description,
      color: selectedColor,
    };

    setNotes((previousNotes) => [...previousNotes, newNote]);
    setNextId((previousId) => previousId + 1);

    setTitle("");
    setDescription("");
    setSelectedColor(colors[0]);
    setIsFormOpen(false);
  }

  function deleteNote(id: number) {
    setNotes((previousNotes) =>
      previousNotes.filter((note) => note.id !== id)
    );
  }

  function saveEditedNote(id: number) {
    setNotes((previousNotes) =>
      previousNotes.map((note) =>
        note.id === id
          ? { ...note, title: editTitle, description: editDescription }
          : note
      )
    );
    setIsEditingNote(false);
  }

  function eraseLastNote() {
    if (notes.length === 0) return;
    const lastNoteId = notes[notes.length - 1].id;
    setNotes((previousNotes) => previousNotes.slice(0, -1));
    setSelectedNoteId((previousSelectedId) =>
      previousSelectedId === lastNoteId ? null : previousSelectedId
    );
  }

  function addRandomNote() {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newNote: Note = {
      id: nextId,
      title: `ملاحظة عشوائية رقم ${nextId}`,
      createdAt: new Date().toLocaleString("fr-FR"),
      description: `هذا محتوى تجريبي للملاحظة رقم ${nextId}`,
      color: randomColor,
    };

    setNotes((previousNotes) => [...previousNotes, newNote]);
    setNextId((previousId) => previousId + 1);
  }

  return (
    <main className="app">
      <header className="header">
        <h1>ملاحظاتي</h1>

        <button
          className="add-button"
          onClick={() => setIsFormOpen(true)}
        >
          +
        </button>

        <button className="random-button" onClick={addRandomNote}>
          إضافة عشوائية
        </button>

        <button className="erase-button" onClick={eraseLastNote}>
          مسح
        </button>
      </header>

      {isFormOpen && (
        <div className="form-overlay">
          <div
            className="note-form"
            style={{ backgroundColor: selectedColor }}
          >
            <button
              className="close-button"
              onClick={() => {
                setIsFormOpen(false);
                setTitle("");
                setDescription("");
                setSelectedColor(colors[0]);
              }}
            >
              إلغاء
            </button>

            <h2>العنوان رقم {nextId}</h2>

            <input
              type="text"
              placeholder="اكتب العنوان"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <textarea
              placeholder="اكتب الملاحظة"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <div className="color-options">
              {colors.map((color) => (
                <button
                  key={color}
                  className="color-box"
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>

            <button className="save-button" onClick={addNote}>
              حفظ
            </button>
          </div>
        </div>
      )}

      <section className="notes-grid">
        {notes.map((note) => (
          <article
            className="note-card"
            key={note.id}
            style={{ backgroundColor: note.color }}
            onClick={() => {
              setSelectedNoteId(
                selectedNoteId === note.id ? null : note.id
              );
              setIsEditingNote(false);
            }}
          >
            <h2>الملاحظة رقم {note.id}</h2>
            <h2>{note.title}</h2>
            <p>{note.description}</p>
            <p>{note.createdAt}</p>
          </article>
        ))}
      </section>

      {selectedNoteId !== null && (
        <div className="view-overlay">
          {notes
            .filter((note) => note.id === selectedNoteId)
            .map((note) =>
              isEditingNote ? (
                <article
                  className="selected-note"
                  key={note.id}
                  style={{ backgroundColor: note.color }}
                >
                  <h2>تعديل الملاحظة رقم {note.id}</h2>

                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                  />

                  <textarea
                    value={editDescription}
                    onChange={(event) =>
                      setEditDescription(event.target.value)
                    }
                  />

                  <p>{note.createdAt}</p>

                  <button onClick={() => saveEditedNote(note.id)}>
                    حفظ التغييرات
                  </button>

                  <button
                    onClick={() => {
                      deleteNote(note.id);
                      setSelectedNoteId(null);
                    }}
                  >
                    حذف
                  </button>

                  <button
                    onClick={() => setSelectedNoteId(null)}
                  >
                    إغلاق
                  </button>
                </article>
              ) : (
                <article
                  className="selected-note"
                  key={note.id}
                  style={{ backgroundColor: note.color }}
                >
                  <h2>الملاحظة رقم {note.id}</h2>
                  <h2>{note.title}</h2>
                  <p>{note.description}</p>
                  <p>{note.createdAt}</p>

                  <button
                    onClick={() => {
                      setIsEditingNote(true);
                      setEditTitle(note.title);
                      setEditDescription(note.description);
                    }}
                  >
                    تعديل
                  </button>

                  <button
                    onClick={() => {
                      deleteNote(note.id);
                      setSelectedNoteId(null);
                    }}
                  >
                    حذف
                  </button>

                  <button
                    onClick={() => setSelectedNoteId(null)}
                  >
                    إغلاق
                  </button>
                </article>
              )
            )}
        </div>
      )}
    </main>
  );
}

export default App;