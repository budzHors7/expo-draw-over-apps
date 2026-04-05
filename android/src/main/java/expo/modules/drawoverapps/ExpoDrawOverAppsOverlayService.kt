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

class ExpoDrawOverAppsOverlayService : Service() {
  private lateinit var windowManager: WindowManager
  private var overlayView: DraggableOverlayLayout? = null
  private var reactSurface: ReactSurface? = null

  override fun onCreate() {
    super.onCreate()
    windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_HIDE_BUBBLE -> stopSelf()
      else -> showBubble()
    }
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    hideBubble()
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun showBubble() {
    if (overlayView != null) {
      isBubbleVisible = true
      return
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
      isBubbleVisible = false
      stopSelf()
      return
    }

    val reactHost = (application as? ReactApplication)?.reactHost ?: run {
      isBubbleVisible = false
      stopSelf()
      return
    }

    val surface = reactHost.createSurface(this, BUBBLE_COMPONENT_NAME, null)
    val surfaceView = surface.view ?: run {
      isBubbleVisible = false
      stopSelf()
      return
    }

    val windowLayoutParams = createLayoutParams()
    val container = DraggableOverlayLayout(this) { dx, dy ->
      windowLayoutParams.x += dx
      windowLayoutParams.y += dy
      bubblePositionX = windowLayoutParams.x
      bubblePositionY = windowLayoutParams.y
      overlayView?.let { currentView ->
        runCatching {
          windowManager.updateViewLayout(currentView, windowLayoutParams)
        }
      }
    }.apply {
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
    isBubbleVisible = true
  }

  private fun hideBubble() {
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
    isBubbleVisible = false
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

    @Volatile
    private var bubblePositionX: Int = 48

    @Volatile
    private var bubblePositionY: Int = 180

    @Volatile
    var isBubbleVisible: Boolean = false
      private set
  }
}
