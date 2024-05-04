import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export interface Spec extends TurboModule {
  readImage(filePath: string, inputSubSample: number): Promise<string>
  readRaw(data: number[]): Promise<string>
  readVideo(filePath: string, inputSubSample: number, everyNthFrame: number): Promise<string>
}

export default TurboModuleRegistry.getEnforcing<Spec>('Qupid')
