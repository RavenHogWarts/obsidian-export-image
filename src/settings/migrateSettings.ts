export function migrateLegacySettings(
  settings: ISettings,
  loaded?: Partial<ISettings> | null,
): ISettings {
  const authorInfo = settings.authorInfo;
  if (!authorInfo) {
    return settings;
  }

  const loadedAuthorInfo = loaded?.authorInfo;
  const hasTopBottomConfigInLoaded =
    !!loadedAuthorInfo &&
    (typeof loadedAuthorInfo.showTop === "boolean" ||
      typeof loadedAuthorInfo.showBottom === "boolean" ||
      typeof loadedAuthorInfo.topName === "string" ||
      typeof loadedAuthorInfo.topRemark === "string" ||
      typeof loadedAuthorInfo.topAvatar === "string" ||
      typeof loadedAuthorInfo.bottomName === "string" ||
      typeof loadedAuthorInfo.bottomRemark === "string" ||
      typeof loadedAuthorInfo.bottomAvatar === "string");

  const isLegacyTop = authorInfo.position === "top";

  if (!hasTopBottomConfigInLoaded) {
    authorInfo.showTop = isLegacyTop;
    authorInfo.showBottom = !isLegacyTop;
  }

  authorInfo.showTop ??= false;
  authorInfo.showBottom ??= true;

  // Migrate legacy single-block content to the corresponding side.
  if (isLegacyTop) {
    authorInfo.topName ??= authorInfo.name;
    authorInfo.topRemark ??= authorInfo.remark;
    authorInfo.topAvatar ??= authorInfo.avatar;
  } else {
    authorInfo.bottomName ??= authorInfo.name;
    authorInfo.bottomRemark ??= authorInfo.remark;
    authorInfo.bottomAvatar ??= authorInfo.avatar;
  }

  return settings;
}
