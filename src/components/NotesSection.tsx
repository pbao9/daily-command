import { Button, Card, Dropdown, Input, Modal, TextField } from '@heroui/react';
import { useState } from 'react';
import type { Note } from '../types';
import { htmlToPlainText } from '../utils/html';
import { AddIcon, CloseIcon, MoreIcon, PinIcon } from './icons';
import { RichTextEditor } from './RichTextEditor';

interface NotesSectionProps {
  notes: Note[];
  onAdd: (title: string, body: string) => void;
  onUpdate: (id: string, patch: { title: string; body: string }) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

// Pinned notes get a bigger bento cell so goals stand out at a glance;
// everything else fills in around them via grid-flow-dense.
function cellClass(pinned: boolean) {
  return pinned ? 'sm:col-span-2 sm:row-span-2' : '';
}

export function NotesSection({ notes, onAdd, onUpdate, onTogglePin, onDelete }: NotesSectionProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function closeForm() {
    setAdding(false);
    setEditingId(null);
    setTitle('');
    setBody('');
  }

  function startAdd() {
    setEditingId(null);
    setTitle('');
    setBody('');
    setAdding(true);
  }

  function startEdit(note: Note) {
    setAdding(false);
    setEditingId(note.id);
    setTitle(note.title);
    setBody(note.body);
  }

  function submitForm() {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (editingId) {
      onUpdate(editingId, { title: trimmed, body });
    } else {
      onAdd(trimmed, body);
    }
    closeForm();
  }

  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <section className="flex flex-col gap-3 text-left">
      <span className="text-xs font-semibold tracking-wide text-white uppercase">Notes</span>

      <div className="grid auto-rows-[minmax(110px,auto)] grid-cols-2 gap-3 [grid-auto-flow:dense] sm:grid-cols-3">
        {sorted.map((note) =>
          editingId === note.id ? (
            <Card key={note.id} className="col-span-2 flex-col gap-2 sm:col-span-2 sm:row-span-2">
              <TextField value={title} onChange={setTitle}>
                <Input placeholder="Title" maxLength={200} autoFocus />
              </TextField>
              <RichTextEditor content={body} onChange={setBody} placeholder="Write your note..." />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="secondary" onPress={closeForm}>
                  Cancel
                </Button>
                <Button size="sm" onPress={submitForm}>
                  Save
                </Button>
              </div>
            </Card>
          ) : (
            <Card
              key={note.id}
              onClick={() => setViewingId(note.id)}
              className={`cursor-pointer flex-col gap-1 text-left ${cellClass(note.pinned)} ${note.pinned ? 'border-warning/50 bg-warning-soft/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 flex-1 font-semibold text-white">{note.title}</span>
                {note.pinned && <PinIcon className="size-3.5 shrink-0 text-warning" />}
                <div onClick={(e) => e.stopPropagation()}>
                  <Dropdown>
                    <Dropdown.Trigger
                      aria-label={`Note actions for "${note.title}"`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-field text-white transition-colors hover:bg-default-hover hover:text-white"
                    >
                      <MoreIcon className="size-4" />
                    </Dropdown.Trigger>
                    <Dropdown.Popover placement="bottom end">
                      <Dropdown.Menu>
                        <Dropdown.Item id="pin" textValue={note.pinned ? 'Unpin' : 'Pin'} onAction={() => onTogglePin(note.id)}>
                          {note.pinned ? 'Unpin' : 'Pin'}
                        </Dropdown.Item>
                        <Dropdown.Item id="edit" textValue="Edit" onAction={() => startEdit(note)}>
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item id="delete" textValue="Delete" variant="danger" onAction={() => onDelete(note.id)}>
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown>
                </div>
              </div>
              {note.body && (
                <p className="line-clamp-6 text-sm text-white">{htmlToPlainText(note.body)}</p>
              )}
            </Card>
          ),
        )}

        {adding ? (
          <Card className="col-span-2 flex-col gap-2 sm:col-span-2 sm:row-span-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">New note</span>
              <Button isIconOnly size="sm" variant="ghost" aria-label="Close" onPress={closeForm}>
                <CloseIcon className="size-4" />
              </Button>
            </div>
            <TextField value={title} onChange={setTitle}>
              <Input placeholder="Goal or note title..." maxLength={200} autoFocus />
            </TextField>
            <RichTextEditor content={body} onChange={setBody} placeholder="Write your note..." />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" onPress={closeForm}>
                Cancel
              </Button>
              <Button size="sm" onPress={submitForm}>
                Add
              </Button>
            </div>
          </Card>
        ) : (
          <button
            type="button"
            onClick={startAdd}
            className="flex min-h-[110px] flex-col items-center justify-center gap-1 rounded-field border border-dashed border-border text-white transition-colors hover:bg-default-hover"
          >
            <AddIcon className="size-5" />
            <span className="text-sm font-semibold">Add Note</span>
          </button>
        )}
      </div>

      {viewingId && (() => {
        const note = notes.find((n) => n.id === viewingId);
        if (!note) return null;
        return (
          <Modal.Backdrop variant="blur" isOpen onOpenChange={(isOpen) => !isOpen && setViewingId(null)}>
            <Modal.Container>
              <Modal.Dialog className="sm:max-w-lg">
                <Modal.CloseTrigger>
                  <CloseIcon className="size-4" />
                </Modal.CloseTrigger>
                <Modal.Header>
                  <Modal.Heading>{note.title}</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                  {note.body ? (
                    <div
                      className="text-sm text-white [&_a]:text-accent [&_a]:underline [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
                      dangerouslySetInnerHTML={{ __html: note.body }}
                    />
                  ) : (
                    <p className="text-sm text-white">No content.</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      onPress={() => {
                        startEdit(note);
                        setViewingId(null);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        );
      })()}
    </section>
  );
}
