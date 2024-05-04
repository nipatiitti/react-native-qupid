# react-native-qupid

QR Code scanning made simple stupid (and fast): **Qupid**.

<img src="assets/Example_2.png" alt="example_image" height="400" width="400" style="object-fit: cover; object-position: 50% 60%;" />

This library uses the react native [new architecture](https://github.com/reactwg/react-native-new-architecture/tree/main) with TurboModules significantly improving the performance compared packages using the old architecture.

All react-native code is in TypeScript, android code is full Kotlin and iOS code is Objective-C.

Under the hood it uses [BoofCV](https://boofcv.org/index.php?title=Main_Page) for android (which is 1.8 faster than the google MLKit. For more info check the [performance](PERFORMANCE.md) section) and [VisionKit](https://developer.apple.com/documentation/vision) for iOS.

This project has the TurboModule javascript interface in [src](src) and the native codes in [android](android) / [ios](ios) folders.

There is also a [example](example) project to test the library. The example project has multiple use case demos e.g.

- [Basic image read](example/src/components/BasicImageRead.tsx)
- [Image Overlay](example/src/components/ImageOverlay.tsx)
- [Base64 to Raw Bitmap](example/src/components/Base64ToRawBitmap.tsx)
- [Benchmark](example/src/components/Benchmark.tsx)

More about performance can be found in the [performance](PERFORMANCE.md) document.

## Installation

<details open>
<summary> Yarn </summary>

```sh
yarn add react-native-qupid
```
</details>

<details>
<summary> NPM </summary>

```sh
npm install react-native-qupid
```
</details>

## Setup

To enable the new architecture for your apps (it's enabled by default in the example project), follow the instructions in the [here](https://github.com/reactwg/react-native-new-architecture/blob/main/docs/enable-apps.md)

## Usage

This library exports the functions `readImage`, `readRaw` with the `useQupid` hook for ease of use. 

### Basic Usage of the hook `useQupid`

```tsx

import { useQupid } from 'react-native-qupid';

const App = () => {
  const [imagePath, setImagePath] = useState<string>('')
  const [qrCodes, error, processImage] = useQupid()

  useEffect(() => {
    if (!imagePath) return
    processImage(imagePath)
  }, [imagePath, processImage])

  ...

  return (
    {qrCodes.map((qrCode, index) => (
      <Text key={index}>{qrCode.data}</Text>
    ))}
  )
}    
```

### Basic Usage of the function `readImage`

```tsx
import { readImage } from 'react-native-qupid';

const filePath = 'path/to/image'
const qrCodes = await readImage(filePath)
```

### Basic Usage of the function `readRaw`

```tsx
import { readRaw } from 'react-native-qupid';

const rawBytes: number[] = [0x00, ..., 0x00]
const qrCodes = await readRaw(rawBytes)
```

## API

- [useQupid](#useQupid)
- [readImage](#readImage)
- [readRaw](#readRaw)
- [QRCode](#QRCode)

### `useQupid`

This is a hook that provides QR code data, error messages, and a function to process an image.

#### Return Type

| Name | Type | Description |
| --- | --- | --- |
| qrData | `QRCode[]` | An array of QR codes. Each `QRCode` object contains the data encoded in the QR code and its position in the image. |
| error | `string` | An error message. If there is no error, this will be an empty string. |
| processImage | `(uri: string) => void` | A function that takes a URI of an image, reads the image, and sets `qrData` and `error` based on the image content. |

#### Usage

```tsx
const [qrData, error, processImage] = useQupid();
```

Call `processImage` with the URI of an image to read QR codes from the image. After the image is processed, `qrData` will be an array of QR codes found in the image, and `error` will be an error message if there was an error reading the image.

### `readImage`

This function reads QR codes from an image file.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| filePath | `string` | The path to the image file. |
| inputSubSample | `number` | The subsample factor for the image. A value of 1 means no subsample, 2 means every other pixel (1/2 of the image size). |

#### Return Type

| Type | Description |
| --- | --- |
| `Promise<QRCode[]>` | A promise that resolves to an array of QR codes found in the image. Each `QRCode` object contains the data encoded in the QR code and its position in the image. |

#### Usage

```tsx
const qrCodes = await readImage(filePath, inputSubSample);
```

### `readRaw`

This function reads QR codes from a raw bitmap.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| data | `number[]` | The raw bitmap data. Android will parse it to a `ReadableArray`, and iOS will parse it to an `NSArray<NSNumber>`. |

#### Return Type

| Type | Description |
| --- | --- |
| `Promise<QRCode[]>` | A promise that resolves to an array of QR codes found in the raw bitmap. Each `QRCode` object contains the data encoded in the QR code and its position in the image. |

#### Usage

```tsx
const qrCodes = await readRaw(data);
```

### `QRCode`

```ts
type QRCode = {
  data: string
  x: number
  y: number
  width: number
  height: number
}
```

#### Properties

| Name | Type | Description |
| --- | --- | --- |
| data | `string` | The data encoded in the QR code. |
| x | `number` | The x-coordinate of the top-left corner of the QR code in the image. |
| y | `number` | The y-coordinate of the top-left corner of the QR code in the image. |
| width | `number` | The width of the QR code in the image. |
| height | `number` | The height of the QR code in the image. |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
