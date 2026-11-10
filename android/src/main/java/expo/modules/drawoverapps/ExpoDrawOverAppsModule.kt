package expo.modules.drawoverapps

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import io.github.expo.modules.v2.Event
import io.github.expo.modules.v2.ExpoModule
import io.github.expo.modules.v2.JS
import io.github.expo.modules.v2.JavaScriptThrowable
import io.github.expo.modules.v2.Module
import io.github.expo.modules.v2.react.androidContext
import io.github.expo.modules.v2.react.currentActivity
import java.lang.ref.WeakReference
import java.util.LinkedHashMap

private class NoActivityException : JavaScriptThrowable("No current activity") {
  override val code = "ERR_NO_ACTIVITY"
}

@ExpoModule("ExpoDrawOverApps")
class ExpoDrawOverAppsModule : Module() {
  private val androidAppContext: Context
    get() = androidContext

  @Event(name = EVENT_BUBBLE_STATE_CHANGED)
  val bubbleStateChanged = event<Map<String, Any>>()

  @Event(name = EVENT_BUBBLE_STATES_CHANGED)
  val bubbleStatesChanged = event<Map<String, List<Map<String, Any>>>>()

  @Event(name = EVENT_OVERLAY_SHARED_VALUE_CHANGED)
  val overlaySharedValueChanged = event<Map<String, Any>>()

  @Event(name = EVENT_OVERLAY_SHARED_VALUES_CHANGED)
  val overlaySharedValuesChanged = event<Map<String, List<Map<String, Any>>>>()

  init {
    moduleReference = WeakReference(this)
  }

  override fun onDestroy() {
    if (moduleReference.get() === this) {
      moduleReference.clear()
    }
    super.onDestroy()
  }

  @JS
  fun canDrawOverlays(): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      Settings.canDrawOverlays(androidAppContext)
    } else {
      true
    }
  }

  @JS
  suspend fun requestPermission(): Boolean {
    val activity = currentActivity ?: throw NoActivityException()
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      if (Settings.canDrawOverlays(androidAppContext)) {
        true
      } else {
        val intent = Intent(
          Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          Uri.parse("package:${activity.packageName}")
        )
        activity.startActivity(intent)
        false
      }
    } else {
      true
    }
  }

  @JS
  fun getBubbleState(): Map<String, Any> = getBubbleStatePayload(DEFAULT_BUBBLE_ID)

  @JS
  fun getBubbleStateById(bubbleId: String): Map<String, Any> = getBubbleStatePayload(bubbleId)

  @JS
  fun getAllBubbleStates(): List<Map<String, Any>> = getAllBubbleStatePayloads()

  @JS
  fun getOverlaySharedValue(valueKey: String): Map<String, Any> = getOverlaySharedValuePayload(valueKey)

  @JS
  fun getAllOverlaySharedValues(): List<Map<String, Any>> = getAllOverlaySharedValuePayloads()

  @JS
  fun setOverlaySharedValue(valueKey: String, value: Double, source: String?): Double =
    setOverlaySharedValueInternal(valueKey, value, source)

  @JS
  suspend fun showBubble(): Boolean {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(androidAppContext)) {
      setBubbleVisibilityInternal(false, DEFAULT_BUBBLE_ID, SOURCE_APP)
      return false
    }

    val serviceIntent = Intent(androidAppContext, ExpoDrawOverAppsOverlayService::class.java).apply {
      action = ExpoDrawOverAppsOverlayService.ACTION_SHOW_BUBBLE
    }
    androidAppContext.startService(serviceIntent)
    return true
  }

  @JS
  suspend fun showBubbleInstance(bubbleId: String): Boolean {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(androidAppContext)) {
      setBubbleVisibilityInternal(false, bubbleId, SOURCE_APP)
      return false
    }

    val serviceIntent = Intent(androidAppContext, ExpoDrawOverAppsOverlayService::class.java).apply {
      action = ExpoDrawOverAppsOverlayService.ACTION_SHOW_BUBBLE
      putExtra(ExpoDrawOverAppsOverlayService.EXTRA_BUBBLE_ID, bubbleId)
    }
    androidAppContext.startService(serviceIntent)
    return true
  }

  @JS
  fun setEdgeHideEnabled(enabled: Boolean): Boolean {
    ExpoDrawOverAppsOverlayService.setEdgeHideEnabled(DEFAULT_BUBBLE_ID, enabled)
    return true
  }

  @JS
  fun setEdgeHideEnabledForBubble(bubbleId: String, enabled: Boolean): Boolean {
    ExpoDrawOverAppsOverlayService.setEdgeHideEnabled(bubbleId, enabled)
    return true
  }

  @JS
  fun hideBubble(): Boolean = closeBubble()

  @JS
  fun hideBubbleInstance(bubbleId: String): Boolean = closeBubbleInstance(bubbleId)

  @JS
  fun hideAllBubbles(): Boolean = closeAllBubbles()

  @JS
  fun closeBubble(): Boolean {
    startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_BUBBLE)
    setBubbleVisibilityInternal(false, DEFAULT_BUBBLE_ID, SOURCE_APP)
    return true
  }

  @JS
  fun closeBubbleInstance(bubbleId: String): Boolean {
    startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_BUBBLE, bubbleId)
    setBubbleVisibilityInternal(false, bubbleId, SOURCE_APP)
    return true
  }

  @JS
  fun closeAllBubbles(): Boolean {
    startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_ALL_BUBBLES)
    hideAllBubblesInternal(SOURCE_APP)
    return true
  }

  @JS
  fun isBubbleVisible(): Boolean = getBubbleStatePayload(DEFAULT_BUBBLE_ID)["isVisible"] as Boolean

  @JS
  fun isBubbleVisibleForBubble(bubbleId: String): Boolean =
    getBubbleStatePayload(bubbleId)["isVisible"] as Boolean

  @JS
  suspend fun openApp(): Boolean {
    val activityManager = androidAppContext.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
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
      return true
    }

    val launchIntent = androidAppContext.packageManager.getLaunchIntentForPackage(androidAppContext.packageName)?.apply {
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_SINGLE_TOP or
          Intent.FLAG_ACTIVITY_CLEAR_TOP or
          Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
      )
    }

    if (launchIntent == null) {
      return false
    }

    androidAppContext.startActivity(launchIntent)
    return true
  }

  private fun startOverlayAction(actionName: String, bubbleId: String? = null) {
    val serviceIntent = Intent(androidAppContext, ExpoDrawOverAppsOverlayService::class.java).apply {
      action = actionName
      if (bubbleId != null) {
        putExtra(ExpoDrawOverAppsOverlayService.EXTRA_BUBBLE_ID, bubbleId)
      }
    }
    androidAppContext.startService(serviceIntent)
  }

  companion object {
    private const val EVENT_BUBBLE_STATE_CHANGED = "onBubbleStateChanged"
    private const val EVENT_BUBBLE_STATES_CHANGED = "onBubbleStatesChanged"
    private const val EVENT_OVERLAY_SHARED_VALUE_CHANGED = "onOverlaySharedValueChanged"
    private const val EVENT_OVERLAY_SHARED_VALUES_CHANGED = "onOverlaySharedValuesChanged"
    private const val DEFAULT_BUBBLE_ID = "default"
    private const val DEFAULT_SHARED_VALUE_KEY = "default"
    private const val MAX_BUBBLE_ID_LENGTH = 80
    private const val SOURCE_APP = "app"
    private const val SOURCE_BUBBLE = "bubble"
    private val unsafeBubbleIdPattern = Regex("[^A-Za-z0-9._:-]+")
    private val repeatedDashPattern = Regex("-+")

    private data class BubbleStateRecord(
      var isVisible: Boolean = false,
      var lastUpdatedAt: Long = System.currentTimeMillis(),
      var lastChangeSource: String = SOURCE_APP
    )

    private data class OverlaySharedValueRecord(
      var value: Double = 0.0,
      var lastUpdatedAt: Long = System.currentTimeMillis(),
      var lastChangeSource: String = SOURCE_APP
    )

    private var moduleReference = WeakReference<ExpoDrawOverAppsModule?>(null)
    private val bubbleStates = LinkedHashMap<String, BubbleStateRecord>()
    private val overlaySharedValues = LinkedHashMap<String, OverlaySharedValueRecord>()

    @Synchronized
    internal fun getBubbleStatePayload(bubbleId: String = DEFAULT_BUBBLE_ID): Map<String, Any> {
      val normalizedBubbleId = normalizeBubbleId(bubbleId)
      val bubbleState = bubbleStates[normalizedBubbleId] ?: BubbleStateRecord()

      return mapOf(
        "bubbleId" to normalizedBubbleId,
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
    internal fun getOverlaySharedValuePayload(valueKey: String = DEFAULT_SHARED_VALUE_KEY): Map<String, Any> {
      val normalizedValueKey = normalizeSharedValueKey(valueKey)
      val sharedValue = overlaySharedValues.getOrPut(normalizedValueKey) { OverlaySharedValueRecord() }

      return mapOf(
        "valueKey" to normalizedValueKey,
        "value" to sharedValue.value,
        "lastUpdatedAt" to sharedValue.lastUpdatedAt,
        "lastChangeSource" to sharedValue.lastChangeSource
      )
    }

    @Synchronized
    internal fun getAllOverlaySharedValuePayloads(): List<Map<String, Any>> {
      val valueKeys = LinkedHashSet<String>()
      valueKeys.add(DEFAULT_SHARED_VALUE_KEY)
      valueKeys.addAll(overlaySharedValues.keys)
      return valueKeys.map { valueKey -> getOverlaySharedValuePayload(valueKey) }
    }

    @Synchronized
    internal fun setOverlaySharedValueInternal(
      valueKey: String = DEFAULT_SHARED_VALUE_KEY,
      value: Double,
      source: String? = SOURCE_APP
    ): Double {
      val normalizedValueKey = normalizeSharedValueKey(valueKey)
      val sharedValue = overlaySharedValues.getOrPut(normalizedValueKey) { OverlaySharedValueRecord() }
      sharedValue.value = if (value.isFinite()) value else 0.0
      sharedValue.lastChangeSource = normalizeChangeSource(source)
      sharedValue.lastUpdatedAt = System.currentTimeMillis()
      emitOverlaySharedValueChanged(normalizedValueKey)
      return sharedValue.value
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
    private fun emitBubbleStateChanged(bubbleId: String) {
      val normalizedBubbleId = normalizeBubbleId(bubbleId)
      val bubbleStatePayload = getBubbleStatePayload(normalizedBubbleId)
      val bubbleStatesPayload = mapOf("states" to getAllBubbleStatePayloads())
      moduleReference.get()?.let { module ->
        if (normalizedBubbleId == DEFAULT_BUBBLE_ID) {
          module.bubbleStateChanged(bubbleStatePayload)
        }
        module.bubbleStatesChanged(bubbleStatesPayload)
      }
      ExpoDrawOverAppsOverlayService.requestOverlayRedraw(normalizedBubbleId)
    }

    @Synchronized
    private fun emitOverlaySharedValueChanged(valueKey: String) {
      val normalizedValueKey = normalizeSharedValueKey(valueKey)
      val valuePayload = getOverlaySharedValuePayload(normalizedValueKey)
      val valuesPayload = mapOf("values" to getAllOverlaySharedValuePayloads())
      moduleReference.get()?.let { module ->
        module.overlaySharedValueChanged(valuePayload)
        module.overlaySharedValuesChanged(valuesPayload)
      }
      ExpoDrawOverAppsOverlayService.requestOverlayRedraw()
    }

    private fun normalizeBubbleId(bubbleId: String?): String {
      val normalizedBubbleId = bubbleId
        ?.trim()
        ?.replace(unsafeBubbleIdPattern, "-")
        ?.replace(repeatedDashPattern, "-")
        ?.trim('-')
        ?.take(MAX_BUBBLE_ID_LENGTH)
        ?.trimEnd('-')
        .orEmpty()

      return normalizedBubbleId.ifEmpty { DEFAULT_BUBBLE_ID }
    }

    private fun normalizeSharedValueKey(valueKey: String?): String {
      val normalizedValueKey = valueKey
        ?.trim()
        ?.replace(unsafeBubbleIdPattern, "-")
        ?.replace(repeatedDashPattern, "-")
        ?.trim('-')
        ?.take(MAX_BUBBLE_ID_LENGTH)
        ?.trimEnd('-')
        .orEmpty()

      return normalizedValueKey.ifEmpty { DEFAULT_SHARED_VALUE_KEY }
    }

    private fun normalizeChangeSource(source: String?): String {
      return if (source == SOURCE_BUBBLE) SOURCE_BUBBLE else SOURCE_APP
    }
  }
}
