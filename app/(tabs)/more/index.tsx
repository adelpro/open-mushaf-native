// more/index.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

const MoreScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/*  <Text style={styles.title}>المزيد</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('(tabs)/more/about')}
      >
        <Text style={styles.link}>حول التطبيق</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('privacy')}>
        <Text style={styles.link}>سياسة الخصوصية</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  link: {
    fontSize: 18,
    color: '#1E90FF',
    textDecorationLine: 'underline',
    marginVertical: 10,
  },
});

export default MoreScreen;
