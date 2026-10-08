"use client";

import { useEffect } from "react";

import { useUnsavedChangesStore } from "@/stores/unsaved-changes-store";

export function useUnsavedChanges(formId: string, isDirty: boolean, discard: () => void) {
  const register = useUnsavedChangesStore((state) => state.register);
  const unregister = useUnsavedChangesStore((state) => state.unregister);
  const requestClose = useUnsavedChangesStore((state) => state.requestClose);

  useEffect(() => {
    register(formId, { isDirty, discard });
    return () => unregister(formId);
  }, [formId, isDirty, discard, register, unregister]);

  return (onClose: () => void) => requestClose(formId, onClose);
}
