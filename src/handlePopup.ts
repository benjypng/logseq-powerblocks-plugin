export default function handleClosePopup() {
  //ESC
  document.addEventListener(
    "keydown",
    function (e) {
      if (e.key === "Escape") {
        logseq.hideMainUI({ restoreEditingCursor: true });
      } else {
        (
          document.querySelector("#powerblocks-menu")!
            .firstElementChild as HTMLElement
        ).focus();
      }

      e.stopPropagation();
    },
    false,
  );

  // Click
  document.addEventListener("click", (e) => {
    if (!(e.target as HTMLElement).closest("body")) {
      logseq.hideMainUI({ restoreEditingCursor: true });
    }
  });
}
