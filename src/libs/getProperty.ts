export const getProperty = async (content: string): Promise<string> => {
  if (content.includes("<%GETPROPERTY:") && content.includes("%>")) {
    const regexp = /<%GETPROPERTY:(.*?)%>/;
    const matched = regexp.exec(content);
    if (!matched || !matched[1]) return content;

    const [id, property] = matched[1].split(",");
    if (!id || !property) return content;

    if (id.startsWith("[[") && id.endsWith("]]")) {
      const page = await logseq.Editor.getPage(
        id.trim().replace("[[", "").replace("]]", ""),
      );
      if (!page) return content;

      return await logseq.Editor.getBlockProperty(page.uuid, property);
    } else {
      return await logseq.Editor.getBlockProperty(id.trim(), property);
    }
  }
  return content;
};
