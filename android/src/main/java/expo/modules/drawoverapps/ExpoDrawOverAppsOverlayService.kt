package expo.modules.drawoverapps

import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import com.facebook.react.ReactApplication
import com.facebook.react.interfaces.fabric.ReactSurface

class ExpoDrawOverAppsOverlayService : Service() {
  private lateinit var windowManager: WindowManager
  private var overlayView: View? = null
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
    return START_STICKY
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

    surfaceView.setBackgroundColor(Color.TRANSPARENT)
    windowManager.addView(surfaceView, createLayoutParams())
    surface.start()

    reactSurface = surface
    overlayView = surfaceView
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
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      overlayType,
      WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
      PixelFormat.TRANSLUCENT
    ).apply {
      gravity = Gravity.TOP or Gravity.START
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
    var isBubbleVisible: Boolean = false
      private set
  }
}
