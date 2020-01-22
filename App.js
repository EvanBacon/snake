import { Constants, GLView } from 'expo';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Game from './Game';
import GestureView from './GestureView';

export default class App extends React.Component {
  state = { score: 0 };

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
  };
  render() {
    const { style, ...props } = this.props;
    return (
      <View style={[styles.container, style]}>
        <GestureView onTap={this.onTap} onSwipe={this.onSwipe}>
          <GLView style={{ flex: 1 }} onContextCreate={this.onContextCreate} />
        </GestureView>
        <Text style={styles.score}>{this.state.score}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  score: {
    fontSize: 48,
    textAlign: 'right',
    position: 'absolute',
    top: 24,
    right: 24,
    opacity: 0.6,
    fontWeight: 'bold',
  },
});
