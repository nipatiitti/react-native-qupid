import React, { useState } from 'react'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { readRaw, type QRCode } from 'react-native-qupid'

function base64ToBytes(base64: string) {
  // Strip base64 header if it exists
  const base64String = base64.replace(/data:image\/\w+;base64,/, '')
  const binaryString = atob(base64String)
  const bytes: number[] = []
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

export function Base64ToRawBitmap() {
  const [imageBase64, setImageBase64] = useState<string>('')
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])

  const handlePress = async () => {
    if (!imageBase64) {
      return
    }

    const bytes = base64ToBytes(imageBase64)
    console.log(`Reading qr codes from ${bytes.length} bytes`)

    const data = await readRaw(Array.from(bytes))
    setQrCodes(data)
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Paste base64 here"
        onChangeText={setImageBase64}
        value={imageBase64}
        multiline
        numberOfLines={5}
      />
      <Button title="Read QR Codes" onPress={handlePress} />
      {qrCodes.map((qr, i) => (
        <Text key={i} style={styles.dataText}>
          ({Math.round(qr.x)}, {Math.round(qr.y)}): {qr.data}
        </Text>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    padding: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonStyle: {
    marginBottom: 20,
  },
  dataText: {
    fontSize: 16,
  },
})
