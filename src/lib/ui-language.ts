export type UiLanguage = "ru" | "kk";

// Legacy bagyt-language values were saved on every mount, so they do not
// establish a user's choice. Only an explicit selection writes this key.
export const UI_LANGUAGE_CHOICE_KEY = "bagyt-language-choice-v2";
export const DEFAULT_UI_LANGUAGE: UiLanguage = "ru";

export function readUiLanguage(storage?: Pick<Storage, "getItem">): UiLanguage {
  try {
    const source =
      storage ??
      (typeof window !== "undefined" ? window.localStorage : undefined);
    const choice = source?.getItem(UI_LANGUAGE_CHOICE_KEY);
    return choice === "ru" || choice === "kk" ? choice : DEFAULT_UI_LANGUAGE;
  } catch {
    return DEFAULT_UI_LANGUAGE;
  }
}

export function saveUiLanguageChoice(
  language: UiLanguage,
  storage?: Pick<Storage, "setItem">,
): boolean {
  if (language !== "ru" && language !== "kk") return false;
  try {
    const destination =
      storage ??
      (typeof window !== "undefined" ? window.localStorage : undefined);
    if (!destination) return false;
    destination.setItem(UI_LANGUAGE_CHOICE_KEY, language);
    return true;
  } catch {
    return false;
  }
}
