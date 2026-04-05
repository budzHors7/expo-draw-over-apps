package expo.modules.drawoverapps

import android.content.Context
import android.view.GestureDetector
import android.view.Menu
import android.view.MotionEvent
import android.view.ViewConfiguration
import android.widget.FrameLayout
import android.widget.PopupMenu
import kotlin.math.abs

class DraggableOverlayLayout(
  context: Context,
  private val onDrag: (dx: Int, dy: Int) -> Unit,
  private val onRemoveRequested: () -> Unit
) : FrameLayout(context) {
  private val actionMenu = PopupMenu(context, this).apply {
    menu.add(Menu.NONE, MENU_REMOVE, Menu.NONE, "Remove bubble")
    setOnMenuItemClickListener { item ->
      if (item.itemId == MENU_REMOVE) {
        onRemoveRequested()
        true
      } else {
        false
      }
    }
    setOnDismissListener {
      isLongPressActive = false
    }
  }
  private val gestureDetector =
    GestureDetector(
      context,
      object : GestureDetector.SimpleOnGestureListener() {
        override fun onDown(event: MotionEvent): Boolean = true

        override fun onLongPress(event: MotionEvent) {
          if (isDragging) {
            return
          }

          isLongPressActive = true
          cancelChildTouch(event)
          actionMenu.show()
        }
      }
    )
  private val touchSlop = ViewConfiguration.get(context).scaledTouchSlop

  private var downRawX = 0f
  private var downRawY = 0f
  private var lastRawX = 0f
  private var lastRawY = 0f
  private var isDragging = false
  private var isLongPressActive = false

  override fun dispatchTouchEvent(event: MotionEvent): Boolean {
    gestureDetector.onTouchEvent(event)

    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        downRawX = event.rawX
        downRawY = event.rawY
        lastRawX = downRawX
        lastRawY = downRawY
        isDragging = false
        isLongPressActive = false
      }

      MotionEvent.ACTION_MOVE -> {
        val movedX = abs(event.rawX - downRawX)
        val movedY = abs(event.rawY - downRawY)

        if (!isDragging && !isLongPressActive && (movedX > touchSlop || movedY > touchSlop)) {
          isDragging = true
          cancelChildTouch(event)
          parent?.requestDisallowInterceptTouchEvent(true)
        }

        if (isDragging) {
          val dx = (event.rawX - lastRawX).toInt()
          val dy = (event.rawY - lastRawY).toInt()
          if (dx != 0 || dy != 0) {
            onDrag(dx, dy)
          }
          lastRawX = event.rawX
          lastRawY = event.rawY
          return true
        }
      }

      MotionEvent.ACTION_UP,
      MotionEvent.ACTION_CANCEL -> {
        val shouldConsume = isDragging || isLongPressActive
        isDragging = false
        if (event.actionMasked == MotionEvent.ACTION_CANCEL) {
          isLongPressActive = false
        }
        if (shouldConsume) {
          return true
        }
      }
    }

    if (isDragging || isLongPressActive) {
      return true
    }

    return super.dispatchTouchEvent(event)
  }

  private fun cancelChildTouch(event: MotionEvent) {
    val cancelEvent = MotionEvent.obtain(event)
    cancelEvent.action = MotionEvent.ACTION_CANCEL
    super.dispatchTouchEvent(cancelEvent)
    cancelEvent.recycle()
  }

  companion object {
    private const val MENU_REMOVE = 1
  }
}
