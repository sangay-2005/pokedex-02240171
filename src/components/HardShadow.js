import { View } from 'react-native';

// Draws a solid offset "shadow" behind its child (works on Android and iOS).
export default function HardShadow({
  children,
  offset = 4,
  radius = 16,
  color = '#111111',
  style,
}) {
  return (
    <View style={[{ paddingRight: offset, paddingBottom: offset }, style]}>
      <View
        style={{
          position: 'absolute',
          top: offset,
          left: offset,
          right: 0,
          bottom: 0,
          backgroundColor: color,
          borderRadius: radius,
        }}
      />
      {children}
    </View>
  );
}