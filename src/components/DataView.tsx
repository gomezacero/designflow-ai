
import React, { useMemo, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { Task, Designer, Status, Requester } from '../models';
import {
    TrendingUp,
    Users,
    Clock,
    BarChart2,
    PieChart,
    Zap,
    Calendar as CalendarIcon,
} from 'lucide-react';
import { openDatePicker, getDaysInPast, formatDateKey } from '../utils';

interface DataViewProps {
    tasks: Task[];
    designers: Designer[];
    requesters: Requester[];
}

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: LucideIcon;
    color: string;
    bg: string;
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    icon: LucideIcon;
}

type TimeRange = '7d' | '30d' | '90d' | 'all' | 'custom';
type TabView = 'overview' | 'designers' | 'requesters';

export const DataView: React.FC<DataViewProps> = ({ tasks, designers, requesters }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [activeTab, setActiveTab] = useState<TabView>('overview');

    // Custom Date State
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    // --- 1. DATA FILTERING ENGINE ---
    const filteredTasks = useMemo(() => {
        let startLimit = new Date('2020-01-01');
        let endLimit = new Date(); // Today
        endLimit.setHours(23, 59, 59, 999);

        if (timeRange === '7d') startLimit = getDaysInPast(7);
        if (timeRange === '30d') startLimit = getDaysInPast(30);
        if (timeRange === '90d') startLimit = getDaysInPast(90);

        if (timeRange === 'custom') {
            if (customStart) startLimit = new Date(customStart);
            if (customEnd) {
                endLimit = new Date(customEnd);
                endLimit.setHours(23, 59, 59, 999);
            }
        }

        return tasks.filter(t => {
            // Use UTC to avoid timezone issues with YYYY-MM-DD format
            const tDate = new Date(t.requestDate + 'T00:00:00');
            return tDate >= startLimit && tDate <= endLimit;
        });
    }, [tasks, timeRange, customStart, customEnd]);

    // --- 2. KPI CALCULATIONS ---
    const kpis = useMemo(() => {
        const total = filteredTasks.length;
        const completed = filteredTasks.filter(t => t.status === Status.DONE);
        const completedCount = completed.length;

        // Efficiency calculation (Avg days to complete)
        let totalDaysToComplete = 0;
        let countedTasks = 0;

        completed.forEach(t => {
            if (t.completionDate && t.requestDate) {
                const start = new Date(t.requestDate).getTime();
                const end = new Date(t.completionDate).getTime();
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalDaysToComplete += diffDays;
                countedTasks++;
            }
        });

        const avgTurnaround = countedTasks > 0 ? (totalDaysToComplete / countedTasks).toFixed(1) : '0.0';
        const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        // FIX: Velocity (Delivered) should only include DONE tasks
        const totalPoints = completed.reduce((acc, t) => acc + (t.points || 0), 0);

        return { total, completedCount, avgTurnaround, completionRate, totalPoints };
    }, [filteredTasks]);

    // --- 3. CHART DATA GENERATION ---
    const chartData = useMemo(() => {
        // Create a map of dates based on the selected range to ensure X-axis continuity
        const dataMap = new Map<string, { date: string, received: number, completed: number }>();

        // Initialize buckets based on range
        let loopStart = new Date();
        let loopEnd = new Date();

        if (timeRange === 'custom' && customStart && customEnd) {
            loopStart = new Date(customStart);
            loopEnd = new Date(customEnd);
        } else if (timeRange === 'all') {
            // Auto scale for 'all': find min date in filtered tasks or default to 30d
            if (filteredTasks.length > 0) {
                const dates = filteredTasks.map(t => new Date(t.requestDate).getTime());
                loopStart = new Date(Math.min(...dates));
            } else {
                loopStart = getDaysInPast(30);
            }
        } else {
            // Presets
            const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
            loopStart = getDaysInPast(days);
        }

        // Iterate from start to end to create empty buckets
        const cursor = new Date(loopStart);
        // Safety cap to prevent infinite loops if dates are wrong (2 years max)
        let safety = 0;
        while (cursor <= loopEnd && safety < 730) {
            const key = formatDateKey(cursor.toISOString());
            dataMap.set(key, { date: key, received: 0, completed: 0 });
            cursor.setDate(cursor.getDate() + 1);
            safety++;
        }

        // Fill with actual data
        filteredTasks.forEach(t => {
            const key = formatDateKey(t.requestDate);
            // Only add if it falls within our map (handling edge cases)
            if (dataMap.has(key)) {
                const entry = dataMap.get(key)!;
                entry.received += 1;
                dataMap.set(key, entry);
            } else if (timeRange === 'all') {
                // If 'all', we might dynamically add keys, but preserving order is tricky.
                // For simple implementation, we stick to the pre-gen buckets or extend logic.
                // Here we let it slide for simplicity.
            }

            if (t.status === Status.DONE) {
                // Visual choice: Map completion to Request Date (Throughput) or Completion Date (Velocity)
                // Using Request Date here aligns with "Task Flow" visualization of that specific task batch
                if (dataMap.has(key)) {
                    const entry = dataMap.get(key)!;
                    entry.completed += 1;
                }
            }
        });

        return Array.from(dataMap.values());
    }, [filteredTasks, timeRange, customStart, customEnd]);


    // --- 4. DESIGNER PERFORMANCE METRICS ---
    const designerMetrics = useMemo(() => {
        return designers.map(d => {
            const dTasks = filteredTasks.filter(t => t.designer?.id === d.id);
            const done = dTasks.filter(t => t.status === Status.DONE);
            const points = dTasks.reduce((acc, t) => acc + (t.points || 0), 0);

            return {
                ...d,
                tasksAssigned: dTasks.length,
                tasksDone: done.length,
                totalPoints: points,
                efficiency: dTasks.length > 0 ? Math.round((done.length / dTasks.length) * 100) : 0
            };
        }).sort((a, b) => b.totalPoints - a.totalPoints);
    }, [filteredTasks, designers]);

    // --- 5. REQUESTER METRICS ---
    const requesterMetrics = useMemo(() => {
        const map = new Map<string, { total: number, done: number, types: Record<string, number> }>();

        requesters.forEach(r => map.set(r.name, { total: 0, done: 0, types: {} }));

        filteredTasks.forEach(t => {
            if (!map.has(t.requester)) return;
            const entry = map.get(t.requester)!;
            entry.total += 1;
            if (t.status === Status.DONE) entry.done += 1;
            entry.types[t.type] = (entry.types[t.type] || 0) + 1;
        });

        return Array.from(map.entries()).map(([name, data]) => {
            const topType = Object.entries(data.types).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
            return { name, ...data, topType };
        }).sort((a, b) => b.total - a.total);
    }, [filteredTasks, requesters]);


    // --- RENDER HELPERS ---
    const maxChartValue = Math.max(...chartData.map(d => Math.max(d.received, d.completed)), 5);

    return (
        <div className="p-4 md:p-8 space-y-8 w-full h-full overflow-y-auto custom-scrollbar bg-bg-canvas">

            {/* HEADER & CONTROLS */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-1">Analytics Dashboard</h1>
                    <p className="text-sm text-text-secondary">Performance metrics & team velocity.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Custom Date Inputs (Conditional) */}
                    {timeRange === 'custom' && (
                        <div className="flex items-center gap-2 animate-fadeIn">
                            <div className="relative">
                                <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                                <input
                                    type="date"
                                    value={customStart}
                                    onClick={openDatePicker}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="pl-9 pr-3 py-1.5 bg-bg-surface border border-border-default rounded-lg text-xs font-bold text-text-primary shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <span className="text-text-secondary text-xs font-medium">to</span>
                            <div className="relative">
                                <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                                <input
                                    type="date"
                                    value={customEnd}
                                    onClick={openDatePicker}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="pl-9 pr-3 py-1.5 bg-bg-surface border border-border-default rounded-lg text-xs font-bold text-text-primary shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>
                    )}

                    {/* Range Selectors */}
                    <div className="flex bg-bg-surface p-1 rounded-xl shadow-sm border border-border-default">
                        {(['7d', '30d', '90d', 'all', 'custom'] as TimeRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range
                                    ? 'bg-text-primary text-bg-surface shadow-md'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Velocity (Points)"
                    value={kpis.totalPoints}
                    subtitle="Story points delivered"
                    icon={Zap}
                    color="text-amber-500"
                    bg="bg-amber-50 dark:bg-amber-900/20"
                />
                <KpiCard
                    title="Completion Rate"
                    value={`${kpis.completionRate}%`}
                    subtitle={`${kpis.completedCount}/${kpis.total} Tasks`}
                    icon={TrendingUp}
                    color="text-green-500"
                    bg="bg-green-50 dark:bg-green-900/20"
                />
                <KpiCard
                    title="Avg. Turnaround"
                    value={`${kpis.avgTurnaround} Days`}
                    subtitle="Request to Done"
                    icon={Clock}
                    color="text-blue-500"
                    bg="bg-blue-50 dark:bg-blue-900/20"
                />
                <KpiCard
                    title="Active Volume"
                    value={kpis.total}
                    subtitle="Tasks in period"
                    icon={BarChart2}
                    color="text-purple-500"
                    bg="bg-purple-50 dark:bg-purple-900/20"
                />
            </div>

            {/* TABS NAVIGATION */}
            <div className="border-b border-border-default flex gap-6">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" icon={BarChart2} />
                <TabButton active={activeTab === 'designers'} onClick={() => setActiveTab('designers')} label="Designers Performance" icon={Users} />
                <TabButton active={activeTab === 'requesters'} onClick={() => setActiveTab('requesters')} label="Client Demand" icon={PieChart} />
            </div>

            {/* --- TAB CONTENT: OVERVIEW --- */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-slideDown">
                    {/* Main Chart */}
                    <div className="bg-bg-surface p-6 rounded-3xl shadow-sm border border-border-default">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-text-primary">Task Flow</h3>
                                <p className="text-xs text-text-secondary">Incoming Requests vs. Completions over time</p>
                            </div>
                            <div className="flex gap-4 text-xs font-bold">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Received</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400"></div> Completed</div>
                            </div>
                        </div>

                        {/* CSS Chart */}
                        <div className="h-64 flex items-end justify-between gap-2 md:gap-4 overflow-x-auto pb-2 custom-scrollbar">
                            {chartData.length > 0 ? chartData.map((data, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group min-w-[30px]">
                                    <div className="w-full max-w-[40px] flex gap-1 items-end h-full relative">
                                        {/* Received Bar */}
                                        <div
                                            className="w-1/2 bg-blue-500 rounded-t-sm transition-all duration-500 opacity-80 group-hover:opacity-100"
                                            style={{ height: `${maxChartValue > 0 ? (data.received / maxChartValue) * 100 : 0}%` }}
                                        ></div>
                                        {/* Completed Bar */}
                                        <div
                                            className="w-1/2 bg-green-400 rounded-t-sm transition-all duration-500 opacity-80 group-hover:opacity-100"
                                            style={{ height: `${maxChartValue > 0 ? (data.completed / maxChartValue) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium rotate-0 whitespace-nowrap">{data.date}</span>
                                </div>
                            )) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                    No data for selected range
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB CONTENT: DESIGNERS --- */}
            {activeTab === 'designers' && (
                <div className="grid grid-cols-1 gap-4 animate-slideDown">
                    {designerMetrics.map((designer) => (
                        <div key={designer.id} className="bg-bg-surface p-4 md:p-6 rounded-2xl shadow-sm border border-border-default flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow">
                            {/* Avatar & Info */}
                            <div className="flex items-center gap-4 w-full md:w-1/4">
                                {designer.avatar ? (
                                    <img
                                        src={designer.avatar}
                                        alt={designer.name}
                                        className="w-16 h-16 rounded-full bg-bg-canvas object-cover border-2 border-bg-surface shadow-sm"
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}

                                {/* Fallback Initials (Shown if no avatar or on error) */}
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-gray-500 ${designer.avatar ? 'hidden' : ''}`}>
                                    {designer.name.slice(0, 2).toUpperCase()}
                                </div>

                                <div>
                                    <h3 className="font-bold text-text-primary text-lg">{designer.name}</h3>
                                    <p className="text-xs text-text-secondary font-medium">Senior Designer</p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="flex-1 w-full grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-border-default pt-4 md:pt-0 md:pl-6">
                                <div className="text-center md:text-left">
                                    <div className="text-xs text-text-secondary font-bold uppercase">Points</div>
                                    <div className="text-xl font-bold text-text-primary">{designer.totalPoints}</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="text-xs text-text-secondary font-bold uppercase">Assigned</div>
                                    <div className="text-xl font-bold text-text-primary">{designer.tasksAssigned}</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="text-xs text-text-secondary font-bold uppercase">Completed</div>
                                    <div className="text-xl font-bold text-green-600">{designer.tasksDone}</div>
                                </div>
                            </div>

                            {/* Efficiency Bar */}
                            <div className="w-full md:w-1/4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-bold text-gray-500">Completion Rate</span>
                                    <span className="font-bold text-gray-900">{designer.efficiency}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${designer.efficiency > 80 ? 'bg-green-500' : designer.efficiency > 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                                        style={{ width: `${designer.efficiency}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- TAB CONTENT: REQUESTERS --- */}
            {activeTab === 'requesters' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideDown">
                    {requesterMetrics.map(req => (
                        <div key={req.name} className="bg-bg-surface p-6 rounded-2xl shadow-sm border border-border-default relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <PieChart size={60} className="text-blue-500" />
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                    {req.name.substring(0, 2).toUpperCase()}
                                </div>
                                <h3 className="font-bold text-text-primary text-lg">{req.name}</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-border-default pb-2">
                                    <span className="text-sm text-text-secondary">Total Requests</span>
                                    <span className="text-lg font-bold text-text-primary">{req.total}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-border-default pb-2">
                                    <span className="text-sm text-text-secondary">Completed</span>
                                    <span className="text-lg font-bold text-green-600">{req.done}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-text-secondary">Top Category</span>
                                    <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{req.topType}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

// --- SUBCOMPONENTS ---

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon: Icon, color, bg }) => (
    <div className="bg-bg-surface p-5 rounded-2xl shadow-sm border border-border-default flex items-start justify-between hover:shadow-md transition-shadow cursor-default">
        <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-text-primary">{value}</h3>
            <p className="text-xs text-text-secondary mt-1 font-medium">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
            <Icon size={20} />
        </div>
    </div>
);

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${active
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
    >
        <Icon size={16} />
        <span className="hidden md:inline">{label}</span>
    </button>
);
