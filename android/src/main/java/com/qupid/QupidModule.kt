package com.qupid

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule

import boofcv.abst.fiducial.QrCodeDetector;
import boofcv.android.ConvertBitmap
import boofcv.factory.fiducial.ConfigQrCode
import boofcv.factory.fiducial.FactoryFiducial;
import boofcv.struct.image.GrayU8;

data class QRCode(
  var data: String = "",
  var x: Double = 0.0,
  var y: Double = 0.0,
  var width: Double = 0.0,
  var height: Double = 0.0
) {
  fun toJSON(): String {
    return "{\"data\":\"$data\",\"x\":$x,\"y\":$y,\"width\":$width,\"height\":$height}"
  }
}

@ReactModule(name = QupidModule.NAME)
class QupidModule(reactContext: ReactApplicationContext) :
  NativeQupidSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun readImage(filePath: String, inputSubSample: Double, promise: Promise) {
    val options = BitmapFactory.Options()

    options.apply {
      inSampleSize = inputSubSample.toInt()
    }

    // If the filepath starts with "file://", remove it
    val file = filePath.replace("file://", "")
    val bitmap = BitmapFactory.decodeFile(file, options)

    val result = processImage(bitmap)

    promise.resolve(result)
  }

  override fun readRaw(data: ReadableArray, promise: Promise) {
    val byteArray = ByteArray(data.size())
    for (i in 0 until data.size()) {
      byteArray[i] = data.getInt(i).toByte()
    }

    val bitmap = BitmapFactory.decodeByteArray(byteArray, 0, byteArray.size)

    val result = processImage(bitmap)
    promise.resolve(result)
  }

  override fun readVideo(
    filePath: String?,
    inputSubSample: Double,
    everyNthFrame: Double,
    promise: Promise?
  ) {

  }

  fun processImage(bitmap: Bitmap): String {
    val config = ConfigQrCode.fast()
    config.considerTransposed = true

    val detector: QrCodeDetector<GrayU8> = FactoryFiducial.qrcode(config, GrayU8::class.java)
    val image = ConvertBitmap.bitmapToGray(bitmap, null as GrayU8?, null)

    detector.process(image)

    val qrCodes = mutableListOf<QRCode>()

    for (qr in detector.detections) {
      val topLeft = qr.bounds[0]
      val bottomRight = qr.bounds[2]
      val width = bottomRight.x - topLeft.x
      val height = bottomRight.y - topLeft.y

      val code = QRCode()
      code.data = qr.message
      code.x = topLeft.x.toDouble()
      code.y = topLeft.y.toDouble()
      code.width = width.toDouble()
      code.height = height.toDouble()

      qrCodes.add(code)
    }

    var json = "["

    for (i in 0 until qrCodes.size) {
      json += qrCodes[i].toJSON()
      if (i < qrCodes.size - 1) {
        json += ","
      }
    }

    json += "]"

    return json
  }

  companion object {
    const val NAME = "Qupid"
  }
}
