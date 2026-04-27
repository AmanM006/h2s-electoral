import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Map from '@/components/Map';

// Mock the LanguageContext
jest.mock('@/components/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', setLanguage: jest.fn() })
}));

// Mock @react-google-maps/api
jest.mock('@react-google-maps/api', () => ({
  useJsApiLoader: jest.fn().mockReturnValue({ isLoaded: true }),
  GoogleMap: ({ children, onLoad }: any) => {
    // Simulate map load to trigger marker effect
    useEffect(() => { if (onLoad) onLoad({}); }, []);
    return <div data-testid="google-map">{children}</div>;
  },
  InfoWindow: ({ children }: { children: React.ReactNode }) => <div data-testid="info-window">{children}</div>,
}));

import { useEffect } from 'react';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  MapPin: () => <span data-testid="icon-map-pin" />,
  Clock: () => <span data-testid="icon-clock" />,
  Accessibility: () => <span data-testid="icon-accessibility" />,
  Search: () => <span data-testid="icon-search" />,
  Loader2: () => <span data-testid="icon-loader" />,
}));

describe('Map Component', () => {
  let mockGeocode: jest.Mock;

  beforeEach(() => {
    mockGeocode = jest.fn();

    // Mock global google object for Advanced Markers
    (global as any).window.google = {
      maps: {
        Geocoder: jest.fn().mockImplementation(() => ({
          geocode: mockGeocode
        })),
        marker: {
          AdvancedMarkerElement: jest.fn().mockImplementation(() => ({
            addListener: jest.fn(),
            map: null
          })),
          PinElement: jest.fn().mockImplementation(() => ({
            element: document.createElement('div')
          }))
        }
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (global as any).window.google;
  });

  it('renders the search form correctly', () => {
    render(<Map />);
    // New placeholder is "Enter PIN Code..."
    expect(screen.getByPlaceholderText(/Enter PIN Code/i)).toBeInTheDocument();
    // Button text is now "Search"
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  it('shows an error for invalid PIN codes', async () => {
    render(<Map />);
    const input = screen.getByPlaceholderText(/Enter PIN Code/i);
    const button = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(button);

    expect(await screen.findByText(/Please enter a valid 6-digit PIN/i)).toBeInTheDocument();
  });

  it('calls the Geocoding API on valid search', async () => {
    mockGeocode.mockResolvedValueOnce({
      results: [
        {
          geometry: {
            location: {
              lat: () => 12.9352,
              lng: () => 77.6245
            }
          }
        }
      ]
    });

    render(<Map />);
    const input = screen.getByPlaceholderText(/Enter PIN Code/i);
    const button = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: '560034' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockGeocode).toHaveBeenCalledWith({
        address: '560034',
        componentRestrictions: { country: 'IN' }
      });
    });
  });

  it('generates dynamic mock polling stations on successful search', async () => {
    mockGeocode.mockResolvedValueOnce({
      results: [
        {
          geometry: {
            location: {
              lat: () => 12.9352,
              lng: () => 77.6245
            }
          }
        }
      ]
    });

    render(<Map />);
    const input = screen.getByPlaceholderText(/Enter PIN Code/i);
    const button = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: '560034' } });
    fireEvent.click(button);

    // Wait for geocode to resolve and UI to update
    await waitFor(() => {
      // It should generate either "Govt High School Center", "Community Hall Booth", etc.
      // We can check if at least one of the generic names appears in the glassmorphism list
      const generatedStations = screen.getAllByText(/Govt High School Center|Community Hall Booth|Primary Health Center|Voters Facilitation Club|Booth/i);
      expect(generatedStations.length).toBeGreaterThanOrEqual(1);
    });
  });
});
