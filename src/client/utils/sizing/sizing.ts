export interface Positioning {
  startIndex: number;
  shownColumns: number;
}

export function getVisibleSegments(segmentWidths: number[], offset: number, visibleSize: number): Positioning {
  var startIndex = 0;
  var shownColumns = 0;

  var curWidth = 0;
  for (var i = 0; i < segmentWidths.length; i++) {
    let segmentWidth = segmentWidths[i];
    let afterWidth = curWidth + segmentWidth;
    if (afterWidth < offset) {
      startIndex++;
    } else if (curWidth < offset + visibleSize) {
      shownColumns++;
    }
    curWidth = afterWidth;
  }

  return {
    startIndex,
    shownColumns
  };
}
