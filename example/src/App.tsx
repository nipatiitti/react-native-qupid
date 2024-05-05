import { Picker } from '@react-native-picker/picker'
import React, { useState } from 'react'
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native'
import { Base64ToRawBitmap } from './components/Base64ToRawBitmap'
import { BasicImageRead } from './components/BasicImageRead'
import { Benchmark } from './components/Benchmark'
import { ImageOverlay } from './components/ImageOverlay'

const selectItems = [
  {
    value: 'BasicImageRead',
    label: 'Basic Image Read',
  },
  {
    value: 'ImageOverlay',
    label: 'Image Overlay',
  },
  {
    value: 'Base64ToRawBitmap',
    label: 'Base64 to Raw Bitmap',
  },
  {
    value: 'Benchmark',
    label: 'Benchmark',
  },
] as const

type Key = (typeof selectItems)[number]['value']

const components = {
  BasicImageRead: <BasicImageRead />,
  ImageOverlay: <ImageOverlay />,
  Base64ToRawBitmap: <Base64ToRawBitmap />,
  Benchmark: <Benchmark />,
} as Record<Key, JSX.Element>

export default function App() {
  const [selected, setSelected] = useState<Key>('BasicImageRead')

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#454545" />
      <Picker selectedValue={selected} onValueChange={(itemValue) => setSelected(itemValue)}>
        {selectItems.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
      {components[selected]}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
})
