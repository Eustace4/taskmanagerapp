import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './app/navigation/AppNavigator';


export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
