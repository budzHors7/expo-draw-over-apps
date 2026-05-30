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
    Events(
      EVENT_BUBBLE_STATE_CHANGED,
      EVENT_BUBBLE_STATES_CHANGED,
      EVENT_OVERLAY_SHARED_VALUE_CHANGED,
      EVENT_OVERLAY_SHARED_VALUES_CHANGED
    )

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

    Function("getOverlaySharedValue") { valueKey: String ->
      getOverlaySharedValuePayload(valueKey)
    }

    Function("getAllOverlaySharedValues") {
      getAllOverlaySharedValuePayloads()
    }

    Function("setOverlaySharedValue") { valueKey: String, value: Double, source: String? ->
      setOverlaySharedValueInternal(valueKey, value, source)
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
      startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_BUBBLE)
      setBubbleVisibilityInternal(false, DEFAULT_BUBBLE_ID, SOURCE_APP)
      true
    }

    Function("hideBubbleInstance") { bubbleId: String ->
      startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_BUBBLE, bubbleId)
      setBubbleVisibilityInternal(false, bubbleId, SOURCE_APP)
      true
    }

    Function("hideAllBubbles") {
      startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_ALL_BUBBLES)
      hideAllBubblesInternal(SOURCE_APP)
      true
    }

    Function("closeBubble") {
      startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_BUBBLE)
      setBubbleVisibilityInternal(false, DEFAULT_BUBBLE_ID, SOURCE_APP)
      true
    }

    Function("closeBubbleInstance") { bubbleId: String ->
      startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_BUBBLE, bubbleId)
      setBubbleVisibilityInternal(false, bubbleId, SOURCE_APP)
      true
    }

    Function("closeAllBubbles") {
      startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_ALL_BUBBLES)
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

  private fun startOverlayAction(actionName: String, bubbleId: String? = null) {
    val serviceIntent = Intent(context, ExpoDrawOverAppsOverlayService::class.java).apply {
      action = actionName
      if (bubbleId != null) {
        putExtra(ExpoDrawOverAppsOverlayService.EXTRA_BUBBLE_ID, bubbleId)
      }
    }
    context.startService(serviceIntent)
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
          module.sendEvent(EVENT_BUBBLE_STATE_CHANGED, bubbleStatePayload)
        }
        module.sendEvent(EVENT_BUBBLE_STATES_CHANGED, bubbleStatesPayload)
      }
      ExpoDrawOverAppsOverlayService.requestOverlayRedraw(normalizedBubbleId)
    }

    @Synchronized
    private fun emitOverlaySharedValueChanged(valueKey: String) {
      val normalizedValueKey = normalizeSharedValueKey(valueKey)
      val valuePayload = getOverlaySharedValuePayload(normalizedValueKey)
      val valuesPayload = mapOf("values" to getAllOverlaySharedValuePayloads())
      moduleReference.get()?.let { module ->
        module.sendEvent(EVENT_OVERLAY_SHARED_VALUE_CHANGED, valuePayload)
        module.sendEvent(EVENT_OVERLAY_SHARED_VALUES_CHANGED, valuesPayload)
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
