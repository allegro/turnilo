export default function dragAndDropPolyfill() {
  // From ../../assets/polyfill/drag-drop-polyfill.js
  const div = document.createElement("div");
  const dragDiv = "draggable" in div;
  const evts = "ondragstart" in div && "ondrop" in div;

  const needsPatch = !(dragDiv || evts) || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);

  if (needsPatch) {
    Promise.all([
      // @ts-ignore
      import("../../lib/polyfill/drag-drop-polyfill.min.js"),
      // @ts-ignore
      import("../../lib/polyfill/drag-drop-polyfill.css")
    ]).then(([DragDropPolyfill, _]) => {
      DragDropPolyfill.Initialize({});
    });
  }
}
