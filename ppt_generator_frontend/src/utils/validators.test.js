import { normalizeBullets, validateTemplateContent } from "./validators";

test("normalizeBullets trims and removes empty items", () => {
  expect(normalizeBullets([" a ", "", "  ", "b"])).toEqual(["a", "b"]);
});

test("validateTemplateContent returns missing required fields", () => {
  const template = {
    slides: [{ id: "s1", fields: [{ key: "title", label: "Title", type: "text", required: true }] }],
  };
  const content = { s1: { title: "" } };
  const errors = validateTemplateContent(template, content);
  expect(errors.length).toBe(1);
});
