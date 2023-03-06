export default async function getPageName() {
  const blk = await logseq.Editor.getCurrentBlock();
  return (await logseq.Editor.getPage(blk.page.id)).originalName;
}
