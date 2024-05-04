import React, { useEffect, useState } from 'react'
import { Button, Image, StyleSheet, Text, View } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { useQupid } from 'react-native-qupid'

export function ImageOverlay() {
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

  // The example image is 1179 x 2556 pixels
  const imageWidth = 300
  const scale = imageWidth / 1179
  // SWITCH YOUR IMAGE DIMENSIONS HERE

  const scaledCodes = qrCodes.map((qr) => ({
    ...qr,
    x: qr.x * scale,
    y: qr.y * scale,
    width: qr.width * scale,
    height: qr.height * scale,
  }))

  return (
    <View style={styles.container}>
      <Button title="Select Image" onPress={handlePress} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {imagePath ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imagePath }} style={{ width: imageWidth, height: (imageWidth / 1179) * 2556 }} />
          {scaledCodes.map((qr, i) => (
            <>
              <View key={i} style={[styles.overlay, { top: qr.y, left: qr.x, width: qr.width, height: qr.height }]} />
              <Text
                style={[
                  styles.dataText,
                  {
                    top: qr.y - 30,
                    left: qr.x - 5,
                  },
                ]}
              >
                {qr.data}
              </Text>
            </>
          ))}
        </View>
      ) : null}
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
  imageContainer: {
    position: 'relative',
    marginTop: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    // cyan with red border
    backgroundColor: 'rgba(0, 255, 255, 0.5)',
    borderColor: 'red',
    borderWidth: 1,
    padding: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'salmon',
  },
  dataText: {
    fontSize: 16,
    color: 'black',
    backgroundColor: 'white',
    position: 'absolute',
    textAlign: 'center',
  },
})
