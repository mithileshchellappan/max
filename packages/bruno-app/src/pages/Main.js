import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { AppProvider } from 'providers/App';
import { ToastProvider } from 'providers/Toaster';
import { HotkeysProvider } from 'providers/Hotkeys';
import { PromptVariablesProvider } from 'providers/PromptVariables';
import ConvexAuthGate from '../sync/convex/ConvexAuthGate';
import ConvexSyncBridge from '../sync/convex/ConvexSyncBridge';
import ConvexSyncProvider from '../sync/convex/ConvexSyncProvider';

import ReduxStore from 'providers/ReduxStore';
import ThemeProvider from 'providers/Theme/index';
import ErrorBoundary from './ErrorBoundary';

import '../styles/globals.css';
import 'codemirror/lib/codemirror.css';
import 'graphiql/graphiql.min.css';
import 'react-tooltip/dist/react-tooltip.css';
import '@usebruno/graphql-docs/dist/esm/index.css';
import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import { setupPolyfills } from 'utils/common/setupPolyfills';
setupPolyfills();

const getConvexUrl = () => {
  return import.meta.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || '';
};

function Main({ children }) {
  const canRunWithoutElectron = Boolean(getConvexUrl());

  if (!window.ipcRenderer && !canRunWithoutElectron) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-10 my-10 rounded relative" role="alert">
        <strong className="font-bold">ERROR:</strong>
        <span className="block inline ml-1">"ipcRenderer" not found in window object.</span>
        <div>
          You most likely opened Max inside your web browser. Max only works within Electron, you can start Electron
          in an adjacent terminal using "npm run dev:electron".
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ConvexSyncProvider>
        <ConvexAuthGate>
          <Provider store={ReduxStore}>
            <ConvexSyncBridge />
            <ThemeProvider>
              <ToastProvider>
                <PromptVariablesProvider>
                  <AppProvider>
                    <HotkeysProvider>
                      {children}
                    </HotkeysProvider>
                  </AppProvider>
                </PromptVariablesProvider>
              </ToastProvider>
            </ThemeProvider>
          </Provider>
        </ConvexAuthGate>
      </ConvexSyncProvider>
    </ErrorBoundary>
  );
}

export default Main;
