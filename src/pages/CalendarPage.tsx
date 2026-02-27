import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useReservations } from '../api/useReservations';
import type { ReservationRow } from '../types/database';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Assign a consistent color per property name
const propertyColors = ['#FF5A5F', '#25D366', '#6366F1', '#F59E0B'];
function getPropertyColor(propertyName: string, allProperties: string[]): string {
    const idx = allProperties.indexOf(propertyName);
    return propertyColors[idx % propertyColors.length];
}

export default function CalendarPage() {
    const { data: reservations = [], isLoading } = useReservations();
    const now = new Date();
    const [currentMonth, setCurrentMonth] = useState(now.getMonth());
    const [currentYear, setCurrentYear] = useState(now.getFullYear());

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

    // Unique property names for color assignment
    const allPropertyNames = [...new Set(reservations.map((r) => r.property?.name ?? 'Unknown'))];

    const getReservationsForDay = (day: number): ReservationRow[] => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return reservations.filter((r) => dateStr >= r.check_in && dateStr <= r.check_out);
    };

    const isToday = (day: number) =>
        day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();

    const handlePrev = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    };

    const handleNext = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    };

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
                            <p className="text-xs text-dark-400">
                                {isLoading
                                    ? 'Loading reservations…'
                                    : `${reservations.length} reservations across your properties`
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium text-dark-200 w-36 text-center">
                            {months[currentMonth]} {currentYear}
                        </span>
                        <button
                            onClick={handleNext}
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
                            const dayReservations = getReservationsForDay(day);
                            return (
                                <div
                                    key={day}
                                    className={`min-h-[100px] p-2 border-b border-r border-dark-800 transition-colors hover:bg-dark-800/30
                                        ${isToday(day) ? 'bg-accent/5' : ''}`}
                                >
                                    <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full
                                        ${isToday(day) ? 'bg-accent text-white' : 'text-dark-300'}`}>
                                        {day}
                                    </span>
                                    {dayReservations.slice(0, 2).map((r, i) => {
                                        const propName = r.property?.name ?? 'Unknown';
                                        const color = getPropertyColor(propName, allPropertyNames);
                                        return (
                                            <div
                                                key={i}
                                                className="mt-1 rounded px-1.5 py-0.5 text-[10px] font-medium truncate"
                                                style={{ backgroundColor: color + '25', color }}
                                            >
                                                {r.guest?.display_name?.split(' ')[0] ?? '?'}
                                            </div>
                                        );
                                    })}
                                    {dayReservations.length > 2 && (
                                        <div className="text-[10px] text-dark-400 text-center mt-0.5">
                                            +{dayReservations.length - 2}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                {allPropertyNames.length > 0 ? (
                    <div className="flex flex-wrap gap-4 mt-4 px-2">
                        {allPropertyNames.map((property) => {
                            const color = getPropertyColor(property, allPropertyNames);
                            return (
                                <div key={property} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: color }} />
                                    <span className="text-xs text-dark-400">{property}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : !isLoading ? (
                    <div className="mt-4 px-2 text-center">
                        <p className="text-xs text-dark-500">
                            No reservations yet. They will appear here once synced from your booking channels.
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
