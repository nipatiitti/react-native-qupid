import React, { useEffect, useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { useQupid } from 'react-native-qupid'

export function BasicImageRead() {
  const [imagePath, setImagePath] = useState<string>('')
  const [qrCodes, error, processImage] = useQupid()

  useEffect(() => {
    if (imagePath) {
      console.log(`Reading qr codes from ${imagePath}`)
      processImage(imagePath)
    }
  }, [imagePath, processImage])

  const handlePress = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage)
      } else {
        setImagePath(response.assets?.[0]?.uri || '')
      }
    })
  }

  return (
    <View style={styles.container}>
      <Button title="Select Image" onPress={handlePress} />
      {qrCodes.map((qr, i) => (
        <Text key={i} style={styles.dataText}>
          ({Math.round(qr.x)}, {Math.round(qr.y)}): {qr.data}
        </Text>
      ))}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  spacer: {
    marginTop: 20,
  },
  dataText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'salmon',
  },
})
