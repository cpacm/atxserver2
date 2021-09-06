#!/bin/bash

# set -x

echo "第一个参数为：$1";
echo "第一个参数为：$2";

ROOT_DIR=$(cd "$(dirname "$0")";pwd)

echo "当前目录为：$ROOT_DIR"

FRIDA_DIR="$ROOT_DIR/frida-ios-dump"

echo "cd ${FRIDA_DIR}"

cd ${FRIDA_DIR}

APP_NAME=`frida-ps -Ua  | grep $1 | awk '{print $2}' `

MONKEY_DIR="${ROOT_DIR}/PlayTheApp"
TARGET_DIR="${ROOT_DIR}/PlayTheApp/PlayTheApp/TargetApp"

find . -name "*.ipa"  | xargs rm -f

# 砸壳生成 ipa
dump.py $1

# 寻找ipa
cd $TARGET_DIR

echo "287287" | sudo -S find . -name "*.ipa"  | xargs rm -f

echo " mv -f $FRIDA_DIR/${APP_NAME}.ipa $TARGET_DIR"

mv -f "$FRIDA_DIR/${APP_NAME}.ipa" "$TARGET_DIR/${APP_NAME}.ipa"

cd $MONKEY_DIR
echo "cd ${MONKEY_DIR}"

PROJECT_PATH="${MONKEY_DIR}/PlayTheApp.xcworkspace"
TARGET=PlayTheApp
CONFIGURATION=Debug

xcodebuild -workspace "$PROJECT_PATH"  -scheme "$TARGET" \
-configuration "$CONFIGURATION" \
-destination id=$2 \
 || { echo "xcodebuild failed !"; exit 1; }

CREATEIPA_DIR="$MONKEY_DIR/LatestBuild"

cd $CREATEIPA_DIR
rm "$CREATEIPA_DIR/$TARGET.ipa" "$CREATEIPA_DIR/Payload"
mkdir "$CREATEIPA_DIR/Payload"
cp -rf "$CREATEIPA_DIR/$TARGET.app" "$CREATEIPA_DIR/Payload"
rm "$CREATEIPA_DIR/Payload"
zip -qr Target.ipa Payload
# Target.ipa is static value
echo "$CREATEIPA_DIR/Target.ipa"

INJECT_DIR=$ROOT_DIR/../../../uploads/inject
mkdir $INJECT_DIR
rm "$INJECT_DIR/Target.ipa"
cp -rf "$CREATEIPA_DIR/Target.ipa" "$INJECT_DIR/Target.ipa"

exit 0