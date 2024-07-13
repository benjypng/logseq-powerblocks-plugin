export const sidebarOpen = (content: string): string => {
  if (content.includes("<%SIDEBAROPEN:") && content.includes("%>")) {
    const regexp = /<%SIDEBAROPEN:(.*?)%>/;
    const matched = regexp.exec(content);
    if (!matched || !matched[1]) return content;

    if (matched && matched[1]) {
      logseq.Editor.openInRightSidebar(matched[1]);
    }
    return content;
  } else {
    return content;
  }
};
