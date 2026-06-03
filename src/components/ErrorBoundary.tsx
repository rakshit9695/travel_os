import { Component, type ReactNode } from 'react';
import { LogoMark } from './Logo';

interface State {
  hasError: boolean;
}

/** Hard rule: no raw error screens, ever. Anything that throws degrades to a
 *  calm, on-brand recovery card. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[voyage] recovered from render error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-canvas p-6 text-center dark:bg-pine-900">
          <div className="card max-w-sm p-8">
            <div className="mx-auto mb-4 w-fit">
              <LogoMark size={48} />
            </div>
            <h1 className="font-display text-xl font-bold">A small hiccup</h1>
            <p className="mt-2 text-sm text-ink-mute">
              Something didn't load quite right. Your trip data is safe — let's reload.
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary mx-auto mt-5">
              Reload Voyage
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
