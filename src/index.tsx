import React, { useMemo } from 'react'

const Qupid = require('./NativeQupid').default

export type QRCode = {
  data: string
  x: number
  y: number
  width: number
  height: number
}

/**
 * Read qr code content from a given file path
 * @param filePath Path to the image file
 * @param inputSubSample Subsample factor for the image. 1 means no subsample, 2 means every other pixel (1/2 of the image size)
 * @returns Promise<string>
 */
export async function readImage(filePath: string, inputSubSample: number = 1): Promise<QRCode[]> {
  const result: string = await Qupid.readImage(filePath, inputSubSample)
  return JSON.parse(result) as QRCode[]
}

/**
 * Read qr code from a raw bitmap
 * @param data Raw bitmap data. Android will parse it to ReadableArray and iOS will parse it to NSArray<NSNumber>
 * @returns Promise<QrCode[]>
 */
export async function readRaw(data: number[]): Promise<QRCode[]> {
  const result: string = await Qupid.readRaw(data)
  return JSON.parse(result) as QRCode[]
}

/**
 * Read qr code content from a video file. If the video is big or long, it may take a while to process...
 * @param filePath Path to the video file
 * @param inputSubSample Subsample factor for the image. 1 means no subsample, 2 means every other pixel (1/2 of the image size)
 * @param everyNthFrame Only process every nth frame. 1 means process every frame, 2 means process every other frame and so on
 * @returns Promise<string>
 */
export async function readVideo(
  filePath: string,
  inputSubSample: number = 1,
  everyNthFrame: number = 1
): Promise<QRCode[]> {
  const result: string = await Qupid.readVideo(filePath, inputSubSample, everyNthFrame)
  return JSON.parse(result) as QRCode[]
}

/**
 * React Native hook for the readImage function
 * @returns [string, string, string, () => void]
 * @example
 * const [qrData, error, processImage] = useQupid()
 * processImage('path/to/image.jpg')
 */
export function useQupid(): [QRCode[], string, (uri: string) => void] {
  const [qrData, setQrData] = React.useState<QRCode[]>([])
  const [error, setError] = React.useState<string>('')

  const processImage = useMemo(
    () => async (uri: string) => {
      try {
        const data = await readImage(uri)
        setQrData(data)
      } catch (e) {
        const err: Error = e as unknown as Error
        setError(err.message)
      }
    },
    []
  )

  return [qrData, error, processImage]
}
