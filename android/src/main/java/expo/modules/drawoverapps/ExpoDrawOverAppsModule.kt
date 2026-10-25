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
import io.github.expo.modules.v2.Module
import io.github.expo.modules.v2.Record
import io.github.expo.modules.v2.react.androidContext
import io.github.expo.modules.v2.react.currentActivity
import java.lang.ref.WeakReference
import java.util.LinkedHashMap

@Record
data class BubbleStatePayload(
  val bubbleId: String,
  val isVisible: Boolean,
  val lastUpdatedAt: Long,
  val lastChangeSource: String
)

@Record
data class BubbleStatesPayload(val states: List<BubbleStatePayload>)

@Record
data class OverlaySharedValuePayload(
  val valueKey: String,
  val value: Double,
  val lastUpdatedAt: Long,
  val lastChangeSource: String
)

@Record
data class OverlaySharedValuesPayload(val values: List<OverlaySharedValuePayload>)

@ExpoModule("ExpoDrawOverApps")
class ExpoDrawOverAppsModule : Module() {
  private val androidAppContext: Context
    get() = androidContext

  @Event(name = EVENT_BUBBLE_STATE_CHANGED)
  private val onBubbleStateChanged = event<BubbleStatePayload>()

  @Event(name = EVENT_BUBBLE_STATES_CHANGED)
  private val onBubbleStatesChanged = event<BubbleStatesPayload>()

  @Event(name = EVENT_OVERLAY_SHARED_VALUE_CHANGED)
  private val onOverlaySharedValueChanged = event<OverlaySharedValuePayload>()

  @Event(name = EVENT_OVERLAY_SHARED_VALUES_CHANGED)
  private val onOverlaySharedValuesChanged = event<OverlaySharedValuesPayload>()

  init {
    moduleReference = WeakReference(this)
  }

  override fun onDestroy() {
    if (moduleReference.get() === this) {
      moduleReference.clear()
    }
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
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(androidAppContext)) {
      return true
    }

    val activity = requireNotNull(currentActivity) { "No current activity" }
    val intent = Intent(
      Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
      Uri.parse("package:${activity.packageName}")
    )
    activity.startActivity(intent)
    return false
  }

  @JS
  fun getBubbleState(): BubbleStatePayload = getBubbleStatePayload(DEFAULT_BUBBLE_ID)

  @JS
  fun getBubbleStateById(bubbleId: String): BubbleStatePayload = getBubbleStatePayload(bubbleId)

  @JS
  fun getAllBubbleStates(): List<BubbleStatePayload> = getAllBubbleStatePayloads()

  @JS
  fun getOverlaySharedValue(valueKey: String): OverlaySharedValuePayload =
    getOverlaySharedValuePayload(valueKey)

  @JS
  fun getAllOverlaySharedValues(): List<OverlaySharedValuePayload> =
    getAllOverlaySharedValuePayloads()

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
  fun hideBubble(): Boolean {
    startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_BUBBLE)
    setBubbleVisibilityInternal(false, DEFAULT_BUBBLE_ID, SOURCE_APP)
    return true
  }

  @JS
  fun hideBubbleInstance(bubbleId: String): Boolean {
    startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_BUBBLE, bubbleId)
    setBubbleVisibilityInternal(false, bubbleId, SOURCE_APP)
    return true
  }

  @JS
  fun hideAllBubbles(): Boolean {
    startOverlayAction(ExpoDrawOverAppsOverlayService.ACTION_CLOSE_ALL_BUBBLES)
    hideAllBubblesInternal(SOURCE_APP)
    return true
  }

  @JS
  fun closeBubble(): Boolean = hideBubble()

  @JS
  fun closeBubbleInstance(bubbleId: String): Boolean = hideBubbleInstance(bubbleId)

  @JS
  fun closeAllBubbles(): Boolean = hideAllBubbles()

  @JS
  fun isBubbleVisible(): Boolean = getBubbleStatePayload(DEFAULT_BUBBLE_ID).isVisible

  @JS
  fun isBubbleVisibleForBubble(bubbleId: String): Boolean = getBubbleStatePayload(bubbleId).isVisible

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

    val launchIntent = androidAppContext.packageManager
      .getLaunchIntentForPackage(androidAppContext.packageName)
      ?.apply {
        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_SINGLE_TOP or
            Intent.FLAG_ACTIVITY_CLEAR_TOP or
            Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
        )
      } ?: return false

    androidAppContext.startActivity(launchIntent)
    return true
  }

  private fun emitBubbleStateChanged(
    bubbleState: BubbleStatePayload,
    bubbleStates: BubbleStatesPayload
  ) {
    if (bubbleState.bubbleId == DEFAULT_BUBBLE_ID) {
      onBubbleStateChanged(bubbleState)
    }
    onBubbleStatesChanged(bubbleStates)
  }

  private fun emitOverlaySharedValueChanged(
    value: OverlaySharedValuePayload,
    values: OverlaySharedValuesPayload
  ) {
    onOverlaySharedValueChanged(value)
    onOverlaySharedValuesChanged(values)
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
    internal fun getBubbleStatePayload(bubbleId: String = DEFAULT_BUBBLE_ID): BubbleStatePayload {
      val normalizedBubbleId = normalizeBubbleId(bubbleId)
      val bubbleState = bubbleStates[normalizedBubbleId] ?: BubbleStateRecord()

      return BubbleStatePayload(
        bubbleId = normalizedBubbleId,
        isVisible = bubbleState.isVisible,
        lastUpdatedAt = bubbleState.lastUpdatedAt,
        lastChangeSource = bubbleState.lastChangeSource
      )
    }

    @Synchronized
    internal fun getAllBubbleStatePayloads(): List<BubbleStatePayload> {
      val bubbleIds = LinkedHashSet<String>()
      bubbleIds.add(DEFAULT_BUBBLE_ID)
      bubbleIds.addAll(bubbleStates.keys)
      return bubbleIds.map { bubbleId -> getBubbleStatePayload(bubbleId) }
    }

    @Synchronized
    internal fun getOverlaySharedValuePayload(
      valueKey: String = DEFAULT_SHARED_VALUE_KEY
    ): OverlaySharedValuePayload {
      val normalizedValueKey = normalizeSharedValueKey(valueKey)
      val sharedValue = overlaySharedValues.getOrPut(normalizedValueKey) { OverlaySharedValueRecord() }

      return OverlaySharedValuePayload(
        valueKey = normalizedValueKey,
        value = sharedValue.value,
        lastUpdatedAt = sharedValue.lastUpdatedAt,
        lastChangeSource = sharedValue.lastChangeSource
      )
    }

    @Synchronized
    internal fun getAllOverlaySharedValuePayloads(): List<OverlaySharedValuePayload> {
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
      val bubbleStatesPayload = BubbleStatesPayload(getAllBubbleStatePayloads())
      moduleReference.get()?.emitBubbleStateChanged(bubbleStatePayload, bubbleStatesPayload)
      ExpoDrawOverAppsOverlayService.requestOverlayRedraw(normalizedBubbleId)
    }

    @Synchronized
    private fun emitOverlaySharedValueChanged(valueKey: String) {
      val normalizedValueKey = normalizeSharedValueKey(valueKey)
      val valuePayload = getOverlaySharedValuePayload(normalizedValueKey)
      val valuesPayload = OverlaySharedValuesPayload(getAllOverlaySharedValuePayloads())
      moduleReference.get()?.emitOverlaySharedValueChanged(valuePayload, valuesPayload)
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
