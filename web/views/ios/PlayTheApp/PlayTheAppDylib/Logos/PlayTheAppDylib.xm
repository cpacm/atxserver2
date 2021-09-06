// See http://iphonedevwiki.net/index.php/Logos

#import <UIKit/UIKit.h>
#import <UIKit/UIKit.h>
static NSString *const kGrowingProjectId = @"91eaf9b283361032";

%hook AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
        BOOL result = %orig;
        Class touchclass = NSClassFromString(@"GrowingTouch");
        [touchclass performSelector:@selector(setDebugEnable:) withObject:@(YES)];
        return result;
}

%end


%hook GrowingTouchViewControllerUtil

+ (UIViewController *)findTopViewController {
    UIWindow *window = [[UIApplication sharedApplication].windows firstObject];
        NSLog(@"window %@",window);
    // on iOS 12.5.1,window is hidden and is not a keywindow,so we use keywindow
        // key window is desprecated in muti scene case,but we don`t need adapter it
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
%end
