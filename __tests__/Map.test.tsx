import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Map from '@/components/Map';

// Mock the LanguageContext since the component might be wrapped or used within it
jest.mock('@/components/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', setLanguage: jest.fn() })
}));

// Mock @react-google-maps/api
jest.mock('@react-google-maps/api', () => ({
  useJsApiLoader: jest.fn().mockReturnValue({ isLoaded: true }),
  GoogleMap: ({ children }: { children: React.ReactNode }) => <div data-testid="google-map">{children}</div>,
  Marker: () => <div data-testid="map-marker" />
}));

describe('Map Component', () => {
  let mockGeocode: jest.Mock;

  beforeEach(() => {
    mockGeocode = jest.fn();

    // Mock global google object
    (global as any).window.google = {
      maps: {
        Geocoder: jest.fn().mockImplementation(() => ({
          geocode: mockGeocode
        }))
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (global as any).window.google;
  });

  it('renders the search form correctly', () => {
    render(<Map />);
    expect(screen.getByPlaceholderText(/Enter 6-digit PIN code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  it('shows an error for invalid PIN codes', async () => {
    render(<Map />);
    const input = screen.getByPlaceholderText(/Enter 6-digit PIN code/i);
    const button = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(button);

    expect(await screen.findByText(/Please enter a valid 6-digit Indian PIN code/i)).toBeInTheDocument();
  });

  it('calls the Geocoding API and drops a marker on valid search', async () => {
    mockGeocode.mockResolvedValueOnce({
      results: [
        {
          geometry: {
            location: {
              lat: () => 28.6139,
              lng: () => 77.2090
            }
          }
        }
      ]
    });

    render(<Map />);
    const input = screen.getByPlaceholderText(/Enter 6-digit PIN code/i);
    const button = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: '110001' } });
    fireEvent.click(button);

    expect(screen.getByText(/Searching.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGeocode).toHaveBeenCalledWith({
        address: '110001',
        componentRestrictions: { country: 'IN' }
      });
    });

    expect(await screen.findByTestId('map-marker')).toBeInTheDocument();
  });
});
