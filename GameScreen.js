import Constants from 'expo-constants';
import { GLView } from 'expo-gl';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import GestureView from './components/GestureView';
import Links from './components/Links';
import Colors from './constants/Colors';
import Game from './Game';
import useAppState from './hooks/useAppState';
import { BlurView } from 'expo-blur';

export default function App({ onReady }) {
  const [score, setScore] = React.useState(0);
  const [isPlaying, setPlaying] = React.useState(false);
  const appState = useAppState();
  const isPaused = appState !== 'active';

  let game = React.useRef(null);

  const onContextCreate = React.useMemo(() => context => {
    game.current = new Game(context);
    game.current.board.onScore = score => setScore(score);
    game.current.board.onPlaying = isPlaying => setPlaying(isPlaying);
    game.current.board.setPaused(isPaused);
    onReady()
  }, []);

  React.useEffect(() => {
    if (game.current) game.current.board.setPaused(isPaused)
  }, [game && game.current, appState])

  const onTap = React.useMemo(() => () => {
    if (game.current) {
      game.current.board.onTap();
    }
  }, [game && game.current]);

  const onSwipe = React.useMemo(() => direction => {
    if (game.current) {
      game.current.board.onSwipe(direction);
    }
  }, [game && game.current]);

  return (
    <View style={styles.container}>
      <GestureView
        style={styles.gestureView}
        onTap={onTap}
        onSwipe={onSwipe}
      >
        <GLView
          style={{ flex: 1, height: '100%', overflow: 'hidden' }}
          onContextCreate={onContextCreate}
        />
      </GestureView>

      {isPaused && <Paused />}

      <Text style={styles.score}>{score}</Text>
      <Links show={!isPlaying} />
    </View>
  );
}

function Paused() {
  return (
    <BlurView intensity={90} style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center'}]}>
      <Text style={{ fontFamily: 'kombat', textAlign: 'center', fontSize: 48, }}>Paused</Text>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: Colors.primary,
  },
  gestureView: {
    flex: 1,
  },
  score: {
    position: 'absolute',
    top: 24,
    right: 24,
    opacity: 0.6,
    fontFamily: 'kombat',
    fontSize: 48,
    textAlign: 'right',
    fontWeight: 'bold',
  },
});
