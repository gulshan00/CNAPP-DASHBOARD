import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Widget {
  id: number;
  name: string;
  text: string;
}

interface DashboardData {
  [category: string]: Widget[];
}

const widgetLibrary: Record<string, Widget[]> = {
  CSPM: [
    { id: 101, name: 'Cloud Accounts', text: 'Displays the number of connected and unconnected cloud accounts.' },
    { id: 102, name: 'Cloud Account Risk Assessment', text: 'Visualizes account risk based on failed, warning, unavailable, and passed checks.' },
  ],
  CWPP: [
    { id: 201, name: 'Top 5 Namespace Specific Alerts', text: 'Shows the most frequent alerts per namespace.' },
    { id: 202, name: 'Workload Alerts', text: 'Displays alerts related to container workloads.' },
  ],
  Image: [
    { id: 301, name: 'Image Risk Assessment', text: 'Assessment of container image vulnerabilities categorized by severity.' },
    { id: 302, name: 'Image Security Issues', text: 'Summarizes security issues found in container images.' },
  ],
  Ticket: [],
};

const initialData: DashboardData = {
  'CSPM Executive Dashboard': [...widgetLibrary.CSPM],
  'CWPP Dashboard': [...widgetLibrary.CWPP],
  'Registry Scan': [],
};

const getCategoryFromTab = (tab: string) =>
  tab === 'CSPM' ? 'CSPM Executive Dashboard' :
  tab === 'CWPP' ? 'CWPP Dashboard' :
  'Registry Scan';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ff0000'];

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('CSPM');
  const [selectedWidgets, setSelectedWidgets] = useState<Record<number, boolean>>({});
  const [newWidget, setNewWidget] = useState({ name: '', text: '' });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const category = getCategoryFromTab(activeTab);
    const currentWidgets = dashboardData[category];
    const checkedMap: Record<number, boolean> = {};
    currentWidgets.forEach((w) => {
      if (widgetLibrary[activeTab].some((lib) => lib.id === w.id)) {
        checkedMap[w.id] = true;
      }
    });
    setSelectedWidgets(checkedMap);
  }, [activeTab, dashboardData]);

  const handleWidgetToggle = (id: number) => {
    const category = getCategoryFromTab(activeTab);
    const widgetExists = dashboardData[category].some((w) => w.id === id);

    if (widgetExists) {
      setDashboardData((prev) => ({
        ...prev,
        [category]: prev[category].filter((w) => w.id !== id),
      }));
    } else {
      const widgetToAdd = widgetLibrary[activeTab].find((w) => w.id === id);
      if (widgetToAdd) {
        setDashboardData((prev) => ({
          ...prev,
          [category]: [...prev[category], widgetToAdd],
        }));
      }
    }
  };

  const handleConfirmWidgets = () => {
    const category = getCategoryFromTab(activeTab);
    const widgetsToAdd: Widget[] = [];

    if (newWidget.name.trim()) {
      widgetsToAdd.push({ id: Date.now(), name: newWidget.name, text: newWidget.text });
    }

    if (widgetsToAdd.length > 0) {
      setDashboardData((prev) => ({
        ...prev,
        [category]: [...prev[category], ...widgetsToAdd],
      }));
    }

    setNewWidget({ name: '', text: '' });
    setShowSidebar(false);
  };

  const handleRemoveWidget = (category: string, id: number) => {
    setDashboardData((prev) => ({
      ...prev,
      [category]: prev[category].filter((w) => w.id !== id),
    }));
  };

  const filteredWidgets = (category: string) =>
    dashboardData[category]?.filter((w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const renderGraph = (widget: Widget) => {
    const name = widget.name;
    if (name === 'Cloud Accounts') {
      const data = [
        { name: 'Connected', value: 2 },
        { name: 'Not Connected', value: 2 },
      ];
      return (
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie 
              data={data} 
              dataKey="value" 
              cx="50%" 
              cy="50%" 
              outerRadius={50} 
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    if (name === 'Cloud Account Risk Assessment') {
      const data = [
        { name: 'Failed', value: 3659 },
        { name: 'Warning', value: 881 },
        { name: 'Not Available', value: 28 },
        { name: 'Passed', value: 7235 },
      ];
      return (
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie 
              data={data} 
              dataKey="value" 
              cx="50%" 
              cy="50%" 
              outerRadius={50} 
              label={{
                fontSize: 10,
                offset: 10
              }}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    if (name === 'Image Risk Assessment' || name === 'Image Security Issues') {
      const data = [
        { name: 'Critical', value: 10 },
        { name: 'High', value: 5 },
        { name: 'Medium', value: 8 },
        { name: 'Low', value: 3 },
      ];
      return (
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return <p className="text-xs text-gray-600">{widget.text || 'No Graph data available!'}</p>;
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="mr-2 block md:hidden text-gray-500"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">CNAPP Dashboard</h1>
          </div>
          <div className="flex gap-1 sm:gap-2 items-center">
            <input
              type="text"
              placeholder="Search..."
              className="border px-2 py-1 rounded w-24 sm:w-48 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-gray-50 flex items-center"
              onClick={() => setShowSidebar(true)}
            >
              <span className="hidden sm:inline">+ Add Widget</span>
              <span className="sm:hidden">+</span>
            </button>
            <button className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-gray-50">
              <span className="hidden sm:inline">Last 2 days</span>
              <span className="sm:hidden">2d</span> ▼
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed top-14 left-0 right-0 bottom-0 bg-white z-40 p-4 md:hidden overflow-y-auto">
          <div className="space-y-4">
            {Object.keys(dashboardData).map((category) => (
              <div key={category} className="border-b pb-2">
                <h2 className="text-md font-semibold text-gray-700 mb-2">{category}</h2>
                <ul className="space-y-2">
                  {filteredWidgets(category).map((widget) => (
                    <li key={widget.id} className="flex justify-between items-center">
                      <span className="text-sm">{widget.name}</span>
                      <button 
                        className="text-red-500 text-xs"
                        onClick={() => handleRemoveWidget(category, widget.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <button 
              onClick={() => {
                setShowMobileMenu(false);
                setShowSidebar(true);
              }}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm"
            >
              Add Widgets
            </button>
            <button 
              onClick={() => setShowMobileMenu(false)}
              className="w-full border py-2 rounded text-sm"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}

      {/* Widget Sidebar */}
      {showSidebar && (
        <div className="fixed top-0 right-0 w-full sm:w-80 md:w-96 h-full bg-white shadow-lg z-50 transition-all ease-in-out duration-300 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h2 className="font-semibold">Add Widget</h2>
            <button onClick={() => setShowSidebar(false)} className="text-gray-500 hover:text-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Object.keys(widgetLibrary).map((tab) => (
                <button
                  key={tab}
                  className={`text-sm font-medium border-b-2 whitespace-nowrap px-1 py-1 ${
                    tab === activeTab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              <p className="text-sm font-medium text-gray-700">Available Widgets</p>
              {widgetLibrary[activeTab].map((widget) => (
                <label key={widget.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={!!selectedWidgets[widget.id]}
                    onChange={() => handleWidgetToggle(widget.id)}
                  />
                  <div>
                    <span className="font-medium text-sm">{widget.name}</span>
                    <p className="text-xs text-gray-500">{widget.text}</p>
                  </div>
                </label>
              ))}
              {widgetLibrary[activeTab].length === 0 && (
                <p className="text-gray-400 text-sm p-2">No widgets available for this category.</p>
              )}
            </div>

            <div className="space-y-3 border-t pt-3">
              <p className="text-sm font-medium text-gray-700">Custom Widget</p>
              <input
                type="text"
                placeholder="Widget Name"
                className="w-full border px-3 py-2 rounded text-sm"
                value={newWidget.name}
                onChange={(e) => setNewWidget({ ...newWidget, name: e.target.value })}
              />
              <textarea
                placeholder="Widget Description"
                className="w-full border px-3 py-2 rounded text-sm"
                rows={3}
                value={newWidget.text}
                onChange={(e) => setNewWidget({ ...newWidget, text: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button 
                onClick={() => setShowSidebar(false)} 
                className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmWidgets} 
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6 overflow-y-auto">
        {Object.keys(dashboardData).map((category) => (
          <section key={category} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-3 sm:p-4 border-b bg-gray-50">
              <h2 className="text-md sm:text-lg font-semibold text-gray-700">{category}</h2>
            </div>
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredWidgets(category).map((widget) => (
                  <div key={widget.id} className="relative bg-gray-50 shadow-sm rounded p-3 border min-h-[200px] flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-sm">{widget.name}</h3>
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => handleRemoveWidget(category, widget.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-grow">
                      {renderGraph(widget)}
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => setShowSidebar(true)}
                  className="cursor-pointer border-2 border-dashed rounded p-4 flex flex-col items-center justify-center text-sm text-gray-400 min-h-[200px] hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Widget</span>
                </div>
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}