import { Modal } from '@heroui/react';
import { FocusModeView } from './FocusModeView';
import { CloseIcon } from './icons';

interface FocusModeModalProps {
  open: boolean;
  onClose: () => void;
  /** Mirrors the dashboard's glassmorphism Card so the modal matches the rest of the app. */
  glassBlur: number;
  glassOpacity: number;
}

export function FocusModeModal({ open, onClose, glassBlur, glassOpacity }: FocusModeModalProps) {
  return (
    <Modal.Backdrop
      variant="blur"
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Modal.Container>
        <Modal.Dialog
          className="border border-white/10 bg-transparent! sm:max-w-sm"
          style={{
            backdropFilter: `blur(${glassBlur}px)`,
            WebkitBackdropFilter: `blur(${glassBlur}px)`,
            backgroundColor: `rgba(15, 23, 42, ${Math.max(glassOpacity, 60) / 100})`,
          }}
        >
          <Modal.CloseTrigger>
            <CloseIcon className="size-4" />
          </Modal.CloseTrigger>
          <Modal.Body className="py-6">
            <FocusModeView />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
