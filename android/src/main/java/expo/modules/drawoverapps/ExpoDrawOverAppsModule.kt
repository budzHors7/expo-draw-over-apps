package expo.modules.drawoverapps

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.lang.ref.WeakReference

class ExpoDrawOverAppsModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context is not available" }

  override fun definition() = ModuleDefinition {
    Name("ExpoDrawOverApps")
    Events(EVENT_BUBBLE_STATE_CHANGED)

    OnCreate {
      moduleReference = WeakReference(this@ExpoDrawOverAppsModule)
    }

    OnDestroy {
      if (moduleReference.get() === this@ExpoDrawOverAppsModule) {
        moduleReference.clear()
      }
    }

    Function("canDrawOverlays") {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        Settings.canDrawOverlays(context)
      } else {
        true
      }
    }

    AsyncFunction("requestPermission") { promise: Promise ->
      val activity = appContext.currentActivity ?: run {
        promise.reject("ERR_NO_ACTIVITY", "No current activity", null)
        return@AsyncFunction
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        if (Settings.canDrawOverlays(context)) {
          promise.resolve(true)
        } else {
          val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${activity.packageName}")
          )
          activity.startActivity(intent)
          promise.resolve(false)
        }
      } else {
        promise.resolve(true)
      }
    }

    Function("getBubbleState") {
      getBubbleStatePayload()
    }

    Function("setBubbleCount") { count: Int, source: String? ->
      setBubbleCountInternal(count, source)
    }

    Function("incrementBubbleCount") { source: String? ->
      incrementBubbleCountInternal(source)
    }

    Function("decrementBubbleCount") { source: String? ->
      decrementBubbleCountInternal(source)
    }

    AsyncFunction("showBubble") { promise: Promise ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
        setBubbleVisibilityInternal(false, SOURCE_APP)
        promise.resolve(false)
        return@AsyncFunction
      }

      val serviceIntent = Intent(context, ExpoDrawOverAppsOverlayService::class.java).apply {
        action = ExpoDrawOverAppsOverlayService.ACTION_SHOW_BUBBLE
      }
      context.startService(serviceIntent)
      promise.resolve(true)
    }

    Function("hideBubble") {
      val serviceIntent = Intent(context, ExpoDrawOverAppsOverlayService::class.java)
      context.stopService(serviceIntent)
      setBubbleVisibilityInternal(false, SOURCE_APP)
      true
    }

    Function("isBubbleVisible") {
      getBubbleStatePayload()["isVisible"] as Boolean
    }

    AsyncFunction("openApp") { promise: Promise ->
      val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
      val didMoveExistingTaskToFront =
        runCatching {
          val appTask = activityManager?.appTasks?.firstOrNull()
          if (appTask != null) {
            appTask.moveToFront()
            true
          } else {
            false
          }
        }.getOrDefault(false)

      if (didMoveExistingTaskToFront) {
        promise.resolve(true)
        return@AsyncFunction
      }

      val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_SINGLE_TOP or
            Intent.FLAG_ACTIVITY_CLEAR_TOP or
            Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
        )
      }

      if (launchIntent == null) {
        promise.resolve(false)
        return@AsyncFunction
      }

      context.startActivity(launchIntent)
      promise.resolve(true)
    }
  }

  companion object {
    private const val EVENT_BUBBLE_STATE_CHANGED = "onBubbleStateChanged"
    private const val SOURCE_APP = "app"
    private const val SOURCE_BUBBLE = "bubble"

    private var moduleReference = WeakReference<ExpoDrawOverAppsModule?>(null)
    private var bubbleCount = 0
    private var bubbleVisible = false
    private var lastUpdatedAt = System.currentTimeMillis()
    private var lastChangeSource = SOURCE_APP

    @Synchronized
    internal fun getBubbleStatePayload(): Map<String, Any> {
      return mapOf(
        "count" to bubbleCount,
        "isVisible" to bubbleVisible,
        "lastUpdatedAt" to lastUpdatedAt,
        "lastChangeSource" to lastChangeSource
      )
    }

    @Synchronized
    internal fun setBubbleVisibilityInternal(isVisible: Boolean, source: String? = lastChangeSource): Boolean {
      bubbleVisible = isVisible
      lastChangeSource = normalizeChangeSource(source)
      lastUpdatedAt = System.currentTimeMillis()
      emitBubbleStateChanged()
      return bubbleVisible
    }

    @Synchronized
    internal fun setBubbleCountInternal(count: Int, source: String? = lastChangeSource): Int {
      bubbleCount = count.coerceAtLeast(0)
      lastChangeSource = normalizeChangeSource(source)
      lastUpdatedAt = System.currentTimeMillis()
      emitBubbleStateChanged()
      return bubbleCount
    }

    @Synchronized
    internal fun incrementBubbleCountInternal(source: String? = lastChangeSource): Int {
      return setBubbleCountInternal(bubbleCount + 1, source)
    }

    @Synchronized
    internal fun decrementBubbleCountInternal(source: String? = lastChangeSource): Int {
      return setBubbleCountInternal((bubbleCount - 1).coerceAtLeast(0), source)
    }

    @Synchronized
    private fun emitBubbleStateChanged() {
      val payload = getBubbleStatePayload()
      moduleReference.get()?.sendEvent(EVENT_BUBBLE_STATE_CHANGED, payload)
      ExpoDrawOverAppsOverlayService.requestOverlayRedraw()
    }

    private fun normalizeChangeSource(source: String?): String {
      return if (source == SOURCE_BUBBLE) SOURCE_BUBBLE else SOURCE_APP
    }
  }
}
