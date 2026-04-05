package expo.modules.drawoverapps

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import com.facebook.react.ReactApplication
import com.facebook.react.interfaces.fabric.ReactSurface
import java.lang.ref.WeakReference

class ExpoDrawOverAppsOverlayService : Service() {
  private lateinit var windowManager: WindowManager
  private var overlayView: DraggableOverlayLayout? = null
  private var overlayLayoutParams: WindowManager.LayoutParams? = null
  private var reactSurface: ReactSurface? = null

  override fun onCreate() {
    super.onCreate()
    windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    serviceReference = WeakReference(this)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_HIDE_BUBBLE -> {
        hideBubble(SOURCE_APP)
        stopSelf()
      }
      else -> showBubble()
    }
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    hideBubble(SOURCE_APP)
    if (serviceReference.get() === this) {
      serviceReference.clear()
    }
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun showBubble() {
    if (overlayView != null) {
      isBubbleVisible = true
      ExpoDrawOverAppsModule.setBubbleVisibilityInternal(true, SOURCE_APP)
      requestOverlayRedraw()
      return
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
      isBubbleVisible = false
      ExpoDrawOverAppsModule.setBubbleVisibilityInternal(false, SOURCE_APP)
      stopSelf()
      return
    }

    val reactHost = (application as? ReactApplication)?.reactHost ?: run {
      isBubbleVisible = false
      ExpoDrawOverAppsModule.setBubbleVisibilityInternal(false, SOURCE_APP)
      stopSelf()
      return
    }

    val surface = reactHost.createSurface(this, BUBBLE_COMPONENT_NAME, null)
    val surfaceView = surface.view ?: run {
      isBubbleVisible = false
      ExpoDrawOverAppsModule.setBubbleVisibilityInternal(false, SOURCE_APP)
      stopSelf()
      return
    }

    val windowLayoutParams = createLayoutParams()
    val container =
      DraggableOverlayLayout(
        this,
        onDrag = { dx, dy ->
          windowLayoutParams.x += dx
          windowLayoutParams.y += dy
          bubblePositionX = windowLayoutParams.x
          bubblePositionY = windowLayoutParams.y
          overlayView?.let { currentView ->
            runCatching {
              windowManager.updateViewLayout(currentView, windowLayoutParams)
            }
          }
        },
        onRemoveRequested = {
          hideBubble(SOURCE_BUBBLE)
          stopSelf()
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

    reactSurface = surface
    overlayView = container
    overlayLayoutParams = windowLayoutParams
    overlayViewReference = WeakReference(container)
    isBubbleVisible = true
    ExpoDrawOverAppsModule.setBubbleVisibilityInternal(true, SOURCE_APP)
    requestOverlayRedraw()
  }

  private fun hideBubble(source: String) {
    reactSurface?.stop()
    reactSurface?.clear()
    reactSurface?.detach()
    reactSurface = null

    overlayView?.let { view ->
      runCatching {
        windowManager.removeViewImmediate(view)
      }
    }
    overlayView = null
    overlayLayoutParams = null
    overlayViewReference.clear()
    isBubbleVisible = false
    ExpoDrawOverAppsModule.setBubbleVisibilityInternal(false, source)
  }

  private fun createLayoutParams(): WindowManager.LayoutParams {
    val overlayType =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
      } else {
        @Suppress("DEPRECATION")
        WindowManager.LayoutParams.TYPE_PHONE
      }

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
      x = bubblePositionX
      y = bubblePositionY
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        layoutInDisplayCutoutMode =
          WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
      }
    }
  }

  companion object {
    const val ACTION_SHOW_BUBBLE = "expo.modules.drawoverapps.action.SHOW_BUBBLE"
    const val ACTION_HIDE_BUBBLE = "expo.modules.drawoverapps.action.HIDE_BUBBLE"
    const val BUBBLE_COMPONENT_NAME = "ExpoDrawOverAppsBubble"
    private const val SOURCE_APP = "app"
    private const val SOURCE_BUBBLE = "bubble"

    @Volatile
    private var bubblePositionX: Int = 48

    @Volatile
    private var bubblePositionY: Int = 180

    @Volatile
    var isBubbleVisible: Boolean = false
      private set

    private var serviceReference = WeakReference<ExpoDrawOverAppsOverlayService?>(null)
    private var overlayViewReference = WeakReference<DraggableOverlayLayout?>(null)

    internal fun requestOverlayRedraw() {
      val service = serviceReference.get() ?: return
      val overlayView = overlayViewReference.get() ?: return

      overlayView.post {
        val currentLayoutParams = service.overlayLayoutParams ?: return@post
        runCatching {
          service.windowManager.updateViewLayout(overlayView, currentLayoutParams)
        }
        overlayView.requestLayout()
        overlayView.invalidate()
        overlayView.postInvalidateOnAnimation()
        overlayView.getChildAt(0)?.let { contentView ->
          contentView.requestLayout()
          contentView.invalidate()
          contentView.postInvalidateOnAnimation()
        }
      }
    }
  }
}
