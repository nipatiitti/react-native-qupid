import React, { useMemo, useState } from 'react'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { LineGraph } from 'react-native-graph'
import { launchImageLibrary } from 'react-native-image-picker'
import * as Progress from 'react-native-progress'
import { readImage } from 'react-native-qupid'

export function Benchmark() {
  const [iterations, setIterations] = useState<string>('100')
  const [currentIteration, setCurrentIteration] = useState<number>(0)
  const [inputSamples, setInputSamples] = useState<string>('1')

  const [running, setRunning] = useState<boolean>(false)
  const [done, setDone] = useState<boolean>(false)
  const [results, setResults] = useState<{ value: number; date: Date }[]>([])

  const [qrCodes, setQrCodes] = useState<string[]>([])

  const handlePress = async () => {
    const imagePath = await new Promise<string>((res, rej) =>
      launchImageLibrary({ mediaType: 'photo' }, (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker')
          rej('User cancelled image picker')
        } else if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.errorMessage)
          rej(response.errorMessage)
        } else {
          res(response.assets?.[0]?.uri || '')
        }
      })
    )

    // Start the benchmark
    setRunning(true)

    const runs = []

    for (let i = 0; i < parseInt(iterations, 10); i++) {
      setCurrentIteration(i + 1)
      const start = Date.now()
      if (i === 0) {
        const codes = await readImage(imagePath, parseInt(inputSamples, 10))
        setQrCodes(codes.map((c) => c.data))
      } else {
        await readImage(imagePath, parseInt(inputSamples, 10))
      }
      const end = Date.now()
      runs.push({ value: end - start, date: new Date() })
    }

    console.log('Results:', runs)
    setResults(runs)
    setRunning(false)
    setDone(true)
  }

  const reset = () => {
    setDone(false)
    setResults([])
  }

  const { average, mean } = useMemo(() => {
    if (results.length === 0) return { average: 0, mean: 0 }
    const values = results.map((r) => r.value)
    console.log('Values:', values)
    const sum = values.reduce((acc, val) => acc + val, 0)
    const avg = sum / values.length
    const m = values[Math.floor(values.length / 2)]
    return { average: avg, mean: m }
  }, [results])

  console.log(results)

  return (
    <View style={styles.container}>
      {!running && !done ? (
        <>
          <Text style={styles.dataText}>Iterations of benchmark to run</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of iterations"
            onChangeText={setIterations}
            value={iterations}
          />

          <Text style={styles.dataText}>
            Input File Sample Size (default 1). 2 means every 2nd pixel so the file will be 1/2 the size, but we lose
            half the data.
          </Text>
          <TextInput style={styles.input} onChangeText={setInputSamples} value={inputSamples} />

          <Button title="Run Benchmark" onPress={handlePress} />
        </>
      ) : !done ? (
        <>
          <Text style={styles.dataText}>
            Running benchmark ({currentIteration} / {iterations})
          </Text>
          <Progress.Circle size={100} indeterminate={true} />
        </>
      ) : (
        <>
          <Text style={styles.dataText}>Benchmark complete</Text>
          <LineGraph points={results} animated={false} color="#2979FF" style={{ width: '100%', height: 200 }} />
          <Text style={styles.dataText}>Average: {average}ms</Text>
          <Text style={styles.dataText}>Mean: {mean}ms</Text>
          <Text style={styles.dataText}>QR Codes found: {qrCodes.length}</Text>
          {qrCodes.map((code, i) => (
            <Text key={i} style={styles.dataText}>
              {code}
            </Text>
          ))}
          <Button title="Reset" onPress={reset} />
        </>
      )}
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
  spacer: {
    marginTop: 20,
  },
  dataText: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'salmon',
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
  },
})
