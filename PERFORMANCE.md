# Performance

One of the main goals of this project was to be as energy efficient as possible.

For that purpose I did quite a bit of research and ended up with few contenders for both iOS and Android.

To test the contenders I used the provided sample image and each run was done 100 times, with the image always loading again from disk. This adds ~50ms of overhead to each time, but it's a good way to simulate a real world scenario.

The used benchmark can be found from the [example](example/src/components/Benchmark.tsx) project. For ios the benchmark was run on iPhone 7 and for Android using Pixel 3 emulator.

## iOS

The main conteneders for iOS were:
- [zxing-cpp](https://github.com/zxing-cpp/zxing-cpp)
- [CIDetector](https://developer.apple.com/documentation/coreimage/cidetector)

ZXing had high promises for good performance but with quick benchmark it was quite clear that the native CIDetector was much faster.

| Library | avg time (ms) | mean time (ms) | image |
| --- | --- | --- | --- |
| CIDetector | 130.68 | 116 | ![CIDetector](/assets/ios_CIDetector.jpg) |
| zxing-cpp | 331.16 | 332 | ![zxing-cpp](/assets/ios_zxing.jpg) |

I ended up using CIDetector for iOS.

## Android

For Android the main contenders were:
- [BoofCV](https://boofcv.org/index.php?title=Main_Page)
- [MLKit](https://developers.google.com/ml-kit)

BoofCV was the clear winner here. It was 1.8 times faster than the MLKit.

| Library | avg time (ms) | image |
| --- | --- | --- |
| BoofCV | 101.05 | ![BoofCV](/assets/android_boofcv.jpg) |
| MLKit | 186.87 | ![MLKit](/assets/android_mlkit.jpg) |

BoofCV also has the fabulous ability to down sample the image before processing it. This is a huge win for performance, if the qr codes are not too small.

By using inSampleSize of 2, the time was reduced to 80ms, but we could only read 2 of the 3 qr codes.
