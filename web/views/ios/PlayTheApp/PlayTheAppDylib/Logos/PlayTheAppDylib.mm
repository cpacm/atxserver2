#line 1 "/Volumes/CaiCai 1/越狱/atxserver2-m/web/views/ios/PlayTheApp/PlayTheAppDylib/Logos/PlayTheAppDylib.xm"


#import <UIKit/UIKit.h>
#import <UIKit/UIKit.h>
static NSString *const kGrowingProjectId = @"91eaf9b283361032";


#include <substrate.h>
#if defined(__clang__)
#if __has_feature(objc_arc)
#define _LOGOS_SELF_TYPE_NORMAL __unsafe_unretained
#define _LOGOS_SELF_TYPE_INIT __attribute__((ns_consumed))
#define _LOGOS_SELF_CONST const
#define _LOGOS_RETURN_RETAINED __attribute__((ns_returns_retained))
#else
#define _LOGOS_SELF_TYPE_NORMAL
#define _LOGOS_SELF_TYPE_INIT
#define _LOGOS_SELF_CONST
#define _LOGOS_RETURN_RETAINED
#endif
#else
#define _LOGOS_SELF_TYPE_NORMAL
#define _LOGOS_SELF_TYPE_INIT
#define _LOGOS_SELF_CONST
#define _LOGOS_RETURN_RETAINED
#endif

@class AppDelegate; @class GrowingTouchViewControllerUtil; 
static BOOL (*_logos_orig$_ungrouped$AppDelegate$application$didFinishLaunchingWithOptions$)(_LOGOS_SELF_TYPE_NORMAL AppDelegate* _LOGOS_SELF_CONST, SEL, UIApplication *, NSDictionary *); static BOOL _logos_method$_ungrouped$AppDelegate$application$didFinishLaunchingWithOptions$(_LOGOS_SELF_TYPE_NORMAL AppDelegate* _LOGOS_SELF_CONST, SEL, UIApplication *, NSDictionary *); static UIViewController * (*_logos_meta_orig$_ungrouped$GrowingTouchViewControllerUtil$findTopViewController)(_LOGOS_SELF_TYPE_NORMAL Class _LOGOS_SELF_CONST, SEL); static UIViewController * _logos_meta_method$_ungrouped$GrowingTouchViewControllerUtil$findTopViewController(_LOGOS_SELF_TYPE_NORMAL Class _LOGOS_SELF_CONST, SEL); 

#line 7 "/Volumes/CaiCai 1/越狱/atxserver2-m/web/views/ios/PlayTheApp/PlayTheAppDylib/Logos/PlayTheAppDylib.xm"


static BOOL _logos_method$_ungrouped$AppDelegate$application$didFinishLaunchingWithOptions$(_LOGOS_SELF_TYPE_NORMAL AppDelegate* _LOGOS_SELF_CONST __unused self, SEL __unused _cmd, UIApplication * application, NSDictionary * launchOptions) {
        BOOL result = _logos_orig$_ungrouped$AppDelegate$application$didFinishLaunchingWithOptions$(self, _cmd, application, launchOptions);
        Class touchclass = NSClassFromString(@"GrowingTouch");
        [touchclass performSelector:@selector(setDebugEnable:) withObject:@(YES)];
        return result;
}






static UIViewController * _logos_meta_method$_ungrouped$GrowingTouchViewControllerUtil$findTopViewController(_LOGOS_SELF_TYPE_NORMAL Class _LOGOS_SELF_CONST __unused self, SEL __unused _cmd) {
    UIWindow *window = [[UIApplication sharedApplication].windows firstObject];
        NSLog(@"window %@",window);
    
        
        if (window.hidden) {
            window = [UIApplication sharedApplication].keyWindow;
        }
    NSLog(@"Use Key window %@",window);
    UIViewController *topViewController = [window rootViewController];
    
    while (true) {
        if (topViewController.presentedViewController) {
            topViewController = topViewController.presentedViewController;
        } else if ([topViewController isKindOfClass:[UINavigationController class]] && [(UINavigationController *) topViewController topViewController]) {
            topViewController = [(UINavigationController *) topViewController topViewController];
        } else if ([topViewController isKindOfClass:[UITabBarController class]]) {
            UITabBarController *tab = (UITabBarController *) topViewController;
            topViewController = tab.selectedViewController;
        } else {
            break;
        }
    }
    return topViewController;
}

static __attribute__((constructor)) void _logosLocalInit() {
{Class _logos_class$_ungrouped$AppDelegate = objc_getClass("AppDelegate"); { MSHookMessageEx(_logos_class$_ungrouped$AppDelegate, @selector(application:didFinishLaunchingWithOptions:), (IMP)&_logos_method$_ungrouped$AppDelegate$application$didFinishLaunchingWithOptions$, (IMP*)&_logos_orig$_ungrouped$AppDelegate$application$didFinishLaunchingWithOptions$);}Class _logos_class$_ungrouped$GrowingTouchViewControllerUtil = objc_getClass("GrowingTouchViewControllerUtil"); Class _logos_metaclass$_ungrouped$GrowingTouchViewControllerUtil = object_getClass(_logos_class$_ungrouped$GrowingTouchViewControllerUtil); { MSHookMessageEx(_logos_metaclass$_ungrouped$GrowingTouchViewControllerUtil, @selector(findTopViewController), (IMP)&_logos_meta_method$_ungrouped$GrowingTouchViewControllerUtil$findTopViewController, (IMP*)&_logos_meta_orig$_ungrouped$GrowingTouchViewControllerUtil$findTopViewController);}} }
#line 47 "/Volumes/CaiCai 1/越狱/atxserver2-m/web/views/ios/PlayTheApp/PlayTheAppDylib/Logos/PlayTheAppDylib.xm"
