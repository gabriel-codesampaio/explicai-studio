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
export { addAudience, removeAudience, renameAudience } from "./audience.js";
export { type CheckFinding, type CheckKind, checkManual } from "./check.js";
export { ExplicaiError } from "./errors.js";
export { COVER_MAX, type CoverPatch, coverLines } from "./export/cover.js";
export { FONTS, FONTS_DIR, type FontSpec, fontFiles } from "./export/fonts.js";
export { FOOTER_MAX, type FooterPatch } from "./export/footer.js";
export { imageSize } from "./export/imageSize.js";
export {
  EXPORT_DIR,
  EXPORT_FORMATS,
  type ExportFormat,
  type ExportResult,
  exportManual,
  findBrowser,
  logoSizeError,
  setManualCover,
  setManualFooter,
  setManualLogo,
  setManualTheme,
} from "./export/index.js";
export type { ThemePatch } from "./export/theme.js";
export { themeCss } from "./export/theme.js";
export { resolveInside, resolveInsideReal } from "./fs.js";
export { createManual, listManuals, readManual, renameManual } from "./manuals.js";
export { addPage, movePage, type PageTreeNode, readPage, readPageTree, updatePage } from "./pages.js";
export { insideGitRepo, redactAsset } from "./redact.js";
export { type BodyHit, foldText, searchBodies } from "./search.js";
export { slugify } from "./text.js";
export { listTrash, removePage, restorePage, TRASH_DIR, type TrashItem } from "./trash.js";
export { flatten } from "./tree.js";
export * from "./types.js";
export {
  deleteVersion,
  listVersions,
  publishVersion,
  readVersion,
  restoreVersion,
  saveVersion,
  VERSIONS_DIR,
  type Version,
  type VersionInfo,
} from "./versions.js";
