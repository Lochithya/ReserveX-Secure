export const getSizeSpans = (size) => {
  switch (size) {
    case "Large":
      return "col-span-4 row-span-4"; // spans 4 cells wide, 4 high
    case "Medium":
      return "col-span-2 row-span-2"; // spans 2 cells wide, 2 high
    case "Small":
      return "col-span-1 row-span-1"; // spans 1 cell
    default:
      return "col-span-1 row-span-1";
  }
};
