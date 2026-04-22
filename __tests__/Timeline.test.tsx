import { render, screen } from '@testing-library/react';
import Timeline from '@/components/Timeline';

describe('Timeline Component', () => {
  it('renders the heading correctly', () => {
    render(<Timeline />);
    const heading = screen.getByRole('heading', { level: 2, name: /Indian Election Process/i });
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

  it('has accessible section', () => {
    render(<Timeline />);
    const section = screen.getByRole('region', { name: /Indian Election Process/i });
    expect(section).toBeInTheDocument();
  });
});
