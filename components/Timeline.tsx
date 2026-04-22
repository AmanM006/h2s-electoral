import React from 'react';

const timelineSteps = [
  {
    title: 'Voter Registration',
    description: 'Citizens register via Form 6. Must be 18+ and an Indian citizen.',
    icon: '📝',
    date: 'Continuous Process'
  },
  {
    title: 'Election Announcement',
    description: 'Election Commission of India (ECI) announces dates and Model Code of Conduct comes into force.',
    icon: '📢',
    date: 'Pre-Election'
  },
  {
    title: 'Nomination Filing',
    description: 'Candidates file nominations and affidavits detailing assets and criminal records.',
    icon: '📁',
    date: 'Phase 1'
  },
  {
    title: 'Campaigning',
    description: 'Parties and candidates campaign. Ends 48 hours before polling.',
    icon: '🗣️',
    date: 'Phase 2'
  },
  {
    title: 'Polling Day',
    description: 'Voters cast their vote using Electronic Voting Machines (EVMs) and VVPATs.',
    icon: '🗳️',
    date: 'Phase 3'
  },
  {
    title: 'Counting & Results',
    description: 'Votes are counted on a scheduled day and results are declared.',
    icon: '📊',
    date: 'Phase 4'
  }
];

export default function Timeline() {
  return (
    <section aria-labelledby="timeline-heading" className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h2 id="timeline-heading" className="text-3xl font-extrabold text-white mb-8 text-center drop-shadow-md">
          Indian Election Process
        </h2>
        <div className="relative border-l-4 border-indigo-500 ml-4 md:ml-0 md:mx-auto">
          {timelineSteps.map((step, index) => (
            <div key={index} className="mb-10 ml-8 group">
              <div className="absolute w-8 h-8 bg-indigo-600 rounded-full -left-[1.15rem] border-4 border-gray-900 flex items-center justify-center text-sm shadow-lg group-hover:scale-125 transition-transform duration-300">
                {step.icon}
              </div>
              <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 hover:border-indigo-500 transition-colors duration-300">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  <span className="text-sm font-semibold text-indigo-400 bg-gray-900 px-3 py-1 rounded-full">{step.date}</span>
                </div>
                <p className="text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
