import * as React from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';

export default function Links({ show }) {
  return (
    <View style={[styles.linkContainer, { opacity: show ? 0.6 : 0.0 }]} pointerEvents={show ? 'auto' : 'none'}>
      <Text style={styles.link} accessibilityRole="link" href={link} target="_blank" onPress={() => Platform.OS !== 'web' && Linking.openURL(link)}>Evan Bacon 🥓</Text>
      <Text style={styles.link} accessibilityRole="link" href={sourceLink} target="_blank" onPress={() => Platform.OS !== 'web' && Linking.openURL(sourceLink)}>{`</>`}</Text>
    </View>
  )
}

const link = 'https://twitter.com/baconbrix'
const sourceLink = 'https://github.com/EvanBacon/snake'

const styles = StyleSheet.create({
  linkContainer: {
    ...Platform.select({ web: { transitionDuration: '0.2s' }, default: {} }),
    position: 'absolute',
    top: 24,
    left: 24,
  },
  link: {
    fontFamily: 'kombat',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
