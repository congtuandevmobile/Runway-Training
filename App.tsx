/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StackNavigator from 'src/navigation/AppNavigator';
import "./unistyles";

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        animated
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <StackNavigator />
    </SafeAreaProvider>
  );
}

export default App;
