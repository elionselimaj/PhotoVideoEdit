import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '@/styles';

const SafeArea = styled(SafeAreaView)`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const App: React.FC = () => {
  return (
    <SafeArea>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
    </SafeArea>
  );
};

export default App;
