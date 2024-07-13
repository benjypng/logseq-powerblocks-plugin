export const handleRandomTag = async (content: string): Promise<string> => {
  if (content.includes("<%RANDOMTAG:") && content.includes("%>")) {
    const regexp = /<%(.*?)%>/;
    const matched = regexp.exec(content);
    if (!matched || !matched[1]) return content;

    const tags = matched[1]
      ?.replace("RANDOMTAG:", "")
      .split(",")
      .map((i) => `[[${i.trim()}]]`)
      .join(" ");
    const query = await logseq.DB.q(`(or ${tags} (sample 1))`);
    if (!query) return content;

    if (query.length === 0) {
      await logseq.UI.showMsg("No reference found", "error");
    }
    await logseq.Editor.upsertBlockProperty(query[0].uuid, "id", query[0].uuid);
    return content.replaceAll(matched![0], `((${query[0].uuid}))`);
  } else {
    return content;
  }
};
