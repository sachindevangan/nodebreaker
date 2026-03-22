/** Single open context menu registers dismiss so global Escape can close it first */
export const contextMenuController = {
  dismiss: null as (() => void) | null,
};
