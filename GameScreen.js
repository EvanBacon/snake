import Constants from 'expo-constants';
import { GLView } from 'expo-gl';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import GestureView from './components/GestureView';
import Links from './components/Links';
import Colors from './constants/Colors';
import Game from './Game';

export default class App extends React.Component {
  state = { score: 0, isPlaying: false };

  onTap = () => {
    if (this.game) {
      this.game.board.onTap();
    }
  };

  onSwipe = direction => {
    if (this.game) {
      this.game.board.onSwipe(direction);
    }
  };

  onContextCreate = context => {
    this.game = new Game(context);
    this.game.board.onScore = score => this.setState({ score });
    this.game.board.onPlaying = isPlaying => this.setState({ isPlaying });
    this.props.onReady()
  };
  render() {
    return (
      <View style={styles.container}>
        <GestureView
          style={{ flex: 1 }}
          onTap={this.onTap}
          onSwipe={this.onSwipe}
        >
          <GLView
            style={{ flex: 1, height: '100%', overflow: 'hidden' }}
            onContextCreate={this.onContextCreate}
          />
        </GestureView>
        <Text style={styles.score}>{this.state.score}</Text>
        <Links show={!this.state.isPlaying} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: Colors.primary,
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
