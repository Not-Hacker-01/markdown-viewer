import { Component } from 'react';

/**
 * Catches exceptions thrown while rendering Markdown so one pathological
 * document can't crash the whole app. Mount with `key={fileName}` from the
 * parent so a newly loaded file always gets a fresh (untripped) boundary.
 */
export default class RenderErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Markdown rendering failed:', error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
