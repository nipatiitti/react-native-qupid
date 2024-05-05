#import "Qupid.h"

#import "zxing-cpp/ZXIBarcodeReader.h"
#import "zxing-cpp/ZXIFormat.h"

@implementation Qupid
RCT_EXPORT_MODULE()

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED

- (NSString *)convertZXIResultToJSON:(ZXIResult *)result {
    NSDictionary *positionDict = @{
        @"topLeft": @{
            @"x": @(result.position.topLeft.x),
            @"y": @(result.position.topLeft.y)
        },
        @"topRight": @{
            @"x": @(result.position.topRight.x),
            @"y": @(result.position.topRight.y)
        },
        @"bottomRight": @{
            @"x": @(result.position.bottomRight.x),
            @"y": @(result.position.bottomRight.y)
        },
        @"bottomLeft": @{
            @"x": @(result.position.bottomLeft.x),
            @"y": @(result.position.bottomLeft.y)
        }
    };
    
    NSDictionary *jsonDict = @{
        @"data": result.text,
        @"x": @(result.position.topLeft.x),
        @"y": @(result.position.topLeft.y),
        @"width": @(result.position.topRight.x - result.position.topLeft.x),
        @"height": @(result.position.bottomLeft.y - result.position.topLeft.y)
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

- (NSString *)processImage:(CIImage *)image {
    ZXIReaderOptions *options = [[ZXIReaderOptions alloc] init];
    options.formats = @[ @(QR_CODE) ];
    ZXIBarcodeReader *barcodeReader = [[ZXIBarcodeReader alloc] initWithOptions:options];
    
    NSError *error = nil;
    NSArray<ZXIResult *> *results = [barcodeReader readCIImage:image error:&error];
    if (error != nil) {
        NSLog(@"Error reading barcode: %@", error);
        return nil;
    } else {
        NSMutableString *combinedText = [NSMutableString string];
        [combinedText appendString:@"["]; // Start of JSON array
        
        for (ZXIResult *result in results) {
            NSString *toJson = [self convertZXIResultToJSON:result];
            [combinedText appendString:toJson];
            [combinedText appendString:@","]; // Add comma to separate JSON objects
        }
         
        if (results.count > 0) {
            // Remove the last comma
            NSRange lastCommaRange = [combinedText rangeOfString:@"," options:NSBackwardsSearch];
            if (lastCommaRange.location != NSNotFound) {
                [combinedText deleteCharactersInRange:lastCommaRange];
            }
        }
        
        [combinedText appendString:@"]"]; // End of JSON array
        
        return [combinedText copy];
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
