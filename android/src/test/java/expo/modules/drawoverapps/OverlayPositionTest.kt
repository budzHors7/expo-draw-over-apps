package expo.modules.drawoverapps

import org.junit.Assert.assertEquals
import org.junit.Test

class OverlayPositionTest {
  @Test
  fun `requested axes replace stored axes independently`() {
    assertEquals(
      OverlayPosition(x = 96, y = 180),
      OverlayPosition.resolve(
        storedX = 48,
        storedY = 180,
        requestedX = 96,
        requestedY = null,
        minX = 0,
        minY = 0,
        maxX = 800,
        maxY = 1400
      )
    )
    assertEquals(
      OverlayPosition(x = 48, y = 240),
      OverlayPosition.resolve(
        storedX = 48,
        storedY = 180,
        requestedX = null,
        requestedY = 240,
        minX = 0,
        minY = 0,
        maxX = 800,
        maxY = 1400
      )
    )
  }

  @Test
  fun `omitted axes preserve stored coordinates`() {
    assertEquals(
      OverlayPosition(x = 48, y = 180),
      OverlayPosition.resolve(
        storedX = 48,
        storedY = 180,
        requestedX = null,
        requestedY = null,
        minX = 0,
        minY = 0,
        maxX = 800,
        maxY = 1400
      )
    )
  }

  @Test
  fun `positions clamp to movement bounds`() {
    assertEquals(
      OverlayPosition(x = 0, y = 24),
      OverlayPosition.resolve(
        storedX = 48,
        storedY = 180,
        requestedX = -20,
        requestedY = -40,
        minX = 0,
        minY = 24,
        maxX = 800,
        maxY = 1400
      )
    )
    assertEquals(
      OverlayPosition(x = 800, y = 1400),
      OverlayPosition.resolve(
        storedX = 48,
        storedY = 180,
        requestedX = 1200,
        requestedY = 1900,
        minX = 0,
        minY = 24,
        maxX = 800,
        maxY = 1400
      )
    )
  }

  @Test
  fun `predefined locations resolve against fully visible bounds`() {
    assertEquals(
      OverlayPosition(x = 300, y = 24),
      OverlayPosition.forLocation("top", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
    assertEquals(
      OverlayPosition(x = 300, y = 1200),
      OverlayPosition.forLocation("bottom", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
    assertEquals(
      OverlayPosition(x = 0, y = 1200),
      OverlayPosition.forLocation("bottom-left", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
    assertEquals(
      OverlayPosition(x = 600, y = 24),
      OverlayPosition.forLocation("top-right", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
  }

  @Test
  fun `predefined corner locations cover every corner`() {
    assertEquals(
      OverlayPosition(x = 0, y = 24),
      OverlayPosition.forLocation("top-left", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
    assertEquals(
      OverlayPosition(x = 600, y = 1200),
      OverlayPosition.forLocation("bottom-right", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
    assertEquals(
      null,
      OverlayPosition.forLocation("somewhere", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
  }

  @Test
  fun `predefined locations cover the complete three by three grid`() {
    assertEquals(
      OverlayPosition(x = 300, y = 24),
      OverlayPosition.forLocation("top-center", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
    assertEquals(
      OverlayPosition(x = 0, y = 612),
      OverlayPosition.forLocation("center-left", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
    assertEquals(
      OverlayPosition(x = 300, y = 612),
      OverlayPosition.forLocation("center", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
    assertEquals(
      OverlayPosition(x = 600, y = 612),
      OverlayPosition.forLocation("center-right", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
    assertEquals(
      OverlayPosition(x = 300, y = 1200),
      OverlayPosition.forLocation("bottom-center", minX = 0, minY = 24, maxX = 600, maxY = 1200)
    )
  }

  @Test
  fun `content size ignores a transparent full surface wrapper`() {
    assertEquals(
      Pair(515, 558),
      OverlayPosition.selectContentSize(
        containerWidth = 515,
        containerHeight = 2274,
        descendantSizes = listOf(
          Pair(515, 2274),
          Pair(515, 558),
          Pair(460, 92),
          Pair(206, 76),
        )
      )
    )
  }

  @Test
  fun `content size falls back to the container`() {
    assertEquals(
      Pair(515, 2274),
      OverlayPosition.selectContentSize(
        containerWidth = 515,
        containerHeight = 2274,
        descendantSizes = listOf(Pair(515, 2274))
      )
    )
  }
}
