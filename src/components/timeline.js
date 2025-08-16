import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';

const Timeline = ({ items }) => {
    const [scale, setScale] = useState(1);

    // Calculate the date range for positioning
    const dates = items.map(item => [new Date(item.start), new Date(item.end)]).flat();
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const totalDays = differenceInDays(maxDate, minDate);

    // Calculate position for each item
    const getItemPosition = (startDate) => {
        const days = differenceInDays(new Date(startDate), minDate);
        return (days / totalDays) * 100;
    };

    return (
        <div className="timeline-container">
            <h1 className="timeline-header">
                <span className="hourglass">⌛</span> 
                TIMELINE 
                <span className="hourglass">⌛</span>
            </h1>
            <div className="timeline-subtitle">Airtable Timeline</div>
            
            <div className="timeline-button">
                <button onClick={() => setScale(scale * 1.2)}>Zoom In</button>
                <button onClick={() => setScale(scale / 1.2)}>Zoom Out</button>
            </div>

            <div className="horizontal-timeline" style={{ width: `${Math.max(100 * scale, 100)}%` }}>
                <div className="timeline-line"></div>
                {items
                    .sort((a, b) => new Date(a.start) - new Date(b.start))
                    .map((item, index) => (
                    <div 
                        key={item.id} 
                        className={`timeline-item ${index % 2 === 0 ? 'top' : 'bottom'}`}
                        style={{ 
                            left: `${getItemPosition(item.start)}%`
                        }}
                    >
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <div className="timeline-date">
                                {format(new Date(item.start), 'yyyy')}
                            </div>
                            <div className="timeline-card">
                                <h3>{item.name}</h3>
                                <p className="timeline-period">
                                    {format(new Date(item.start), 'MMM dd')} - 
                                    {format(new Date(item.end), 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;