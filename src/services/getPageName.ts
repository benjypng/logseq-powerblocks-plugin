export default async function getPageName(uuid: string) {
  const blk = await logseq.Editor.getBlock(uuid);
  return (await logseq.Editor.getPage(blk!.page.id))!.originalName;
}
