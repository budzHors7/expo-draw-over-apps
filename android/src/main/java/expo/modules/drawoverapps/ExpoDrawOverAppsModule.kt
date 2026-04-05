package expo.modules.drawoverapps

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class ExpoDrawOverAppsModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context is not available" }

  override fun definition() = ModuleDefinition {
    Name("ExpoDrawOverApps")

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

    AsyncFunction("showBubble") { promise: Promise ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
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
      val serviceIntent = Intent(context, ExpoDrawOverAppsOverlayService::class.java).apply {
        action = ExpoDrawOverAppsOverlayService.ACTION_HIDE_BUBBLE
      }
      context.stopService(serviceIntent)
      true
    }

    Function("isBubbleVisible") {
      ExpoDrawOverAppsOverlayService.isBubbleVisible
    }

    AsyncFunction("openApp") { promise: Promise ->
      val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
      }

      if (launchIntent == null) {
        promise.resolve(false)
        return@AsyncFunction
      }

      context.startActivity(launchIntent)
      promise.resolve(true)
    }
  }
}
