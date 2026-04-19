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
import android.view.WindowInsets
import android.view.WindowManager
import android.widget.FrameLayout
import com.facebook.react.ReactApplication
import com.facebook.react.interfaces.fabric.ReactSurface
import java.lang.ref.WeakReference
import java.util.LinkedHashMap
import kotlin.math.max
import kotlin.math.roundToInt

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

  private data class MovementBounds(
    val left: Int,
    val top: Int,
    val right: Int,
    val bottom: Int,
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
          overlayInstances[bubbleId]?.let { currentOverlay ->
            windowLayoutParams.x += dx
            windowLayoutParams.y += dy
            constrainDraggedPosition(currentOverlay)
            storeBubblePosition(bubbleId, windowLayoutParams.x, windowLayoutParams.y)
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

    val movementBounds = getMovementBounds()
    val currentLeft = overlayInstance.layoutParams.x
    val currentTop = overlayInstance.layoutParams.y
    val maxPositionX = (movementBounds.right - bubbleWidth).coerceAtLeast(movementBounds.left)
    val maxPositionY = getMaxReachableY(movementBounds)
    val edgeHideEnabled = isEdgeHideEnabled(bubbleId)

    if (!edgeHideEnabled) {
      val clampedX = currentLeft.coerceIn(movementBounds.left, maxPositionX)
      val clampedY = currentTop.coerceIn(movementBounds.top, maxPositionY)
      if (clampedX != currentLeft || clampedY != currentTop) {
        overlayInstance.layoutParams.x = clampedX
        overlayInstance.layoutParams.y = clampedY
        storeBubblePosition(bubbleId, clampedX, clampedY)
      }
      applyDockState(overlayInstance, false, null)
      return
    }

    val currentRight = currentLeft + bubbleWidth
    val visibleSliver = dpToPx(DOCKED_VISIBLE_SLIVER_DP)
    val horizontalDockThreshold = calculateDockThreshold(bubbleWidth, visibleSliver)
    val hiddenWidth = (bubbleWidth - visibleSliver).coerceAtLeast(0)
    val leftOverflow = (movementBounds.left - currentLeft).coerceAtLeast(0)
    val rightOverflow = (currentRight - movementBounds.right).coerceAtLeast(0)

    val dockCandidates = mutableListOf<Pair<DockEdge, Int>>()
    if (leftOverflow >= horizontalDockThreshold) {
      dockCandidates.add(DockEdge.LEFT to leftOverflow)
    }
    if (rightOverflow >= horizontalDockThreshold) {
      dockCandidates.add(DockEdge.RIGHT to rightOverflow)
    }

    if (dockCandidates.isEmpty()) {
      val clampedX = currentLeft.coerceIn(movementBounds.left, maxPositionX)
      val clampedY = currentTop.coerceIn(movementBounds.top, maxPositionY)
      if (clampedX != currentLeft || clampedY != currentTop) {
        overlayInstance.layoutParams.x = clampedX
        overlayInstance.layoutParams.y = clampedY
        storeBubblePosition(bubbleId, clampedX, clampedY)
      }
      applyDockState(overlayInstance, false, null)
      return
    }

    val dockEdge = dockCandidates.maxByOrNull { it.second }?.first ?: return

    when (dockEdge) {
      DockEdge.LEFT -> {
        overlayInstance.layoutParams.x = movementBounds.left - hiddenWidth
        overlayInstance.layoutParams.y = currentTop.coerceIn(movementBounds.top, maxPositionY)
      }
      DockEdge.RIGHT -> {
        overlayInstance.layoutParams.x = movementBounds.right - visibleSliver
        overlayInstance.layoutParams.y = currentTop.coerceIn(movementBounds.top, maxPositionY)
      }
      DockEdge.TOP,
      DockEdge.BOTTOM -> return
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

    val movementBounds = getMovementBounds()
    val maxPositionX = (movementBounds.right - bubbleWidth).coerceAtLeast(movementBounds.left)
    val maxPositionY = getMaxReachableY(movementBounds)
    when (overlayInstance.dockEdge) {
      DockEdge.LEFT -> {
        overlayInstance.layoutParams.x = movementBounds.left
        overlayInstance.layoutParams.y =
          overlayInstance.layoutParams.y.coerceIn(movementBounds.top, maxPositionY)
      }
      DockEdge.RIGHT -> {
        overlayInstance.layoutParams.x = maxPositionX
        overlayInstance.layoutParams.y =
          overlayInstance.layoutParams.y.coerceIn(movementBounds.top, maxPositionY)
      }
      DockEdge.TOP,
      DockEdge.BOTTOM -> return
      null -> {
        overlayInstance.layoutParams.x =
          overlayInstance.layoutParams.x.coerceIn(movementBounds.left, maxPositionX)
        overlayInstance.layoutParams.y =
          overlayInstance.layoutParams.y.coerceIn(movementBounds.top, maxPositionY)
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

  private fun getMovementBounds(): MovementBounds {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      val windowMetrics = windowManager.currentWindowMetrics
      val systemBarInsets =
        windowMetrics.windowInsets.getInsetsIgnoringVisibility(
          WindowInsets.Type.systemBars() or
            WindowInsets.Type.displayCutout() or
            WindowInsets.Type.mandatorySystemGestures()
        )
      val sideMargin = dpToPx(SCREEN_EDGE_MARGIN_DP)
      val top = systemBarInsets.top + sideMargin
      val bottomInset = max(systemBarInsets.bottom, dpToPx(BOTTOM_SAFE_GAP_DP))
      MovementBounds(
        left = systemBarInsets.left + sideMargin,
        top = top,
        right = (windowMetrics.bounds.right - systemBarInsets.right - sideMargin).coerceAtLeast(sideMargin),
        bottom = (windowMetrics.bounds.bottom - bottomInset - sideMargin).coerceAtLeast(top),
      )
    } else {
      @Suppress("DEPRECATION")
      MovementBounds(
        left = dpToPx(SCREEN_EDGE_MARGIN_DP),
        top = dpToPx(SCREEN_EDGE_MARGIN_DP),
        right = resources.displayMetrics.widthPixels - dpToPx(SCREEN_EDGE_MARGIN_DP),
        bottom = resources.displayMetrics.heightPixels - dpToPx(BOTTOM_SAFE_GAP_DP),
      )
    }
  }

  private fun constrainDraggedPosition(overlayInstance: OverlayInstance) {
    val (bubbleWidth, bubbleHeight) = getOverlaySize(overlayInstance.container)
    if (bubbleWidth <= 0 || bubbleHeight <= 0) {
      return
    }

    val movementBounds = getMovementBounds()
    val edgeHideEnabled = isEdgeHideEnabled(overlayInstance.bubbleId)
    val visibleSliver = dpToPx(DOCKED_VISIBLE_SLIVER_DP)
    val hiddenWidth = (bubbleWidth - visibleSliver).coerceAtLeast(0)
    val minX = if (edgeHideEnabled) movementBounds.left - hiddenWidth else movementBounds.left
    val maxX =
      if (edgeHideEnabled) {
        movementBounds.right - visibleSliver
      } else {
        (movementBounds.right - bubbleWidth).coerceAtLeast(movementBounds.left)
      }
    val minY = movementBounds.top
    val maxY = getMaxReachableY(movementBounds)

    overlayInstance.layoutParams.x = overlayInstance.layoutParams.x.coerceIn(minX, maxX)
    overlayInstance.layoutParams.y = overlayInstance.layoutParams.y.coerceIn(minY, maxY)
  }

  private fun getMaxReachableY(movementBounds: MovementBounds): Int {
    return (movementBounds.bottom - dpToPx(MIN_VISIBLE_VERTICAL_SLIVER_DP)).coerceAtLeast(movementBounds.top)
  }

  private fun invalidateViewTree(view: View) {
    view.requestLayout()
    view.invalidate()
    view.postInvalidateOnAnimation()

    if (view is ViewGroup) {
      for (index in 0 until view.childCount) {
        invalidateViewTree(view.getChildAt(index))
      }
    }
  }

  private fun refreshOverlayTree(overlayInstance: OverlayInstance) {
    overlayInstance.container.post {
      overlayInstance.container.alpha = if (overlayInstance.isDocked) DOCKED_OPACITY else RESTORED_OPACITY
      runCatching {
        windowManager.updateViewLayout(overlayInstance.container, overlayInstance.layoutParams)
      }
      invalidateViewTree(overlayInstance.container)
    }
  }

  private fun dpToPx(value: Int): Int {
    return (value * resources.displayMetrics.density).toInt()
  }

  private fun calculateDockThreshold(bubbleSize: Int, visibleSliver: Int): Int {
    val hiddenPortion = (bubbleSize - visibleSliver).coerceAtLeast(0)
    if (hiddenPortion == 0) {
      return 0
    }

    return max(
      dpToPx(MIN_DOCK_THRESHOLD_DP),
      (hiddenPortion * DOCK_THRESHOLD_RATIO).roundToInt()
    ).coerceAtMost(hiddenPortion)
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
    private const val MIN_VISIBLE_VERTICAL_SLIVER_DP = 40
    private const val SCREEN_EDGE_MARGIN_DP = 8
    private const val BOTTOM_SAFE_GAP_DP = 32
    private const val MIN_DOCK_THRESHOLD_DP = 20
    private const val DOCK_THRESHOLD_RATIO = 0.35f
    private const val DOCKED_OPACITY = 0.5f
    private const val RESTORED_OPACITY = 1f

    private var serviceReference = WeakReference<ExpoDrawOverAppsOverlayService?>(null)
    private val bubblePositions = LinkedHashMap<String, Pair<Int, Int>>()
    private val edgeHideEnabledStates = LinkedHashMap<String, Boolean>()

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
        service.refreshOverlayTree(overlayInstance)
      }
    }

    internal fun setEdgeHideEnabled(bubbleId: String, enabled: Boolean) {
      val normalizedBubbleId = normalizeBubbleId(bubbleId)
      edgeHideEnabledStates[normalizedBubbleId] = enabled
      val service = serviceReference.get() ?: return
      val overlayInstance = service.overlayInstances[normalizedBubbleId] ?: return

      if (!enabled && overlayInstance.isDocked) {
        service.restoreDockedBubble(normalizedBubbleId)
      } else {
        service.constrainDraggedPosition(overlayInstance)
        storeBubblePosition(normalizedBubbleId, overlayInstance.layoutParams.x, overlayInstance.layoutParams.y)
        service.applyDockState(overlayInstance, false, null)
      }
    }

    internal fun isEdgeHideEnabled(bubbleId: String): Boolean {
      return edgeHideEnabledStates[normalizeBubbleId(bubbleId)] ?: true
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
