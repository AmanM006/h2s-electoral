import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock dynamically loaded components so they don't try to load Google Maps / YouTube
jest.mock('next/dynamic', () => {
  return function mockDynamic(importFn: () => Promise<any>, _opts?: any) {
    // Return a simple placeholder component
    const componentName = importFn.toString();
    if (componentName.includes('Map')) {
      return function MockMap() {
        return <div data-testid="mock-map">Map Component</div>;
      };
    }
    if (componentName.includes('VideoResources')) {
      return function MockVideos() {
        return <div data-testid="mock-videos">Video Resources</div>;
      };
    }
    return function MockDynamic() {
      return <div data-testid="mock-dynamic">Dynamic Component</div>;
    };
  };
});

// Mock the LanguageContext so LanguageProvider works
jest.mock('@/components/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="language-provider">{children}</div>,
  useLanguage: () => ({ language: 'en', setLanguage: jest.fn() }),
}));

// Mock Chat and Timeline to isolate Home page testing
jest.mock('@/components/Chat', () => {
  return function MockChat() {
    return <div data-testid="mock-chat">Chat Component</div>;
  };
});

jest.mock('@/components/Timeline', () => {
  return function MockTimeline() {
    return <div data-testid="mock-timeline">Timeline Component</div>;
  };
});

jest.mock('@/components/LanguageSelector', () => {
  return function MockSelector() {
    return <div data-testid="mock-lang-selector">Language Selector</div>;
  };
});

jest.mock('@/components/ErrorBoundary', () => {
  return function MockErrorBoundary({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

describe('Home Page', () => {
  it('renders the main "CIVIC COPILOT" branding', () => {
    render(<Home />);
    // There are multiple instances (header and footer), so we check that at least one is present
    const branding = screen.getAllByText(/CIVIC COPILOT/i);
    expect(branding.length).toBeGreaterThan(0);
    expect(branding[0]).toBeInTheDocument();
  });

  it('renders the hero heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Electoral Literacy/i);
  });

  it('renders the descriptive subtitle text', () => {
    render(<Home />);
    expect(
      screen.getByText(/Your interactive guide to the Indian Election Process/i)
    ).toBeInTheDocument();
  });

  it('wraps the application in the LanguageProvider', () => {
    render(<Home />);
    expect(screen.getByTestId('language-provider')).toBeInTheDocument();
  });

  it('renders the main content area with correct id for skip-nav', () => {
    render(<Home />);
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
  });
});
