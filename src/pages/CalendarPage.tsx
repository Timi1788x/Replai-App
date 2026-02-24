import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const mockReservations = [
    { property: 'Alpine Chalet Zermatt', guest: 'Carlos Mendez', start: 13, end: 17, color: '#FF5A5F' },
    { property: 'Alpine Chalet Zermatt', guest: 'Olga Novikova', start: 22, end: 28, color: '#FF5A5F' },
    { property: 'Lakeside Studio Lucerne', guest: 'James O\'Brien', start: 10, end: 14, color: '#25D366' },
    { property: 'Lakeside Studio Lucerne', guest: 'Priya Sharma', start: 20, end: 25, color: '#25D366' },
    { property: 'City Loft Zurich', guest: 'Liam Johnson', start: 5, end: 9, color: '#4A90D9' },
    { property: 'City Loft Zurich', guest: 'David Kim', start: 15, end: 19, color: '#4A90D9' },
    { property: 'Mountain View Apartment Interlaken', guest: 'Anna Petrova', start: 8, end: 12, color: '#A855F7' },
    { property: 'Mountain View Apartment Interlaken', guest: 'Isabella Rossi', start: 18, end: 24, color: '#A855F7' },
];

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(1); // Feb 2026
    const [currentYear] = useState(2026);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

    const getReservationsForDay = (day: number) =>
        mockReservations.filter((r) => day >= r.start && day <= r.end);

    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                            <CalendarDays size={20} className="text-accent" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">Calendar Overview</h1>
                            <p className="text-xs text-dark-400">Reservation overview for your properties</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentMonth((m) => Math.max(0, m - 1))}
                            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium text-dark-200 w-36 text-center">
                            {months[currentMonth]} {currentYear}
                        </span>
                        <button
                            onClick={() => setCurrentMonth((m) => Math.min(11, m + 1))}
                            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 transition-colors cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Calendar grid */}
                <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 border-b border-dark-800">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-dark-400 py-3">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7">
                        {blanks.map((i) => (
                            <div key={`blank-${i}`} className="min-h-[100px] border-b border-r border-dark-800 bg-dark-900/50" />
                        ))}
                        {days.map((day) => {
                            const reservations = getReservationsForDay(day);
                            const isToday = day === 24 && currentMonth === 1;
                            return (
                                <div
                                    key={day}
                                    className={`min-h-[100px] p-2 border-b border-r border-dark-800 transition-colors hover:bg-dark-800/30
                    ${isToday ? 'bg-accent/5' : ''}`}
                                >
                                    <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full
                    ${isToday ? 'bg-accent text-white' : 'text-dark-300'}`}>
                                        {day}
                                    </span>
                                    <div className="mt-1 space-y-0.5">
                                        {reservations.map((r, i) => (
                                            <div
                                                key={i}
                                                className="text-[9px] font-medium px-1.5 py-0.5 rounded truncate"
                                                style={{ backgroundColor: `${r.color}20`, color: r.color }}
                                                title={`${r.guest} — ${r.property}`}
                                            >
                                                {r.guest.split(' ')[0]}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 px-2">
                    {[...new Set(mockReservations.map((r) => r.property))].map((property) => {
                        const color = mockReservations.find((r) => r.property === property)!.color;
                        return (
                            <div key={property} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                                <span className="text-xs text-dark-400">{property}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
