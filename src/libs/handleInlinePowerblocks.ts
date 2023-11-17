export const handleInlinePowerblocks = (content: string) => {
  // Handle inline power blocks
  if (content.includes("<%PB:") && content.includes("%>")) {
    // Get power block ID
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);
    if (!matched || !matched[1]) return content;

    // Parse matched[1]
    const pbToRender = matched![1].replace("PB:", "").trim();
    content = content.replaceAll(
      matched![0],
      `{{renderer :powerblocks_, ${pbToRender}}}`,
    );
  }

  return content;
};
