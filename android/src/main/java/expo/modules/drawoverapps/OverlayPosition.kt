package expo.modules.drawoverapps

internal data class OverlayPosition(
  val x: Int,
  val y: Int,
) {
  companion object {
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
