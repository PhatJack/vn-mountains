import { create } from "zustand";

type FormRegistration = { isDirty: boolean; discard: () => void };
type PendingClose = { formId: string; onClose: () => void };

type UnsavedChangesState = {
  forms: Record<string, FormRegistration>;
  pendingClose: PendingClose | null;
  register: (formId: string, registration: FormRegistration) => void;
  unregister: (formId: string) => void;
  requestClose: (formId: string, onClose: () => void) => void;
  cancelClose: () => void;
  confirmClose: () => void;
};

export const useUnsavedChangesStore = create<UnsavedChangesState>((set, get) => ({
  forms: {},
  pendingClose: null,
  register: (formId, registration) =>
    set((state) => ({ forms: { ...state.forms, [formId]: registration } })),
  unregister: (formId) =>
    set((state) => {
      const forms = { ...state.forms };
      delete forms[formId];
      return { forms };
    }),
  requestClose: (formId, onClose) => {
    if (!get().forms[formId]?.isDirty) {
      onClose();
      return;
    }
    set({ pendingClose: { formId, onClose } });
  },
  cancelClose: () => set({ pendingClose: null }),
  confirmClose: () => {
    const pendingClose = get().pendingClose;
    if (!pendingClose) return;
    get().forms[pendingClose.formId]?.discard();
    pendingClose.onClose();
    set({ pendingClose: null });
  },
}));
