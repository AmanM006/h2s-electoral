import { render, screen } from '@testing-library/react';
import Timeline from '@/components/Timeline';

// Mock language context
jest.mock('@/components/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en' })
}));

describe('Timeline Component', () => {
  it('renders the roadmap heading correctly', () => {
    render(<Timeline />);
    // The heading text is now "Election Roadmap"
    const heading = screen.getByText(/Election Roadmap/i);
    expect(heading).toBeInTheDocument();
  });

  it('renders all the timeline steps', () => {
    render(<Timeline />);
    const steps = [
      'Voter Registration',
      'Election Announcement',
      'Nomination Filing',
      'Campaigning',
      'Polling Day',
      'Counting & Results'
    ];

    steps.forEach(step => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it('has accessible area', () => {
    render(<Timeline />);
    // We search for the text that labels the area
    const heading = screen.getByText(/Election Roadmap/i);
    expect(heading).toHaveAttribute('id', 'timeline-heading');
  });
});
