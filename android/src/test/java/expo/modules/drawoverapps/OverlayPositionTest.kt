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
}
