export { emptyAnnotations, parseAnnotations } from "./annotations.js";
export {
  type AnnotationsPatch,
  appendAnnotations,
  cleanUnusedAssets,
  findUnusedAssets,
  readAnnotations,
  saveAsset,
  writeAnnotations,
} from "./assets.js";
export { ExplicaiError } from "./errors.js";
export { FONTS, FONTS_DIR, type FontSpec, fontFiles } from "./export/fonts.js";
export { imageSize } from "./export/imageSize.js";
export {
  EXPORT_DIR,
  EXPORT_FORMATS,
  type ExportFormat,
  type ExportResult,
  exportManual,
  findBrowser,
  logoSizeError,
  setManualLogo,
  setManualTheme,
} from "./export/index.js";
export type { ThemePatch } from "./export/theme.js";
export { resolveInside, resolveInsideReal } from "./fs.js";
export { createManual, listManuals, readManual } from "./manuals.js";
export { addPage, movePage, type PageTreeNode, readPage, readPageTree, updatePage } from "./pages.js";
export { insideGitRepo, redactAsset } from "./redact.js";
export { slugify } from "./text.js";
export { listTrash, removePage, restorePage, TRASH_DIR, type TrashItem } from "./trash.js";
export { flatten } from "./tree.js";
export * from "./types.js";
export {
  listVersions,
  publishVersion,
  readVersion,
  restoreVersion,
  saveVersion,
  VERSIONS_DIR,
  type Version,
  type VersionInfo,
} from "./versions.js";
