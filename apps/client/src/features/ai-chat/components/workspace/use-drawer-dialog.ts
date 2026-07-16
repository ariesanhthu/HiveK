"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]:not([tabindex='-1'])",
  "button:not([disabled]):not([tabindex='-1'])",
  "input:not([disabled]):not([type='hidden']):not([tabindex='-1'])",
  "select:not([disabled]):not([tabindex='-1'])",
  "textarea:not([disabled]):not([tabindex='-1'])",
  "[contenteditable='true']:not([tabindex='-1'])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const DEFAULT_DISCARD_MESSAGE =
  "Bạn có thay đổi chưa lưu. Đóng và bỏ các thay đổi này?";

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element.getAttribute("aria-hidden") !== "true" &&
      element.getClientRects().length > 0
  );
}

function focusInitialElement(dialog: HTMLElement): void {
  const initialFocus = dialog.querySelector<HTMLElement>(
    "[data-drawer-initial-focus]"
  );
  const firstFocusable = getFocusableElements(dialog)[0];
  (initialFocus ?? firstFocusable ?? dialog).focus({ preventScroll: true });
}

type UseDrawerDialogOptions = {
  isOpen: boolean;
  hasUnsavedChanges: boolean;
  onClose: () => void;
  discardMessage?: string;
};

type UseDrawerDialogResult = {
  dialogRef: RefObject<HTMLElement | null>;
  requestClose: () => void;
};

export function useDrawerDialog({
  isOpen,
  hasUnsavedChanges,
  onClose,
  discardMessage = DEFAULT_DISCARD_MESSAGE,
}: UseDrawerDialogOptions): UseDrawerDialogResult {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  const dirtyRef = useRef(hasUnsavedChanges);
  const discardMessageRef = useRef(discardMessage);

  closeRef.current = onClose;
  dirtyRef.current = hasUnsavedChanges;
  discardMessageRef.current = discardMessage;

  const requestClose = useCallback(() => {
    if (
      dirtyRef.current &&
      !window.confirm(discardMessageRef.current)
    ) {
      const dialog = dialogRef.current;
      if (dialog && !dialog.contains(document.activeElement)) {
        window.requestAnimationFrame(() => focusInitialElement(dialog));
      }
      return;
    }

    closeRef.current();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const activeDialog: HTMLElement = dialog;

    const focusFrame = window.requestAnimationFrame(() =>
      focusInitialElement(activeDialog)
    );

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        requestClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(activeDialog);
      if (focusableElements.length === 0) {
        event.preventDefault();
        activeDialog.focus({ preventScroll: true });
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstFocusable || !activeDialog.contains(activeElement))
      ) {
        event.preventDefault();
        lastFocusable.focus({ preventScroll: true });
      } else if (
        !event.shiftKey &&
        (activeElement === lastFocusable || !activeDialog.contains(activeElement))
      ) {
        event.preventDefault();
        firstFocusable.focus({ preventScroll: true });
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [isOpen, requestClose]);

  return { dialogRef, requestClose };
}
