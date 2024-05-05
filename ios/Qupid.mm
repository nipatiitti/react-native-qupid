#import "Qupid.h"

@implementation Qupid
RCT_EXPORT_MODULE()

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED

- (NSString *)convertFeatureToJSON:(CIQRCodeFeature *)result {
    NSDictionary *jsonDict = @{
        @"data": result.messageString,
        @"x": @(result.topLeft.x),
        @"y": @(result.topLeft.y),
        @"width": @(result.topRight.x - result.topLeft.x),
        @"height": @(result.bottomLeft.y - result.topLeft.y)
    };
    
    NSError *error = nil;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:jsonDict options:NSJSONWritingPrettyPrinted error:&error];
    if (error) {
        NSLog(@"Error converting ZXIResult to JSON: %@", error);
        return @"";
    } else {
        NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        return jsonString;
    }
}

- (NSString *)removeFilePrefixFromString:(NSString *)filePath {
    if ([filePath hasPrefix:@"file://"]) {
        // Remove "file://" prefix
        NSString *cleanPath = [filePath substringFromIndex:7];
        return cleanPath;
    }
    // If the prefix is not present, return the original path
    return filePath;
}

-(NSArray *)detectQRCode:(CIImage *) image {
    @autoreleasepool {
        NSDictionary* options;
        CIContext* context = [CIContext context];
        // options = @{ CIDetectorAccuracy : CIDetectorAccuracyHigh }; // Slow but thorough
        options = @{ CIDetectorAccuracy : CIDetectorAccuracyLow}; // Fast but superficial
        
        CIDetector* qrDetector = [CIDetector detectorOfType:CIDetectorTypeQRCode
                                                    context:context
                                                    options:options];
        
        if ([[image properties] valueForKey:(NSString*) kCGImagePropertyOrientation] == nil) {
            options = @{ CIDetectorImageOrientation : @1};
        } else {
            options = @{ CIDetectorImageOrientation : [[image properties] valueForKey:(NSString*) kCGImagePropertyOrientation]};
        }
        
        NSArray * features = [qrDetector featuresInImage:image
                                                 options:options];
        
        return features;
        
    }
}

- (NSString *)processImage:(CIImage *)image {
    
    NSArray* features = [self detectQRCode:image];
    
    if (features != nil && features.count > 0) {
        NSMutableString *combinedText = [NSMutableString string];
        [combinedText appendString:@"["]; // Start of JSON array
        
        for (CIQRCodeFeature* qrFeature in features) {
            NSString *toJson = [self convertFeatureToJSON:qrFeature];
            [combinedText appendString:toJson];
            [combinedText appendString:@","]; // Add comma to separate JSON objects
        }
        
        // Remove the last comma
        NSRange lastCommaRange = [combinedText rangeOfString:@"," options:NSBackwardsSearch];
        if (lastCommaRange.location != NSNotFound) {
            [combinedText deleteCharactersInRange:lastCommaRange];
        }
        
        [combinedText appendString:@"]"]; // End of JSON array
        
        return [combinedText copy];
    } else {
        return @"[]";
    }
}

- (void)readImage:(NSString *)filePath inputSubSample:(double)inputSubSample resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    
    NSString *cleanedPath = [self removeFilePrefixFromString:filePath];
    
    NSData *data = [NSData dataWithContentsOfFile:cleanedPath];
    CIImage *image = [CIImage imageWithData:data];
    
    // Process the image and resolve or reject the promise based on the result
    NSString *resultText = [self processImage:image];
    if (resultText != nil) {
        resolve(resultText);
    } else {
        NSError *error = [NSError errorWithDomain:@"BarcodeReadingErrorDomain" code:0 userInfo:@{NSLocalizedDescriptionKey: @"Error reading barcode"}];
        reject(@"BarcodeReadingError", @"Error reading barcode", error);
    }
}

- (void)readRaw:(NSArray<NSNumber *> *)data resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    
    // Convert NSArray of integers into NSData
    NSMutableData *imageData = [NSMutableData dataWithCapacity:data.count];
    for (NSNumber *number in data) {
        uint8_t byte = [number unsignedCharValue];
        [imageData appendBytes:&byte length:1];
    }
    
    CIImage *image = [CIImage imageWithData:imageData];
    
    // Process the image and resolve or reject the promise based on the result
    NSString *resultText = [self processImage:image];
    if (resultText != nil) {
        resolve(resultText);
    } else {
        NSError *error = [NSError errorWithDomain:@"BarcodeReadingErrorDomain" code:0 userInfo:@{NSLocalizedDescriptionKey: @"Error reading barcode"}];
        reject(@"BarcodeReadingError", @"Error reading barcode", error);
    }
}

- (void)readVideo:(NSString *)filePath inputSubSample:(double)inputSubSample everyNthFrame:(double)everyNthFrame resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    
    NSString *res = @"Hellooo";
    resolve(res);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeQupidSpecJSI>(params);
}
#endif

@end
