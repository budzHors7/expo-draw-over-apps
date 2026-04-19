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
import java.util.LinkedHashMap

class ExpoDrawOverAppsModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context is not available" }

  override fun definition() = ModuleDefinition {
    Name("ExpoDrawOverApps")
    Events(EVENT_BUBBLE_STATE_CHANGED, EVENT_BUBBLE_STATES_CHANGED)

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
      getBubbleStatePayload(DEFAULT_BUBBLE_ID)
    }

    Function("getBubbleStateById") { bubbleId: String ->
      getBubbleStatePayload(bubbleId)
    }

    Function("getAllBubbleStates") {
      getAllBubbleStatePayloads()
    }

    Function("setBubbleCount") { count: Int, source: String? ->
      setBubbleCountInternal(count, DEFAULT_BUBBLE_ID, source)
    }

    Function("setBubbleCountForBubble") { bubbleId: String, count: Int, source: String? ->
      setBubbleCountInternal(count, bubbleId, source)
    }

    Function("incrementBubbleCount") { source: String? ->
      incrementBubbleCountInternal(DEFAULT_BUBBLE_ID, source)
    }

    Function("incrementBubbleCountForBubble") { bubbleId: String, source: String? ->
      incrementBubbleCountInternal(bubbleId, source)
    }

    Function("decrementBubbleCount") { source: String? ->
      decrementBubbleCountInternal(DEFAULT_BUBBLE_ID, source)
    }

    Function("decrementBubbleCountForBubble") { bubbleId: String, source: String? ->
      decrementBubbleCountInternal(bubbleId, source)
    }

    AsyncFunction("showBubble") { promise: Promise ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
        setBubbleVisibilityInternal(false, DEFAULT_BUBBLE_ID, SOURCE_APP)
        promise.resolve(false)
        return@AsyncFunction
      }

      val serviceIntent = Intent(context, ExpoDrawOverAppsOverlayService::class.java).apply {
        action = ExpoDrawOverAppsOverlayService.ACTION_SHOW_BUBBLE
      }
      context.startService(serviceIntent)
      promise.resolve(true)
    }

    AsyncFunction("showBubbleInstance") { bubbleId: String, promise: Promise ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
        setBubbleVisibilityInternal(false, bubbleId, SOURCE_APP)
        promise.resolve(false)
        return@AsyncFunction
      }

      val serviceIntent = Intent(context, ExpoDrawOverAppsOverlayService::class.java).apply {
        action = ExpoDrawOverAppsOverlayService.ACTION_SHOW_BUBBLE
        putExtra(ExpoDrawOverAppsOverlayService.EXTRA_BUBBLE_ID, bubbleId)
      }
      context.startService(serviceIntent)
      promise.resolve(true)
    }

    Function("setEdgeHideEnabled") { enabled: Boolean ->
      ExpoDrawOverAppsOverlayService.setEdgeHideEnabled(DEFAULT_BUBBLE_ID, enabled)
      true
    }

    Function("setEdgeHideEnabledForBubble") { bubbleId: String, enabled: Boolean ->
      ExpoDrawOverAppsOverlayService.setEdgeHideEnabled(bubbleId, enabled)
      true
    }

    Function("hideBubble") {
      val serviceIntent = Intent(context, ExpoDrawOverAppsOverlayService::class.java).apply {
        action = ExpoDrawOverAppsOverlayService.ACTION_HIDE_BUBBLE
      }
      context.startService(serviceIntent)
      setBubbleVisibilityInternal(false, DEFAULT_BUBBLE_ID, SOURCE_APP)
      true
    }

    Function("hideBubbleInstance") { bubbleId: String ->
      val serviceIntent = Intent(context, ExpoDrawOverAppsOverlayService::class.java).apply {
        action = ExpoDrawOverAppsOverlayService.ACTION_HIDE_BUBBLE
        putExtra(ExpoDrawOverAppsOverlayService.EXTRA_BUBBLE_ID, bubbleId)
      }
      context.startService(serviceIntent)
      setBubbleVisibilityInternal(false, bubbleId, SOURCE_APP)
      true
    }

    Function("hideAllBubbles") {
      val serviceIntent = Intent(context, ExpoDrawOverAppsOverlayService::class.java).apply {
        action = ExpoDrawOverAppsOverlayService.ACTION_HIDE_ALL_BUBBLES
      }
      context.startService(serviceIntent)
      hideAllBubblesInternal(SOURCE_APP)
      true
    }

    Function("isBubbleVisible") {
      getBubbleStatePayload(DEFAULT_BUBBLE_ID)["isVisible"] as Boolean
    }

    Function("isBubbleVisibleForBubble") { bubbleId: String ->
      getBubbleStatePayload(bubbleId)["isVisible"] as Boolean
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
    private const val EVENT_BUBBLE_STATES_CHANGED = "onBubbleStatesChanged"
    private const val DEFAULT_BUBBLE_ID = "default"
    private const val SOURCE_APP = "app"
    private const val SOURCE_BUBBLE = "bubble"

    private data class BubbleStateRecord(
      var count: Int = 0,
      var isVisible: Boolean = false,
      var lastUpdatedAt: Long = System.currentTimeMillis(),
      var lastChangeSource: String = SOURCE_APP
    )

    private var moduleReference = WeakReference<ExpoDrawOverAppsModule?>(null)
    private val bubbleStates = LinkedHashMap<String, BubbleStateRecord>()

    @Synchronized
    internal fun getBubbleStatePayload(bubbleId: String = DEFAULT_BUBBLE_ID): Map<String, Any> {
      val normalizedBubbleId = normalizeBubbleId(bubbleId)
      val bubbleState = bubbleStates[normalizedBubbleId] ?: BubbleStateRecord()

      return mapOf(
        "bubbleId" to normalizedBubbleId,
        "count" to bubbleState.count,
        "isVisible" to bubbleState.isVisible,
        "lastUpdatedAt" to bubbleState.lastUpdatedAt,
        "lastChangeSource" to bubbleState.lastChangeSource
      )
    }

    @Synchronized
    internal fun getAllBubbleStatePayloads(): List<Map<String, Any>> {
      val bubbleIds = LinkedHashSet<String>()
      bubbleIds.add(DEFAULT_BUBBLE_ID)
      bubbleIds.addAll(bubbleStates.keys)
      return bubbleIds.map { bubbleId -> getBubbleStatePayload(bubbleId) }
    }

    @Synchronized
    internal fun setBubbleVisibilityInternal(
      isVisible: Boolean,
      bubbleId: String = DEFAULT_BUBBLE_ID,
      source: String? = SOURCE_APP
    ): Boolean {
      val normalizedBubbleId = normalizeBubbleId(bubbleId)
      val bubbleState = bubbleStates.getOrPut(normalizedBubbleId) { BubbleStateRecord() }
      bubbleState.isVisible = isVisible
      bubbleState.lastChangeSource = normalizeChangeSource(source)
      bubbleState.lastUpdatedAt = System.currentTimeMillis()
      emitBubbleStateChanged(normalizedBubbleId)
      return bubbleState.isVisible
    }

    @Synchronized
    internal fun hideAllBubblesInternal(source: String? = SOURCE_APP) {
      val knownBubbleIds = LinkedHashSet<String>()
      knownBubbleIds.add(DEFAULT_BUBBLE_ID)
      knownBubbleIds.addAll(bubbleStates.keys)

      for (bubbleId in knownBubbleIds) {
        setBubbleVisibilityInternal(false, bubbleId, source)
      }
    }

    @Synchronized
    internal fun setBubbleCountInternal(
      count: Int,
      bubbleId: String = DEFAULT_BUBBLE_ID,
      source: String? = SOURCE_APP
    ): Int {
      val normalizedBubbleId = normalizeBubbleId(bubbleId)
      val bubbleState = bubbleStates.getOrPut(normalizedBubbleId) { BubbleStateRecord() }
      bubbleState.count = count.coerceAtLeast(0)
      bubbleState.lastChangeSource = normalizeChangeSource(source)
      bubbleState.lastUpdatedAt = System.currentTimeMillis()
      emitBubbleStateChanged(normalizedBubbleId)
      return bubbleState.count
    }

    @Synchronized
    internal fun incrementBubbleCountInternal(
      bubbleId: String = DEFAULT_BUBBLE_ID,
      source: String? = SOURCE_APP
    ): Int {
      val normalizedBubbleId = normalizeBubbleId(bubbleId)
      val bubbleState = bubbleStates.getOrPut(normalizedBubbleId) { BubbleStateRecord() }
      return setBubbleCountInternal(bubbleState.count + 1, normalizedBubbleId, source)
    }

    @Synchronized
    internal fun decrementBubbleCountInternal(
      bubbleId: String = DEFAULT_BUBBLE_ID,
      source: String? = SOURCE_APP
    ): Int {
      val normalizedBubbleId = normalizeBubbleId(bubbleId)
      val bubbleState = bubbleStates.getOrPut(normalizedBubbleId) { BubbleStateRecord() }
      return setBubbleCountInternal((bubbleState.count - 1).coerceAtLeast(0), normalizedBubbleId, source)
    }

    @Synchronized
    private fun emitBubbleStateChanged(bubbleId: String) {
      val normalizedBubbleId = normalizeBubbleId(bubbleId)
      val bubbleStatePayload = getBubbleStatePayload(normalizedBubbleId)
      val bubbleStatesPayload = mapOf("states" to getAllBubbleStatePayloads())
      moduleReference.get()?.let { module ->
        if (normalizedBubbleId == DEFAULT_BUBBLE_ID) {
          module.sendEvent(EVENT_BUBBLE_STATE_CHANGED, bubbleStatePayload)
        }
        module.sendEvent(EVENT_BUBBLE_STATES_CHANGED, bubbleStatesPayload)
      }
      ExpoDrawOverAppsOverlayService.requestOverlayRedraw(normalizedBubbleId)
    }

    private fun normalizeBubbleId(bubbleId: String?): String {
      return bubbleId?.takeIf { it.isNotBlank() } ?: DEFAULT_BUBBLE_ID
    }

    private fun normalizeChangeSource(source: String?): String {
      return if (source == SOURCE_BUBBLE) SOURCE_BUBBLE else SOURCE_APP
    }
  }
}
