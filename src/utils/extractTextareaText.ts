export const extractTextareaText = (html: string, selector: string): string => {
  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const target = doc.querySelector(selector);

    if (!target) {
      return "";
    }

    if (target instanceof HTMLTextAreaElement) {
      return target.value;
    }

    return target.textContent ?? "";
  }

  const match = html.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/i);
  return match?.[1] ?? "";
};
