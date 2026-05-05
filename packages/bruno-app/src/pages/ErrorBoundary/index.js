import React from 'react';

import Bruno from 'components/Bruno/index';

const shouldShowErrorDetails = import.meta.env.MODE !== 'production';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }

  componentDidMount() {
    // Add a global error event listener to capture client-side errors
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Unhandled renderer error', { message, source, lineno, colno, error });
      this.setState({ hasError: true, error });
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Renderer error boundary caught an error', { error, errorInfo });
    this.setState({ hasError: true, error, errorInfo });
  }

  returnToApp() {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  }

  forceQuit() {
    const { ipcRenderer } = window;
    ipcRenderer.invoke('main:force-quit');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex text-center justify-center p-20 h-full">
          <div className="bg-white rounded-lg p-10 w-full">
            <div className="m-auto" style={{ width: '256px' }}>
              <Bruno width={256} />
            </div>

            <h1 className="text-2xl font-medium text-red-600 mb-2">Oops! Something went wrong</h1>
            <p className="text-red-500 mb-2">
              If you are using an official production build: the above error is most likely a bug!
              <br />
              Please report this under:
              <a
                className="text-link hover:underline cursor-pointer ml-2"
                href="https://github.com/usebruno/bruno/issues"
                target="_blank"
              >
                https://github.com/usebruno/bruno/issues
              </a>
            </p>

            {shouldShowErrorDetails && this.state.error && (
              <pre className="text-left text-xs text-red-700 bg-red-50 border border-red-100 rounded p-3 mt-4 max-h-40 overflow-auto">
                {this.state.error.message || String(this.state.error)}
                {this.state.errorInfo?.componentStack ? `\n${this.state.errorInfo.componentStack}` : ''}
              </pre>
            )}

            <button
              className="bg-red-500 text-white px-4 py-2 mt-4 rounded hover:bg-red-600 transition"
              onClick={() => this.returnToApp()}
            >
              Return to App
            </button>

            <div className="text-red-500 mt-3">
              <a href="" className="hover:underline cursor-pointer" onClick={this.forceQuit}>
                Force Quit
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
