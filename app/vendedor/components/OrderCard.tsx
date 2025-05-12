import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface Props { order: any; }

export const OrderCard: React.FC<Props> = ({ order }) => (
  <View style={[styles.card, order.status === 'Completado' && styles.completedCard]}>
    <Image source={{ uri: order.imageUrl }} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.title}>Pedido #{order.id}</Text>
      <Text style={styles.subtitle}>{order.title} — {order.priceFormatted}</Text>
    </View>
    <View style={[styles.badge, order.status === 'Pendiente' ? styles.pending : styles.completed]}>
      <Text
        style={[
          styles.badgeText,
          order.status === 'Pendiente' ? styles.pendingText : styles.completedText
        ]}
      >
        {order.status}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  completedCard: {
    backgroundColor: '#e6fffa',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pending: {
    backgroundColor: '#fef3c7',
  },
  completed: {
    backgroundColor: '#e6fffa',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  pendingText: {
    color: '#b45309',
  },
  completedText: {
    color: '#047857',
  },
});