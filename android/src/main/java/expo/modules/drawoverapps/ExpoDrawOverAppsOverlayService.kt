package expo.modules.drawoverapps

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.graphics.Rect
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.view.View.MeasureSpec
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import com.facebook.react.ReactApplication
import com.facebook.react.interfaces.fabric.ReactSurface
import java.lang.ref.WeakReference
import java.util.LinkedHashMap

class ExpoDrawOverAppsOverlayService : Service() {
  private lateinit var windowManager: WindowManager
  private val overlayInstances = LinkedHashMap<String, OverlayInstance>()

  private enum class DockEdge {
    LEFT,
    RIGHT,
    TOP,
    BOTTOM,
  }

  private data class OverlayInstance(
    val bubbleId: String,
    val container: DraggableOverlayLayout,
    val layoutParams: WindowManager.LayoutParams,
    val reactSurface: ReactSurface,
    var isDocked: Boolean = false,
    var dockEdge: DockEdge? = null,
  )

  override fun onCreate() {
    super.onCreate()
    windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    serviceReference = WeakReference(this)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val bubbleId = normalizeBubbleId(intent?.getStringExtra(EXTRA_BUBBLE_ID))

    when (intent?.action) {
      ACTION_HIDE_ALL_BUBBLES -> {
        hideAllBubbles(SOURCE_APP)
        stopSelfIfIdle()
      }
      ACTION_HIDE_BUBBLE -> {
        hideBubble(bubbleId, SOURCE_APP)
        stopSelfIfIdle()
      }
      else -> showBubble(bubbleId)
    }
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    hideAllBubbles(SOURCE_APP)
    if (serviceReference.get() === this) {
      serviceReference.clear()
    }
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun showBubble(bubbleId: String) {
    if (overlayInstances.containsKey(bubbleId)) {
      ExpoDrawOverAppsModule.setBubbleVisibilityInternal(true, bubbleId, SOURCE_APP)
      requestOverlayRedraw(bubbleId)
      return
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
      ExpoDrawOverAppsModule.setBubbleVisibilityInternal(false, bubbleId, SOURCE_APP)
      stopSelfIfIdle()
      return
    }

    val reactHost = (application as? ReactApplication)?.reactHost ?: run {
      ExpoDrawOverAppsModule.setBubbleVisibilityInternal(false, bubbleId, SOURCE_APP)
      stopSelfIfIdle()
      return
    }

    val initialProps = Bundle().apply {
      putString("bubbleId", bubbleId)
    }
    val surface = reactHost.createSurface(this, BUBBLE_COMPONENT_NAME, initialProps)
    val surfaceView = surface.view ?: run {
      ExpoDrawOverAppsModule.setBubbleVisibilityInternal(false, bubbleId, SOURCE_APP)
      stopSelfIfIdle()
      return
    }

    val windowLayoutParams = createLayoutParams(bubbleId)
    val container =
      DraggableOverlayLayout(
        this,
        onDrag = { dx, dy ->
          windowLayoutParams.x += dx
          windowLayoutParams.y += dy
          storeBubblePosition(bubbleId, windowLayoutParams.x, windowLayoutParams.y)
          overlayInstances[bubbleId]?.let { currentOverlay ->
            runCatching {
              windowManager.updateViewLayout(currentOverlay.container, windowLayoutParams)
            }
          }
        },
        onRemoveRequested = {
          hideBubble(bubbleId, SOURCE_BUBBLE)
          stopSelfIfIdle()
        },
        onDragFinished = {
          dockBubbleIfNeeded(bubbleId)
        },
        onDockedTap = {
          restoreDockedBubble(bubbleId)
        }
      ).apply {
        layoutParams = FrameLayout.LayoutParams(
          ViewGroup.LayoutParams.WRAP_CONTENT,
          ViewGroup.LayoutParams.WRAP_CONTENT
        )
        addView(
          surfaceView,
          FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
          )
        )
      }

    windowManager.addView(container, windowLayoutParams)
    surface.start()

    overlayInstances[bubbleId] =
      OverlayInstance(
        bubbleId = bubbleId,
        container = container,
        layoutParams = windowLayoutParams,
        reactSurface = surface,
      )
    ExpoDrawOverAppsModule.setBubbleVisibilityInternal(true, bubbleId, SOURCE_APP)
    container.post {
      dockBubbleIfNeeded(bubbleId)
      requestOverlayRedraw(bubbleId)
    }
  }

  private fun hideBubble(bubbleId: String, source: String) {
    val overlayInstance = overlayInstances.remove(bubbleId) ?: run {
      ExpoDrawOverAppsModule.setBubbleVisibilityInternal(false, bubbleId, source)
      return
    }

    overlayInstance.reactSurface.stop()
    overlayInstance.reactSurface.clear()
    overlayInstance.reactSurface.detach()

    runCatching {
      windowManager.removeViewImmediate(overlayInstance.container)
    }

    ExpoDrawOverAppsModule.setBubbleVisibilityInternal(false, bubbleId, source)
  }

  private fun hideAllBubbles(source: String) {
    val bubbleIds = overlayInstances.keys.toList()
    for (bubbleId in bubbleIds) {
      hideBubble(bubbleId, source)
    }
  }

  private fun stopSelfIfIdle() {
    if (overlayInstances.isEmpty()) {
      stopSelf()
    }
  }

  private fun dockBubbleIfNeeded(bubbleId: String) {
    val overlayInstance = overlayInstances[bubbleId] ?: return
    val (bubbleWidth, bubbleHeight) = getOverlaySize(overlayInstance.container)
    if (bubbleWidth <= 0 || bubbleHeight <= 0) {
      return
    }

    val screenBounds = getScreenBounds()
    val currentLeft = overlayInstance.layoutParams.x
    val currentTop = overlayInstance.layoutParams.y
    val currentRight = currentLeft + bubbleWidth
    val currentBottom = currentTop + bubbleHeight

    val isOutsideHorizontal = currentLeft < 0 || currentRight > screenBounds.right
    val isOutsideVertical = currentTop < 0 || currentBottom > screenBounds.bottom

    if (!isOutsideHorizontal && !isOutsideVertical) {
      applyDockState(overlayInstance, false, null)
      return
    }

    val visibleSliver = dpToPx(DOCKED_VISIBLE_SLIVER_DP)
    val dockEdge =
      when {
        currentLeft < 0 -> DockEdge.LEFT
        currentRight > screenBounds.right -> DockEdge.RIGHT
        currentTop < 0 -> DockEdge.TOP
        else -> DockEdge.BOTTOM
      }

    when (dockEdge) {
      DockEdge.LEFT -> {
        overlayInstance.layoutParams.x = -(bubbleWidth - visibleSliver)
        overlayInstance.layoutParams.y = currentTop.coerceIn(0, screenBounds.bottom - bubbleHeight)
      }
      DockEdge.RIGHT -> {
        overlayInstance.layoutParams.x = screenBounds.right - visibleSliver
        overlayInstance.layoutParams.y = currentTop.coerceIn(0, screenBounds.bottom - bubbleHeight)
      }
      DockEdge.TOP -> {
        overlayInstance.layoutParams.x = currentLeft.coerceIn(0, screenBounds.right - bubbleWidth)
        overlayInstance.layoutParams.y = -(bubbleHeight - visibleSliver)
      }
      DockEdge.BOTTOM -> {
        overlayInstance.layoutParams.x = currentLeft.coerceIn(0, screenBounds.right - bubbleWidth)
        overlayInstance.layoutParams.y = screenBounds.bottom - visibleSliver
      }
    }

    storeBubblePosition(bubbleId, overlayInstance.layoutParams.x, overlayInstance.layoutParams.y)
    applyDockState(overlayInstance, true, dockEdge)
  }

  private fun restoreDockedBubble(bubbleId: String) {
    val overlayInstance = overlayInstances[bubbleId] ?: return
    if (!overlayInstance.isDocked) {
      return
    }

    val (bubbleWidth, bubbleHeight) = getOverlaySize(overlayInstance.container)
    if (bubbleWidth <= 0 || bubbleHeight <= 0) {
      applyDockState(overlayInstance, false, null)
      return
    }

    val screenBounds = getScreenBounds()
    when (overlayInstance.dockEdge) {
      DockEdge.LEFT -> {
        overlayInstance.layoutParams.x = 0
        overlayInstance.layoutParams.y =
          overlayInstance.layoutParams.y.coerceIn(0, screenBounds.bottom - bubbleHeight)
      }
      DockEdge.RIGHT -> {
        overlayInstance.layoutParams.x = (screenBounds.right - bubbleWidth).coerceAtLeast(0)
        overlayInstance.layoutParams.y =
          overlayInstance.layoutParams.y.coerceIn(0, screenBounds.bottom - bubbleHeight)
      }
      DockEdge.TOP -> {
        overlayInstance.layoutParams.x =
          overlayInstance.layoutParams.x.coerceIn(0, screenBounds.right - bubbleWidth)
        overlayInstance.layoutParams.y = 0
      }
      DockEdge.BOTTOM -> {
        overlayInstance.layoutParams.x =
          overlayInstance.layoutParams.x.coerceIn(0, screenBounds.right - bubbleWidth)
        overlayInstance.layoutParams.y = (screenBounds.bottom - bubbleHeight).coerceAtLeast(0)
      }
      null -> {
        overlayInstance.layoutParams.x =
          overlayInstance.layoutParams.x.coerceIn(0, screenBounds.right - bubbleWidth)
        overlayInstance.layoutParams.y =
          overlayInstance.layoutParams.y.coerceIn(0, screenBounds.bottom - bubbleHeight)
      }
    }

    storeBubblePosition(bubbleId, overlayInstance.layoutParams.x, overlayInstance.layoutParams.y)
    applyDockState(overlayInstance, false, null)
  }

  private fun applyDockState(
    overlayInstance: OverlayInstance,
    isDocked: Boolean,
    dockEdge: DockEdge?
  ) {
    overlayInstance.isDocked = isDocked
    overlayInstance.dockEdge = dockEdge
    overlayInstance.container.setDocked(isDocked)
    overlayInstance.container.alpha = if (isDocked) DOCKED_OPACITY else RESTORED_OPACITY

    runCatching {
      windowManager.updateViewLayout(overlayInstance.container, overlayInstance.layoutParams)
    }
    requestOverlayRedraw(overlayInstance.bubbleId)
  }

  private fun getOverlaySize(container: View): Pair<Int, Int> {
    var width = container.width
    var height = container.height

    if (width <= 0 || height <= 0) {
      container.measure(
        MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED),
        MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED)
      )
      width = container.measuredWidth
      height = container.measuredHeight
    }

    return Pair(width, height)
  }

  private fun getScreenBounds(): Rect {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      windowManager.currentWindowMetrics.bounds
    } else {
      @Suppress("DEPRECATION")
      Rect(
        0,
        0,
        resources.displayMetrics.widthPixels,
        resources.displayMetrics.heightPixels
      )
    }
  }

  private fun dpToPx(value: Int): Int {
    return (value * resources.displayMetrics.density).toInt()
  }

  private fun createLayoutParams(bubbleId: String): WindowManager.LayoutParams {
    val overlayType =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
      } else {
        @Suppress("DEPRECATION")
        WindowManager.LayoutParams.TYPE_PHONE
      }

    val (positionX, positionY) = getOrCreateBubblePosition(bubbleId)

    return WindowManager.LayoutParams(
      WindowManager.LayoutParams.WRAP_CONTENT,
      WindowManager.LayoutParams.WRAP_CONTENT,
      overlayType,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
      PixelFormat.TRANSLUCENT
    ).apply {
      gravity = Gravity.TOP or Gravity.START
      x = positionX
      y = positionY
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        layoutInDisplayCutoutMode =
          WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
      }
    }
  }

  companion object {
    const val ACTION_SHOW_BUBBLE = "expo.modules.drawoverapps.action.SHOW_BUBBLE"
    const val ACTION_HIDE_BUBBLE = "expo.modules.drawoverapps.action.HIDE_BUBBLE"
    const val ACTION_HIDE_ALL_BUBBLES = "expo.modules.drawoverapps.action.HIDE_ALL_BUBBLES"
    const val EXTRA_BUBBLE_ID = "expo.modules.drawoverapps.extra.BUBBLE_ID"
    const val BUBBLE_COMPONENT_NAME = "ExpoDrawOverAppsBubble"
    private const val DEFAULT_BUBBLE_ID = "default"
    private const val SOURCE_APP = "app"
    private const val SOURCE_BUBBLE = "bubble"
    private const val BASE_POSITION_X = 48
    private const val BASE_POSITION_Y = 180
    private const val POSITION_X_OFFSET = 36
    private const val POSITION_Y_OFFSET = 140
    private const val DOCKED_VISIBLE_SLIVER_DP = 28
    private const val DOCKED_OPACITY = 0.5f
    private const val RESTORED_OPACITY = 1f

    private var serviceReference = WeakReference<ExpoDrawOverAppsOverlayService?>(null)
    private val bubblePositions = LinkedHashMap<String, Pair<Int, Int>>()

    internal fun requestOverlayRedraw(bubbleId: String? = null) {
      val service = serviceReference.get() ?: return
      val bubbleIds =
        if (bubbleId.isNullOrBlank()) {
          service.overlayInstances.keys.toList()
        } else {
          listOf(normalizeBubbleId(bubbleId))
        }

      for (targetBubbleId in bubbleIds) {
        val overlayInstance = service.overlayInstances[targetBubbleId] ?: continue

        overlayInstance.container.post {
          overlayInstance.container.alpha = if (overlayInstance.isDocked) DOCKED_OPACITY else RESTORED_OPACITY
          runCatching {
            service.windowManager.updateViewLayout(overlayInstance.container, overlayInstance.layoutParams)
          }
          overlayInstance.container.requestLayout()
          overlayInstance.container.invalidate()
          overlayInstance.container.postInvalidateOnAnimation()
          overlayInstance.container.getChildAt(0)?.let { contentView ->
            contentView.requestLayout()
            contentView.invalidate()
            contentView.postInvalidateOnAnimation()
          }
        }
      }
    }

    private fun normalizeBubbleId(bubbleId: String?): String {
      return bubbleId?.takeIf { it.isNotBlank() } ?: DEFAULT_BUBBLE_ID
    }

    private fun getOrCreateBubblePosition(bubbleId: String): Pair<Int, Int> {
      val normalizedBubbleId = normalizeBubbleId(bubbleId)
      return bubblePositions.getOrPut(normalizedBubbleId) {
        val index = bubblePositions.size
        Pair(
          BASE_POSITION_X + (index * POSITION_X_OFFSET),
          BASE_POSITION_Y + (index * POSITION_Y_OFFSET)
        )
      }
    }

    private fun storeBubblePosition(bubbleId: String, positionX: Int, positionY: Int) {
      bubblePositions[normalizeBubbleId(bubbleId)] = Pair(positionX, positionY)
    }
  }
}
