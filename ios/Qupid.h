
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNQupidSpec.h"

@interface Qupid : NSObject <NativeQupidSpec>
#else
#import <React/RCTBridgeModule.h>

@interface Qupid : NSObject <RCTBridgeModule>
#endif

@end
