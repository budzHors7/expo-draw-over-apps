package expo.modules.drawoverapps

internal data class OverlayPosition(
  val x: Int,
  val y: Int,
) {
  companion object {
    fun selectContentSize(
      containerWidth: Int,
      containerHeight: Int,
      descendantSizes: List<Pair<Int, Int>>,
    ): Pair<Int, Int> {
      return descendantSizes
        .asSequence()
        .filter { (width, height) ->
          width > 0 &&
            height > 0 &&
            width <= containerWidth &&
            height <= containerHeight &&
            (width < containerWidth || height < containerHeight)
        }
        .maxByOrNull { (width, height) -> width.toLong() * height.toLong() }
        ?: Pair(containerWidth, containerHeight)
    }

    fun forLocation(
      location: String?,
      minX: Int,
      minY: Int,
      maxX: Int,
      maxY: Int,
    ): OverlayPosition? {
      val centerX = minX + ((maxX.coerceAtLeast(minX) - minX) / 2)
      val safeMaxX = maxX.coerceAtLeast(minX)
      val safeMaxY = maxY.coerceAtLeast(minY)
      val centerY = minY + ((safeMaxY - minY) / 2)
      return when (location) {
        "top", "top-center" -> OverlayPosition(centerX, minY)
        "bottom", "bottom-center" -> OverlayPosition(centerX, safeMaxY)
        "top-left" -> OverlayPosition(minX, minY)
        "top-right" -> OverlayPosition(safeMaxX, minY)
        "center-left" -> OverlayPosition(minX, centerY)
        "center" -> OverlayPosition(centerX, centerY)
        "center-right" -> OverlayPosition(safeMaxX, centerY)
        "bottom-left" -> OverlayPosition(minX, safeMaxY)
        "bottom-right" -> OverlayPosition(safeMaxX, safeMaxY)
        else -> null
      }
    }

    fun resolve(
      storedX: Int,
      storedY: Int,
      requestedX: Int?,
      requestedY: Int?,
      minX: Int,
      minY: Int,
      maxX: Int,
      maxY: Int,
    ): OverlayPosition {
      return OverlayPosition(
        x = (requestedX ?: storedX).coerceIn(minX, maxX.coerceAtLeast(minX)),
        y = (requestedY ?: storedY).coerceIn(minY, maxY.coerceAtLeast(minY)),
      )
    }
  }
}
