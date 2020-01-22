import { AppLoading, SplashScreen, Updates } from 'expo';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import React from 'react';
import { Animated, Button, StyleSheet, Text, View, Platform } from 'react-native';
import GameScreen from './GameScreen';
import * as Font from 'expo-font';

SplashScreen.preventAutoHide(); // Instruct SplashScreen not to hide yet

export default function App() {
  return (
    <AnimatedAppLoader image={require('./assets/loading.png')} />
  );
}

function AnimatedAppLoader({ image }) {
  const [isSplashReady, setSplashReady] = React.useState(false);

  const startAsync = React.useMemo(
    () => () => {
      return Asset.fromModule(image).downloadAsync();
    },
    [image]
  );

  const onFinish = React.useMemo(() => setSplashReady(true), []);

  if (!isSplashReady) {
    return (
      <AppLoading
        startAsync={startAsync}
        onError={console.error}
        onFinish={onFinish}
      />
    );
  }

  return <AnimatedSplashScreen image={image} />
}

function AnimatedSplashScreen({ image }) {
  const animation = React.useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = React.useState(false);
  const [isGameReady, setGameReady] = React.useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = React.useState(
    false
  );

  React.useEffect(() => {
    if (isGameReady) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.select({ web: false, default: true }),
      }).start(() => setAnimationComplete(true));
    }
  }, [isGameReady]);

  const onImageLoaded = React.useMemo(() => async () => {
    SplashScreen.hide();
    try {
      // Load stuff
      await Promise.all([
        Font.loadAsync('kombat', require('./assets/kombat.ttf'))
      ]);
    } catch (e) {
      // handle errors
    } finally {
        setAppReady(true);
    }
  });

  return (
    <View style={{ flex: 1 }}>
        {isAppReady && <GameScreen onReady={() => setGameReady(true)} />}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants.manifest.splash.backgroundColor,
              opacity: animation,
            },
          ]}>
          <Animated.Image
            style={{
              width: '100%',
              height: '100%',
              resizeMode: Constants.manifest.splash.resizeMode || 'contain',
              transform: [
                {
                  scale: animation,
                },
              ],
            }}
            source={image}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
}
