package expo.modules.drawoverapps

import android.content.Context
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.widget.FrameLayout
import kotlin.math.abs

class DraggableOverlayLayout(
  context: Context,
  private val onDrag: (dx: Int, dy: Int) -> Unit
) : FrameLayout(context) {
  private val touchSlop = ViewConfiguration.get(context).scaledTouchSlop

  private var downRawX = 0f
  private var downRawY = 0f
  private var lastRawX = 0f
  private var lastRawY = 0f
  private var isDragging = false

  override fun onInterceptTouchEvent(event: MotionEvent): Boolean {
    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        downRawX = event.rawX
        downRawY = event.rawY
        lastRawX = downRawX
        lastRawY = downRawY
        isDragging = false
      }

      MotionEvent.ACTION_MOVE -> {
        val movedX = abs(event.rawX - downRawX)
        val movedY = abs(event.rawY - downRawY)
        if (movedX > touchSlop || movedY > touchSlop) {
          parent?.requestDisallowInterceptTouchEvent(true)
          isDragging = true
          return true
        }
      }
    }
    return super.onInterceptTouchEvent(event)
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        downRawX = event.rawX
        downRawY = event.rawY
        lastRawX = downRawX
        lastRawY = downRawY
        isDragging = false
        return true
      }

      MotionEvent.ACTION_MOVE -> {
        val movedX = abs(event.rawX - downRawX)
        val movedY = abs(event.rawY - downRawY)

        if (!isDragging && (movedX > touchSlop || movedY > touchSlop)) {
          isDragging = true
        }

        if (isDragging) {
          val dx = (event.rawX - lastRawX).toInt()
          val dy = (event.rawY - lastRawY).toInt()
          if (dx != 0 || dy != 0) {
            onDrag(dx, dy)
          }
          lastRawX = event.rawX
          lastRawY = event.rawY
        }
        return true
      }

      MotionEvent.ACTION_UP,
      MotionEvent.ACTION_CANCEL -> {
        if (!isDragging) {
          val target = findClickableChildUnder(event.x, event.y)
          if (target != null) {
            target.performClick()
          } else {
            performClick()
          }
        }
        isDragging = false
        return true
      }
    }

    return super.onTouchEvent(event)
  }

  override fun performClick(): Boolean {
    super.performClick()
    return true
  }

  private fun findClickableChildUnder(x: Float, y: Float): View? {
    for (index in childCount - 1 downTo 0) {
      val child = getChildAt(index)
      if (!child.isShown) {
        continue
      }

      val withinChild =
        x >= child.left && x <= child.right && y >= child.top && y <= child.bottom
      if (withinChild && child.isClickable) {
        return child
      }
    }
    return null
  }
}
