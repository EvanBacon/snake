import React, { Component } from 'react';
import { GestureHandler } from 'expo';
const {
  PanGestureHandler,
  TapGestureHandler,
  Directions,
  State,
} = GestureHandler;
import { Animated } from 'react-native';

export const Axis = {
  Horizontal: 'horizontal',
  Vertical: 'vertical',
};
function isValidSwipe(
  velocity,
  minVelocity,
  directionalOffset,
  directionalOffsetThreshold,
) {
  return (
    Math.abs(velocity) > minVelocity &&
    Math.abs(directionalOffset) < directionalOffsetThreshold
  );
}

class GestureView extends Component {
  static defaultProps = {
    minPointers: 1,
    maxPointers: 1,
    minDist: 5,
    minVelocity: 100,
    directionalOffsetThreshold: 80,
    tapRef: React.createRef(),
    panRef: React.createRef(),
    onPan: () => {},
  };
  constructor(props) {
    super(props);
    this._touchX = new Animated.Value(0);
    this._onPanGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            x: this._touchX,
          },
        },
      ],
      { useNativeDriver: false, listener: this._onPan },
    );
  }

  _lastPosition = null;
  _axis = null;

  _onPan = ({ nativeEvent }, gestureState) => {
    if (!this._axis) {
      if (
        Math.abs(nativeEvent.translationX) > Math.abs(nativeEvent.translationY)
      ) {
        this._axis = Axis.Horizontal;
      } else {
        this._axis = Axis.Vertical;
      }
    }

    let frameTranslation = {
      x: nativeEvent.translationX,
      y: nativeEvent.translationY,
    };
    if (this._lastPosition) {
      frameTranslation = {
        x: nativeEvent.translationX - this._lastPosition.translationX,
        y: nativeEvent.translationY - this._lastPosition.translationY,
      };
    }
    this._lastPosition = nativeEvent;
    this.props.onPan &&
      this.props.onPan({ axis: this._axis, frameTranslation, ...nativeEvent });
  };

  _triggerSwipeHandlers(swipeDirection, gestureState) {
    const {
      onSwipe,
      onSwipeUp,
      onSwipeDown,
      onSwipeLeft,
      onSwipeRight,
    } = this.props;
    const { LEFT, RIGHT, UP, DOWN } = Directions;
    onSwipe && onSwipe(swipeDirection, gestureState);
    switch (swipeDirection) {
      case LEFT:
        onSwipeLeft && onSwipeLeft(gestureState);
        break;
      case RIGHT:
        onSwipeRight && onSwipeRight(gestureState);
        break;
      case UP:
        onSwipeUp && onSwipeUp(gestureState);
        break;
      case DOWN:
        onSwipeDown && onSwipeDown(gestureState);
        break;
    }
  }

  _getSwipeDirection({ velocityX, velocityY, translationX, translationY }) {
    const { LEFT, RIGHT, UP, DOWN } = Directions;
    this._lastPosition;
    if (this._isValidHorizontalSwipe({ velocityX, translationY })) {
      return translationX > 0 ? RIGHT : LEFT;
    } else if (this._isValidVerticalSwipe({ velocityY, translationX })) {
      return translationY > 0 ? DOWN : UP;
    }
    return null;
  }

  _isValidHorizontalSwipe({ velocityX, translationY }) {
    const { minVelocity, directionalOffsetThreshold } = this.props;
    return isValidSwipe(
      velocityX,
      minVelocity,
      translationY,
      directionalOffsetThreshold,
    );
  }

  _isValidVerticalSwipe({ velocityY, translationX }) {
    const { minVelocity, directionalOffsetThreshold } = this.props;
    return isValidSwipe(
      velocityY,
      minVelocity,
      translationX,
      directionalOffsetThreshold,
    );
  }

  _onHandlerStateChange = event => {
    this.props.onHandlerStateChange && this.props.onHandlerStateChange(event);
    const { nativeEvent } = event;
    if (nativeEvent.oldState === State.ACTIVE) {
      this.props.onTouchEnded && this.props.onTouchEnded(nativeEvent);
      this._lastPosition = null;
      this._axis = null;
      const swipeDirection = this._getSwipeDirection(nativeEvent);
      if (!swipeDirection) {
        this.props.onInvalidGesture && this.props.onInvalidGesture(nativeEvent);
        return;
      }
      this._triggerSwipeHandlers(swipeDirection, nativeEvent);
    }
    if (nativeEvent.state === State.BEGAN) {
      this.props.onTouchBegan && this.props.onTouchBegan(nativeEvent);
      this._lastPosition = null;
    }
  };

  _onTapHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      this.props.onTap && this.props.onTap(nativeEvent);
    }
  };

  render() {
    const { tapRef, panRef, ...props } = this.props;
    return (
      <TapGestureHandler
        onHandlerStateChange={this._onTapHandlerStateChange}
        ref={tapRef}
        waitFor={panRef}
        shouldCancelWhenOutside
      >
        <PanGestureHandler
          ref={panRef}
          minDelta={10}
          {...props}
          onGestureEvent={this._onPanGestureEvent}
          onHandlerStateChange={this._onHandlerStateChange}
        />
      </TapGestureHandler>
    );
  }
}

export default GestureView;
