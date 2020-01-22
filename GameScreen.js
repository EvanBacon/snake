import Constants from 'expo-constants';
import { GLView } from 'expo-gl';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import GestureView from './components/GestureView';
import Links from './components/Links';
import Colors from './constants/Colors';
import Game from './Game';

export default function App({ onReady }) {
  const [score, setScore] = React.useState(0);
  const [isPlaying, setPlaying] = React.useState(false);
  let game;

  const onContextCreate = React.useMemo(() => context => {
    game = new Game(context);
    game.board.onScore = score => setScore(score);
    game.board.onPlaying = isPlaying => setPlaying(isPlaying);
    onReady()
  }, []);

  const onTap = React.useMemo(() => () => {
    if (game) {
      game.board.onTap();
    }
  }, []);

  const onSwipe = React.useMemo(() => direction => {
    if (game) {
      game.board.onSwipe(direction);
    }
  }, []);

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
      <Text style={styles.score}>{score}</Text>
      <Links show={!isPlaying} />
    </View>
  );
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
