import React, { useState, useEffect } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';

const Timeline = ({ items: initialItems }) => {
    const [items, setItems] = useState(initialItems);
    const [scale, setScale] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [dragInfo, setDragInfo] = useState(null);

    const dates = items.map(item => [new Date(item.start), new Date(item.end)]).flat();
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const totalDays = differenceInDays(maxDate, minDate);

    const getItemPosition = (startDate) => {
        const days = differenceInDays(new Date(startDate), minDate);
        return (days / totalDays) * 100;
    };

    const handleDragStart = (e, id, type) => {
        setDragInfo({ id, type, startX: e.clientX });
    };

    const handleDrag = (e) => {
        if (!dragInfo) return;

        const deltaX = e.clientX - dragInfo.startX;
        const daysChange = Math.round((deltaX / window.innerWidth) * totalDays);

        setItems(prevItems => prevItems.map(item => {
            if (item.id === dragInfo.id) {
                const newItem = { ...item };
                if (dragInfo.type === 'start') {
                    newItem.start = format(addDays(new Date(item.start), daysChange), 'yyyy-MM-dd');
                } else if (dragInfo.type === 'end') {
                    newItem.end = format(addDays(new Date(item.end), daysChange), 'yyyy-MM-dd');
                }
                return newItem;
            }
            return item;
        }));
    };

    const handleDragEnd = () => {
        setDragInfo(null);
    };

    const handleNameEdit = (id, newName) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, name: newName } : item
            )
        );
        setEditingId(null);
    };

    const handleKeyPress = (e, id, newName) => {
        if (e.key === 'Enter') {
            handleNameEdit(id, newName);
        }
    };

    useEffect(() => {
        if (dragInfo) {
            window.addEventListener('mousemove', handleDrag);
            window.addEventListener('mouseup', handleDragEnd);
        } else {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', handleDragEnd);
        }
        // Cleanup on unmount or drag end
        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [dragInfo]);

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

            <div 
                className="horizontal-timeline" 
                style={{ width: `${Math.max(100 * scale, 100)}%` }}
            >
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
                        <div 
                            className="timeline-drag-handle start"
                            onMouseDown={(e) => handleDragStart(e, item.id, 'start')}
                        />
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <div className="timeline-date">
                                {format(new Date(item.start), 'yyyy')}
                            </div>
                            <div className="timeline-card">
                                {editingId === item.id ? (
                                    <input
                                        type="text"
                                        defaultValue={item.name}
                                        onBlur={(e) => handleNameEdit(item.id, e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(e, item.id, e.target.value)}
                                        autoFocus
                                    />
                                ) : (
                                    <h3 
                                        onClick={() => setEditingId(item.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {item.name}
                                    </h3>
                                )}
                                <p className="timeline-period">
                                    {format(new Date(item.start), 'MMM dd')} - 
                                    {format(new Date(item.end), 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                        <div 
                            className="timeline-drag-handle end"
                            onMouseDown={(e) => handleDragStart(e, item.id, 'end')}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;