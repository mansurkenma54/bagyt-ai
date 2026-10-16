import test from "node:test";
import assert from "node:assert/strict";
import {
  readUiLanguage,
  saveUiLanguageChoice,
  UI_LANGUAGE_CHOICE_KEY,
} from "../src/lib/ui-language";

function memoryStorage(entries: Record<string, string> = {}) {
  const values = new Map(Object.entries(entries));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

test("a new visit starts in Russian and legacy automatic Kazakh is ignored", () => {
  assert.equal(readUiLanguage(memoryStorage()), "ru");
  const storage = memoryStorage({ "bagyt-language": "kk" });
  assert.equal(readUiLanguage(storage), "ru");
  assert.equal(storage.getItem(UI_LANGUAGE_CHOICE_KEY), null);
  assert.equal(readUiLanguage(storage), "ru");
});

test("explicit language choices persist across visits and override legacy values", () => {
  const storage = memoryStorage({ "bagyt-language": "ru" });
  assert.equal(saveUiLanguageChoice("kk", storage), true);
  assert.equal(readUiLanguage(storage), "kk");
  assert.equal(readUiLanguage(storage), "kk");
  assert.equal(saveUiLanguageChoice("ru", storage), true);
  assert.equal(readUiLanguage(storage), "ru");
});

test("unsupported saved choices and inaccessible storage safely use Russian", () => {
  for (const invalid of ["", "en", "null", '{"language":"kk"}']) {
    assert.equal(
      readUiLanguage(memoryStorage({ [UI_LANGUAGE_CHOICE_KEY]: invalid })),
      "ru",
    );
  }
  const blocked = {
    getItem: () => {
      throw new Error("Storage blocked");
    },
    setItem: () => {
      throw new Error("Storage blocked");
    },
  };
  assert.equal(readUiLanguage(blocked), "ru");
  assert.equal(saveUiLanguageChoice("kk", blocked), false);
  assert.equal(readUiLanguage(), "ru");
});
