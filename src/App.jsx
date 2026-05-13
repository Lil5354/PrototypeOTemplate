import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, ChevronDown, ChevronRight, Search, Globe, Bell, User, Clock,
  Briefcase, CheckSquare, LayoutDashboard, Calendar, BarChart2,
  FolderTree, Users, FileText, Settings, Shield, Package,
  MoreHorizontal, Filter, Columns, List, Box, PlayCircle, Plus,
  AlertTriangle, ArrowUp, ArrowDown, AlignLeft,
  UploadCloud, Download, Eye, Edit, Trash2, X, Check, Info, AlertCircle,
  Save, XCircle, FileJson, CheckCircle2, XOctagon, Copy, CalendarDays, Pin,
  Maximize2, Minimize2
} from 'lucide-react';

const TREE_COLUMNS = [
  { id: 'user', label: 'User', width: 'w-24' },
  { id: 'metric', label: 'Metric', width: 'w-24' },
  { id: 'progress', label: 'Progress', width: 'w-28' },
  { id: 'status', label: 'Status', width: 'w-16' },
  { id: 'team', label: 'Team', width: 'w-24' },
  { id: 'timeline', label: 'Timeline', width: 'w-28' },
  { id: 'agg', label: 'Agg', width: 'w-16' },
  { id: 'description', label: 'Description', width: 'w-36' },
];

const DEFAULT_VISIBLE_COLUMNS = ['user', 'metric', 'progress', 'status'];

// --- COMPONENTS ---
// 0. Disclaimer Note Component
const DisclaimerNote = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 mt-4">
      <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
      <p className="text-xs text-amber-700">
        <strong>Lưu ý:</strong> OKR tree này chỉ mang tính chất minh họa, trong thực tế sẽ sử dụng giao diện gốc sẵn có của hệ thống XCORP.
      </p>
    </div>
  );
};

// Column Toggle Component
const ColumnToggle = ({ visibleColumns, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
        title="Toggle columns"
      >
        <Plus size={16} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1 w-40">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">Show Columns</div>
          {TREE_COLUMNS.map(col => (
            <label key={col.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.id)}
                onChange={() => {
                  onToggle(col.id);
                  setIsOpen(false);
                }}
                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600"
              />
              <span>{col.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// 0.1 OKR Tree Preview Component (Reusable)
const OKRTreePreview = ({ 
  treeData, 
  selectedFields = [], 
  showNameColumn = true,
  onNodeClick = null,
  showDisclaimer = true,
  visibleColumns = DEFAULT_VISIBLE_COLUMNS,
  onToggleColumn = null,
  maximizable = false,
  isMaximized = false,
  onMaximizeChange = null
}) => {
  const [collapsedObjectives, setCollapsedObjectives] = useState({});
  const [localMaximized, setLocalMaximized] = useState(false);

  const maximized = onMaximizeChange ? isMaximized : localMaximized;
  const setMaximized = onMaximizeChange || setLocalMaximized;

  const getFieldValue = (node, fieldId) => {
    if (!selectedFields.includes(fieldId)) {
      const defaults = {
        'description': 'Default description',
        'user': 'Unassigned',
        'team': 'Default Team',
        'metric': 'Default Metric',
        'progress_percent': '0%',
        'group': 'Default Group'
      };
      return defaults[fieldId] || '-';
    }
    
    const fieldMap = {
      'description': node.description,
      'user': node.assign || node.user,
      'team': node.team,
      'metric': node.metric,
      'progress_percent': node.progress,
      'group': node.group
    };
    
    return fieldMap[fieldId] || '-';
  };

  const toggleCollapse = (id) => {
    setCollapsedObjectives(prev => ({...prev, [id]: !prev[id]}));
  };

  const renderCell = (node, colId) => {
    switch (colId) {
      case 'user':
        return <span className="truncate">{getFieldValue(node, 'user')}</span>;
      case 'metric':
        return (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${selectedFields.includes('metric') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 italic'}`}>
            {getFieldValue(node, 'metric')}
          </span>
        );
      case 'progress': {
        const pct = selectedFields.includes('progress_percent') ? getFieldValue(node, 'progress_percent') : '0%';
        return (
          <div className="flex items-center justify-center gap-1">
            <div className="w-10 bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full" style={{ width: pct }}></div>
            </div>
            <span className="text-[10px] text-green-600 font-medium">{pct}</span>
          </div>
        );
      }
      case 'status':
        return (
          <>
            {node.status === 'valid' && <CheckCircle2 size={14} className="inline text-green-600" />}
            {node.status === 'warning' && <AlertTriangle size={14} className="inline text-amber-600" />}
            {node.status === 'error' && <XOctagon size={14} className="inline text-red-600" />}
          </>
        );
      case 'team':
        return <span className="truncate">{getFieldValue(node, 'team')}</span>;
      case 'timeline':
        return <span className="truncate">{node.timeline || '-'}</span>;
      case 'agg':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-medium">{node.agg || 'SUM'}</span>;
      case 'description':
        return <span className="truncate">{node.description || '-'}</span>;
      default:
        return null;
    }
  };

  const renderNode = (node, level = 0, objId = null) => {
    const isObjective = node.type === 'objective';
    const hasWarning = node.status === 'warning';
    const hasError = node.status === 'error';
    const isCollapsed = objId && collapsedObjectives[objId];

    return (
      <React.Fragment key={node.id}>
        <div className={`flex items-center border-b border-gray-100 py-1.5 px-2 hover:bg-blue-50/30 transition-colors ${hasWarning ? 'bg-amber-50/40' : hasError ? 'bg-red-50/40' : ''}`}
          style={{ paddingLeft: `${6 + level * 16}px` }}
        >
          <div className="flex items-center gap-1 min-w-0 shrink-0" style={{ width: '160px' }}>
            {isObjective && (
              <button onClick={() => objId && toggleCollapse(objId)} className="p-0.5 hover:bg-gray-200 rounded shrink-0">
                <ChevronRight size={10} className={`text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
              </button>
            )}
            {!isObjective && <div className="w-3 shrink-0"></div>}
            {isObjective ? (
              <Box size={11} className="text-blue-500 shrink-0" />
            ) : (
              <div className="w-1 h-1 rounded-full bg-green-500 shrink-0"></div>
            )}
            <div 
              onClick={() => onNodeClick && onNodeClick(node)}
              className={`text-[11px] font-medium truncate ${onNodeClick ? 'cursor-pointer hover:underline' : ''} ${isObjective ? 'text-blue-600' : 'text-gray-700'}`}
            >
              {node.name}
            </div>
            {(node.warnMsg || node.errorMsg) && <p className="text-[10px] text-amber-600 italic truncate">{node.warnMsg || node.errorMsg}</p>}
          </div>

          <div className="flex items-center gap-2 ml-1">
            {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
              <div key={col.id} className={`${col.width} text-[10px] text-gray-600 text-center shrink-0`}>
                {renderCell(node, col.id)}
              </div>
            ))}
          </div>
        </div>
        {isObjective && !isCollapsed && treeData.krs && treeData.krs.map(kr => renderNode(kr, 1, objId))}
      </React.Fragment>
    );
  };

  const objId = treeData.objective?.id || 'obj-root';

  const treeContent = (
    <div className="flex flex-col h-full min-h-0">
      <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm flex-1 flex flex-col min-h-0">
        <div className="flex items-center bg-gray-50 border-b border-gray-200 py-1 px-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
          <div className="shrink-0" style={{ width: '130px', paddingLeft: '2px' }}>Node</div>
          <div className="flex items-center gap-1 ml-1">
            {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
              <div key={col.id} className={`${col.width} text-center shrink-0`}>{col.label}</div>
            ))}
          </div>
          <div className="ml-auto shrink-0 flex items-center gap-0.5">
            {onToggleColumn && <ColumnToggle visibleColumns={visibleColumns} onToggle={onToggleColumn} />}
            {maximizable && (
              <button onClick={() => setMaximized(!maximized)} className="p-0.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title={maximized ? 'Minimize' : 'Maximize'}>
                {maximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="min-w-[400px]">
            {treeData.objective && renderNode(treeData.objective, 0, objId)}
          </div>
        </div>
      </div>
      {showDisclaimer && <div className="text-[10px] text-gray-400 italic mt-0.5 px-1 shrink-0">OKR preview mang tính minh họa.</div>}
    </div>
  );

  if (maximized) {
    return (
      <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl w-[80vw] h-[80vh] flex flex-col overflow-hidden relative">
            <div className="absolute top-3 right-3 z-20">
              <button onClick={() => setMaximized(false)} className="p-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-100 text-gray-600 transition-colors" title="Close">
                <X size={18} />
              </button>
            </div>
          <div className="flex-1 p-4 pt-12 overflow-hidden">
            {treeContent}
          </div>
        </div>
      </div>
    );
  }

  return treeContent;
};

// 1. Stepper Component
const Stepper = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Upload' },
    { num: 2, label: 'Selection' },
    { num: 3, label: 'Review' }
  ];

  return (
    <div className="flex items-center justify-center w-full py-6 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between w-[60%] max-w-2xl relative">
        {/* Background Lines */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 -z-0 -translate-y-1/2"></div>
        <div 
          className="absolute top-1/2 left-0 h-[2px] bg-blue-600 -z-0 -translate-y-1/2 transition-all duration-300"
          style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
        ></div>

        {steps.map((step, idx) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          return (
            <div key={idx} className="flex flex-col items-center relative z-10 bg-white px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-300 ${
                isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
                isCompleted ? 'bg-green-500 text-white' :
                'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? <Check size={20} strokeWidth={3} /> : step.num}
              </div>
              <span className={`mt-2 text-xs font-medium ${isActive || isCompleted ? 'text-blue-800' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2. Timeline Tree Dropdown Component (Mock)
const timelineTreeBySpace = {
  'Engineering': { '2025': { 'Q4': ['Quarter 4, 2025'], 'Q3': ['Quarter 3, 2025', 'Month 9, 2025'] } },
  'Sales': { '2025': { 'Q4': ['Quarter 4, 2025'], 'Q2': ['Quarter 2, 2025', 'Month 12, 2025'] } },
  'HR': { '2025': { 'Q1': ['Quarter 1, 2025'], 'Q2': ['Quarter 2, 2025', 'Month 6, 2025'] } },
  'Product': { '2025': { 'Q3': ['Quarter 3, 2025', 'Month 9, 2025'] } },
  'Marketing': { '2025': { 'Q4': ['Quarter 4, 2025', 'Month 11, 2025'] } },
  'Finance': { '2025': { 'Q2': ['Quarter 2, 2025'], 'Q3': ['Quarter 3, 2025'] } },
  'Operations': { '2025': { 'Q4': ['Quarter 4, 2025', 'Month 10, 2025'] } },
};

const SpaceDropdown = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const spaces = ['Engineering', 'Sales', 'HR', 'Product', 'Marketing', 'Finance', 'Operations'];

  return (
    <div className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2.5 border rounded-md text-sm flex items-center justify-between cursor-pointer bg-white ${isOpen ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-300'}`}
      >
        <span className={selected ? 'text-gray-800' : 'text-gray-400'}>{selected || 'Select Space...'}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[100] max-h-48 overflow-y-auto custom-scrollbar text-sm py-1">
          {spaces.map(space => (
            <div
              key={space}
              className={`flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer ${selected === space ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
              onClick={() => { onSelect(space); setIsOpen(false); }}
            >
              <Briefcase size={14} className="text-gray-500 mr-2" />
              <span>{space}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TimelineTreeDropdown = ({ selected, onSelect, space }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedQuarters, setExpandedQuarters] = useState({});
  const tree = timelineTreeBySpace[space] || timelineTreeBySpace['Engineering'];

  const toggleYear = (year) => { setExpandedYears(prev => ({...prev, [year]: !prev[year]})); };
  const toggleQuarter = (y, q) => { const key = `${y}-${q}`; setExpandedQuarters(prev => ({...prev, [key]: !prev[key]})); };

  return (
    <div className="relative w-full">
      <div 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) { Object.keys(tree).forEach(y => setExpandedYears(prev => ({...prev, [y]: true}))); } }}
        className={`w-full p-2.5 border rounded-md text-sm flex items-center justify-between cursor-pointer bg-white ${isOpen ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-300'}`}
      >
        <span className={selected ? 'text-gray-800' : 'text-gray-400'}>{selected || 'Select Timeline...'}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[100] max-h-56 overflow-y-auto custom-scrollbar text-sm py-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50 sticky top-0">
            {space} Timelines
          </div>
          {Object.keys(tree).map(year => {
            // Get first quarter's first period as year-level selection
            const firstQuarter = Object.keys(tree[year])[0];
            const yearPeriod = tree[year][firstQuarter]?.find(p => p.startsWith('Quarter'));
            
            return (
            <div key={year}>
              <div 
                className={`flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${selected?.includes(year) ? 'bg-gray-50' : ''}`}
                onClick={() => {
                  toggleYear(year);
                  if (yearPeriod) {
                    onSelect(yearPeriod);
                    setIsOpen(false);
                  }
                }}
              >
                <ChevronRight size={14} className={`text-gray-400 mr-1.5 transition-transform ${expandedYears[year] ? 'rotate-90' : ''}`} />
                <CalendarDays size={14} className="text-gray-500 mr-2" />
                <span className="font-medium text-gray-700">{year}</span>
              </div>
              {expandedYears[year] && Object.keys(tree[year]).map(quarter => {
                const quarterPeriod = tree[year][quarter].find(p => p.startsWith('Quarter'));
                return (
                <div key={quarter}>
                  <div 
                    className={`flex items-center pl-8 pr-3 py-1.5 hover:bg-blue-50 cursor-pointer ${selected === quarterPeriod ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
                    onClick={() => {
                      toggleQuarter(year, quarter);
                      if (quarterPeriod) {
                        onSelect(quarterPeriod);
                        setIsOpen(false);
                      }
                    }}
                  >
                    <ChevronRight size={14} className={`text-gray-400 mr-1.5 transition-transform ${expandedQuarters[`${year}-${quarter}`] ? 'rotate-90' : ''}`} />
                    <CalendarDays size={14} className="text-gray-400 mr-2" />
                    <span className="text-gray-600 text-xs">{quarter === 'Q1' ? 'Quarter 1' : quarter === 'Q2' ? 'Quarter 2' : quarter === 'Q3' ? 'Quarter 3' : 'Quarter 4'}</span>
                  </div>
                  {expandedQuarters[`${year}-${quarter}`] && tree[year][quarter].filter(p => !p.startsWith('Quarter')).map(period => (
                    <div
                      key={period}
                      className={`flex items-center pl-14 pr-3 py-1.5 hover:bg-blue-50 cursor-pointer text-sm ${selected === period ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                      onClick={(e) => { 
                        e.stopPropagation();
                        onSelect(period); 
                        setIsOpen(false); 
                      }}
                    >
                      <CalendarDays size={14} className="text-gray-400 mr-2" />
                      <span>{period.includes('Month') ? period : period.replace(', 2025', '')}</span>
                    </div>
                  ))}
                </div>
                );
              })}
            </div>
            );
          })}
          <div className="border-t border-gray-100 p-2 mt-1">
            <button className="text-blue-600 text-xs hover:underline w-full text-left px-2">Manage Timeline</button>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [activeView, setActiveView] = useState('okr-dashboard');
  
  // --- STATE DATA OKR BOARD ---
  const engData = [
    { id: 1, level: 0, name: 'WD-V2-1 Work Discipline', subtitle: 'Work Discipline', user: null, metric: 'Score\nAVG(Score)', mName: 'Score', mKey: 'SCORE', mUnit: 'Score', agg: 'AVG', resultS: '0', resultC: '5.75', progress: 57.5, risk: 'high', tl: 4, isExpanded: true },
    { id: 2, level: 1, name: 'WD-V2-2 Attendance Days', subtitle: 'Total attendance days', user: null, metric: 'Attendance Days\nAVG(day)', mName: 'Attendance Days', mKey: 'ATTENDANCE-D...', mUnit: 'day', agg: 'AVG', resultS: '0', resultC: '7.8', progress: 42.7, risk: 'high', tl: 2, isExpanded: true },
    { id: 3, level: 2, name: 'WD V2 3 Attendance Days - Project...', user: 'CP', group: 'CP', metric: 'Attendance Days\nAVG(day)', mName: 'Attendance Days', mKey: 'ATTENDANCE-D...', mUnit: 'day', agg: 'AVG', resultS: '0', resultC: '8.25', progress: 40.8, risk: 'high', tl: 2 },
    { id: 4, level: 3, name: 'WD-V2-4 Attendance Days - Team...', user: null, team: '[OKR-CP]', assignTo: '[OKR-CP]', metric: 'Attendance Days\nAVG(day)', mName: 'Attendance Days', mKey: 'ATTENDANCE-D...', mUnit: 'day', agg: 'AVG', resultS: '0', resultC: '7.65', progress: 37.7, risk: 'high', tl: 1 },
    { id: 5, level: 4, name: 'WD-V2-5 Attendance Days - ...', user: 'Duc Le', assignTo: 'Duc Le', metric: 'Attendance Days\nSUM(day)', mName: 'Attendance Days', mKey: 'ATTENDANCE-D...', mUnit: 'day', agg: 'SUM', resultS: '0', resultC: '2.01', progress: 4.79, risk: 'high', tl: 1 },
    { id: 6, level: 4, name: 'WD-V2-6 Attendance Days - ...', user: 'Ngan Vu', assignTo: 'Ngan Vu', metric: 'Attendance Days\nSUM(day)', mName: 'Attendance Days', mKey: 'ATTENDANCE-D...', mUnit: 'day', agg: 'SUM', resultS: '0', resultC: '17.5', progress: 41.7, risk: 'high', tl: 1 },
    { id: 7, level: 4, name: 'WD-V2-7 Attendance Days - ...', user: 'Duy Nguyen', assignTo: 'Duy Nguyen', metric: 'Attendance Days\nSUM(day)', mName: 'Attendance Days', mKey: 'ATTENDANCE-D...', mUnit: 'day', agg: 'SUM', resultS: '0', resultC: '21.3', progress: 51.2, risk: 'high', tl: 1 },
  ];
  const engQ3Data = [
    { id: 101, level: 0, name: 'Platform Reliability Q3', subtitle: 'Improve system stability', user: null, metric: 'Uptime\nAVG(%)', mName: 'Uptime', mKey: 'UPTIME-Q3', mUnit: '%', agg: 'AVG', resultS: '0', resultC: '94.2', progress: 94.2, risk: 'low', tl: 3 },
    { id: 102, level: 1, name: 'Reduce P1 Incidents', subtitle: 'Target <5 P1 per quarter', user: 'Minh Nguyen', metric: 'Incidents\nSUM(count)', mName: 'P1 Count', mKey: 'P1-Q3', mUnit: 'count', agg: 'SUM', resultS: '0', resultC: '3', progress: 70, risk: 'low', tl: 2 },
    { id: 103, level: 2, name: 'Auto-scaling Implementation', subtitle: 'Deploy auto-scaling for all services', user: 'Huy Dinh', metric: 'Services\nSUM(count)', mName: 'Services', mKey: 'AUTO-SCALE', mUnit: 'count', agg: 'SUM', resultS: '0', resultC: '12', progress: 60, risk: 'medium', tl: 1 },
  ];
  const hrData = [
    { id: 201, level: 0, name: 'HR-Q4 Talent Acquisition', subtitle: 'Hire top talent for Q4', user: null, metric: 'Hires\nSUM(count)', mName: 'Hires', mKey: 'HIRE-Q4', mUnit: 'count', agg: 'SUM', resultS: '0', resultC: '45', progress: 75, risk: 'low', tl: 3 },
    { id: 202, level: 1, name: 'Engineering Recruitment', subtitle: 'Fill 20 engineering roles', user: 'Hoa Pham', metric: 'Roles filled\nSUM(count)', mName: 'Roles', mKey: 'ENG-REC', mUnit: 'count', agg: 'SUM', resultS: '0', resultC: '15', progress: 75, risk: 'low', tl: 2 },
    { id: 203, level: 2, name: 'Senior Backend Engineers', subtitle: 'Hire 5 senior backend engineers', user: 'Lan Nguyen', metric: 'Hires\nSUM(count)', mName: 'Senior BE', mKey: 'SR-BE', mUnit: 'count', agg: 'SUM', resultS: '0', resultC: '3', progress: 60, risk: 'medium', tl: 1 },
  ];

  const [selectedSpace, setSelectedSpace] = useState('Engineering');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedPeriod, setSelectedPeriod] = useState('Quarter 4, 2025');

  const initOkrDataMap = (spaces, treeMap) => {
    const map = {};
    spaces.forEach(space => {
      const tree = treeMap[space];
      Object.keys(tree).forEach(year => {
        Object.keys(tree[year]).forEach(quarter => {
          tree[year][quarter].forEach(period => {
            const key = `${space}|${year}|${period}`;
            if (space === 'Engineering' && period === 'Quarter 4, 2025') map[key] = engData;
            else if (space === 'Engineering' && period === 'Quarter 3, 2025') map[key] = engQ3Data;
            else if (space === 'HR' && period === 'Quarter 4, 2025') map[key] = hrData;
            else map[key] = [];
          });
        });
      });
    });
    return map;
  };
  const allSpaces = ['Engineering', 'Sales', 'HR', 'Product', 'Marketing', 'Finance', 'Operations'];
  const initialOkrData = initOkrDataMap(allSpaces, timelineTreeBySpace);

  const [okrDataMap, setOkrDataMap] = useState(initialOkrData);

  const currentContext = { timeline: selectedPeriod, space: selectedSpace };
  const tableData = okrDataMap[`${selectedSpace}|${selectedYear}|${selectedPeriod}`] || [];

  useEffect(() => {
    const spaceTree = timelineTreeBySpace[selectedSpace];
    if (spaceTree) {
      const years = Object.keys(spaceTree);
      if (years.length > 0) {
        const year = years[0];
        const quarters = Object.keys(spaceTree[year]);
        if (quarters.length > 0) {
          const q = quarters[0];
          const periods = spaceTree[year][q];
          if (periods.length > 0 && !periods.includes(selectedPeriod)) {
            setSelectedPeriod(periods[0]);
          }
        }
      }
    }
  }, [selectedSpace]);

  const metricsData = [
    { title: 'All Metrics', value: '', isSummary: true },
    { title: 'Attendance Days (day)', type: 'AVG', value: '7.8', change: '42.7%', changeType: 'down', start: '0', expected: '18.3', color: 'text-orange-500' },
    { title: 'Attendance Days (day)', type: 'SUM', value: '1.04K', change: '47.3%', changeType: 'down', start: '0', expected: '2.19K', color: 'text-blue-500' },
    { title: 'Check-in Non-Complia... (%)', type: 'AVG', value: '31.1', change: '-55.5%', changeType: 'up', start: '20', expected: '0', color: 'text-orange-500' },
    { title: 'Check-in Non-Complia... (%)', type: 'SUM', value: '4.4K', change: '-66.8%', changeType: 'up', start: '2.64K', expected: '0', color: 'text-blue-500' },
  ];

  // --- MOCK DATA CÂY OKR ---
  const sampleTreeData = [
    {
      id: 'O1', type: 'objective', name: 'Increase Enterprise Revenue to $10M', description: 'Drive Q3 revenue growth focusing on Tier 1 clients', user: 'Duc Le', group: 'Sales', team: 'Global Sales', metric: 'Revenue', agg: 'SUM',
      children: [
        { id: 'KR1.1', type: 'kr', name: 'Achieve $5M ARR in US Market', description: 'Target top 100 Fortune companies', user: 'Ngan Vu', group: 'Sales', team: 'US Sales', metric: 'Revenue', agg: 'SUM', progress: '75%', timeline: 'Q3 2025' },
        { id: 'KR1.2', type: 'kr', name: 'Close 50 Enterprise deals globally', description: 'Avg deal size > $100k', user: 'Duy Nguyen', group: 'Sales', team: 'Global Sales', metric: 'Deals', agg: 'COUNT', progress: '60%', timeline: 'Q3 2025' },
        { id: 'KR1.3', type: 'kr', name: 'Reduce enterprise churn rate to < 5%', description: 'Proactive CS tracking', user: 'Hoa Pham', group: 'CS', team: 'Retention', metric: 'Churn', agg: 'AVG', progress: '30%', timeline: 'Q3 2025' }
      ]
    },
    {
      id: 'O2', type: 'objective', name: 'Launch New V2 Platform Infrastructure', description: 'Complete rebuild of core engine for 10x scalability', user: 'Minh Nguyen', group: 'Engineering', team: 'Core Platform', metric: 'Milestone', agg: 'AVG',
      children: [
        { id: 'KR2.1', type: 'kr', name: 'Release Beta to 1000 users', description: 'Ensure crash-free rate > 99%', user: 'Dat Tran', group: 'Product', team: 'Alpha/Beta', metric: 'Users', agg: 'COUNT', progress: '100%', timeline: 'Jul 2025' },
        { id: 'KR2.2', type: 'kr', name: 'Achieve 99.99% system uptime', description: 'Implement auto-scaling groups', user: 'Huy Dinh', group: 'Engineering', team: 'DevOps', metric: 'Uptime', agg: 'AVG', progress: '99%', timeline: 'Q3 2025' }
      ]
    }
  ];

  const [templateList, setTemplateList] = useState([
    { id: 1, title: 'HR Performance Template', desc: 'Standard template for HR team performance tracking', tags: ['HR', 'Performance'], creator: 'Duc Le', date: '2025-05-08', tree: JSON.parse(JSON.stringify(sampleTreeData)) },
    { id: 2, title: 'Engineering Sprint Template', desc: '', tags: [], creator: 'Minh Nguyen', date: '2025-05-07', tree: JSON.parse(JSON.stringify(sampleTreeData)) }, 
    { id: 3, title: 'Product Quality Template', desc: 'Template for product quality and user satisfaction', tags: ['Product', 'Quality', 'UX'], creator: 'Hoa Pham', date: '2025-05-06', tree: JSON.parse(JSON.stringify(sampleTreeData)) },
  ]);

  const previewTreeData = {
    objective: { id: 'O1', type: 'objective', name: 'Increase Enterprise Revenue to $10M', description: 'Drive Q3 revenue growth focusing on Tier 1 clients', user: 'Duc Le', group: 'Sales', team: 'Global Sales', metric: 'Revenue', agg: 'SUM' },
    krs: [
      { id: 'KR1.1', type: 'kr', name: 'Achieve $5M ARR in US Market', description: 'Target top 100 Fortune companies', user: 'Ngan Vu', group: 'Sales', team: 'US Sales', metric: 'Revenue', agg: 'SUM', progress: '75', timeline: 'Q3 2025' },
      { id: 'KR1.2', type: 'kr', name: 'Close 50 Enterprise deals globally', description: 'Avg deal size > $100k', user: 'Duy Nguyen', group: 'Sales', team: 'Global Sales', metric: 'Deals', agg: 'COUNT', progress: '60', timeline: 'Q3 2025' }
    ]
  };

  const availableFields = [
    { id: 'name', label: 'name', type: 'string', desc: 'OKR title / name shown in dashboard', locked: true }, 
    { id: 'description', label: 'description', type: 'string', desc: 'Optional text description for the OKR node' },
    { id: 'user', label: 'user', type: 'string', desc: 'Owner of this OKR node' },
    { id: 'group', label: 'group', type: 'string', desc: 'Organizational group for this OKR' },
    { id: 'team', label: 'team', type: 'string', desc: 'Assigned team' },
    { id: 'metric', label: 'metric', type: 'string', desc: 'Measurement metric' },
    { id: 'progress_percent', label: 'progress_percent', type: 'number', desc: 'Completion percentage, computed by system' },
  ];

  // --- STATES CHUNG ---
  const [confirmCloseTarget, setConfirmCloseTarget] = useState(null);
  const [titleDupTarget, setTitleDupTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success', 'error', 'warning', 'info'

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- STATES FLOW A & B ---
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveStep, setSaveStep] = useState(1);
  const [formData, setFormData] = useState({ title: '', description: '', domain: '', tags: '' });
  const [formErrors, setFormErrors] = useState({});
  const [selectedFields, setSelectedFields] = useState(availableFields.map(f => f.id));
  const [savePreviewVisibleColumns, setSavePreviewVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);
  const [previewCollapsed, setPreviewCollapsed] = useState({});
  const [previewMaximized, setPreviewMaximized] = useState(false);
  const [importValidationCollapsed, setImportValidationCollapsed] = useState({});
  const [importValidationMaximized, setImportValidationMaximized] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [addSelectedFields, setAddSelectedFields] = useState(['name']);
  const [addPreviewVisibleColumns, setAddPreviewVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);

  // --- STATES FLOW C & FLOW C' ---
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [viewTreeVisibleColumns, setViewTreeVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);
  const [viewCollapsedObjs, setViewCollapsedObjs] = useState({});
  const [nodeDetailConfig, setNodeDetailConfig] = useState({ isOpen: false, mode: 'view', data: null, path: [] }); 
  const [editingNodeData, setEditingNodeData] = useState(null);
  
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [selectedSpaceForUse, setSelectedSpaceForUse] = useState('Engineering');
  const [selectedTimelineForUse, setSelectedTimelineForUse] = useState('Quarter 3, 2025');

  const [editTargetId, setEditTargetId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', desc: '', tags: '' });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editTreeData, setEditTreeData] = useState([]);

  // --- STATES FLOW D ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [importFileStatus, setImportFileStatus] = useState('idle'); 
  const [importReviewTab, setImportReviewTab] = useState('all'); 
  const [importSelectedFields, setImportSelectedFields] = useState(availableFields.map(f => f.id)); 
  const [importFormData, setImportFormData] = useState({ title: '', desc: '', tags: '' });
  const [importFormErrors, setImportFormErrors] = useState({});
  const [importTreeVisibleColumns, setImportTreeVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);
  const [importValidationVisibleColumns, setImportValidationVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);
  const fileInputRef = useRef(null);

  // --- STATES FLOW E ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStep, setExportStep] = useState(1);
  const [exportSelectedTemplates, setExportSelectedTemplates] = useState([]);
  const [exportSelectedFields, setExportSelectedFields] = useState([]); 

  const todayDateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const exportFileName = `okr_templates_export_${todayDateStr}.json`;

  const mockImportParsedTree = {
    fileName: 'okr_templates_export_1778398690185.json',
    size: '0.83 KB',
    title: 'Imported Product Launch Template',
    desc: 'Extracted from JSON file',
    objective: { id: 'OBJ-01', name: 'Nâng cao kỷ luật làm việc', description: 'Q3 2025 - Operations - 2 KRs', status: 'valid', type: 'objective', assign: 'Tuan Ha' },
    krs: [
      { id: 'OBJ-01-dup', name: 'Nâng cao kỷ luật làm việc', description: 'Q3 2025 - Engineering - 2 KRs', assign: 'Tuan Pham', metric: 'Users', agg: 'COUNT', team: 'Growth', progress: '0%', timeline: 'Dec 2025', status: 'warning', warnMsg: "Warning: Duplicate 'name' detected - identical to first OBJ-01", type: 'kr' },
      { id: 'OBJ-02', name: 'Tăng hiệu suất nhóm Dev', description: 'Q2 2025 - No Team - 2 KRs', assign: 'Khoa Dang', metric: 'Revenue', agg: 'SUM', team: '', progress: '0%', timeline: 'Dec 2025', status: 'error', errorMsg: "Error: Missing required field 'team'", type: 'kr' },
      { id: 'OBJ-03', name: 'Cải thiện chất lượng sản phẩm', description: 'Default description', assign: 'Unassigned', metric: 'Partners', agg: 'COUNT', team: 'Design', progress: '0%', timeline: 'Nov 2025', status: 'valid', type: 'kr' }
    ],
    stats: { total: 12, obj: 4, kr: 8, assignee: 5, valid: 8, warning: 2, error: 2 }
  };

  const mapTreeToTable = (treeArray) => {
    let result = [];
    let counter = Date.now();
    treeArray.forEach(obj => {
       result.push({
         id: counter++, level: 0, name: obj.name, subtitle: obj.description,
         user: obj.user, group: obj.group, team: obj.team, assignTo: obj.team,
         metric: obj.metric, agg: obj.agg, progress: 0, risk: 'high', tl: 1, isExpanded: true
       });
       if(obj.children) {
         obj.children.forEach(kr => {
           result.push({
             id: counter++, level: 1, name: kr.name, subtitle: kr.description,
             user: kr.user, group: kr.group, team: kr.team, assignTo: kr.team,
             metric: kr.metric, agg: kr.agg, progress: parseInt(kr.progress) || 0, risk: 'high', tl: 1
           });
         });
       }
    });
    return result;
  };

  // --- HANDLERS: FLOW A (SAVE AS TEMPLATE) ---
  const handleOpenSaveModal = () => {
    setIsTemplateDropdownOpen(false);
    if (tableData.length === 0) {
      triggerToast('No OKR data to save. Please create OKR first.', 'error');
      return;
    }
    setIsSaveModalOpen(true);
    setSaveStep(1);
    setFormData({ title: '', description: '', domain: '', tags: '' });
    setFormErrors({});
    setSelectedFields(availableFields.map(f => f.id)); 
    setSavePreviewVisibleColumns([...DEFAULT_VISIBLE_COLUMNS]);
  };

  const handleNextSaveStep = () => {
    if (saveStep === 1) {
      if (!formData.title.trim()) {
        setFormErrors({ title: 'Please enter template name.' });
        return;
      }
      if (formData.title.length > 120) {
        setFormErrors({ title: 'Template name max 120 characters.' });
        return;
      }
      setFormErrors({});
    }
    setSaveStep(prev => Math.min(prev + 1, 3));
  };

  const toggleSaveField = (fieldId) => {
    if (fieldId === 'name') return;
    setSelectedFields(prev => prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]);
  };

  const handleSaveFinal = () => {
    try {
    const newTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    if(formData.domain) newTags.unshift(formData.domain);

    let finalTitle = formData.title;
    if (templateList.some(t => t.title === finalTitle)) {
      if (!titleDupTarget) {
        setTitleDupTarget(finalTitle);
        return;
      }
      finalTitle = `${finalTitle}_(1)`;
    }
    const newTemplate = {
      id: Date.now(),
      title: finalTitle,
      desc: formData.description,
      tags: newTags,
      creator: 'Current User',
      date: new Date().toISOString().split('T')[0],
      tree: JSON.parse(JSON.stringify(sampleTreeData))
    };

    setTemplateList([newTemplate, ...templateList]);
    setIsSaveModalOpen(false);
    setConfirmCloseTarget(null);
    setTitleDupTarget(null);
    triggerToast('Template saved successfully.');
    setActiveView('okr-template');
    } catch (err) {
      triggerToast('An error occurred while saving. Please try again.', 'error');
    }
  };

  // --- HANDLERS: FLOW B (ADD TEMPLATE) ---
  const handleOpenAddModal = () => {
    setIsTemplateDropdownOpen(false);
    setIsAddModalOpen(true);
    setAddStep(1);
    setSelectedTemplateId(null);
    setAddSearchQuery('');
    setAddSelectedFields(['name']); 
    setAddPreviewVisibleColumns([...DEFAULT_VISIBLE_COLUMNS]);
  };

  const handleNextAddStep = () => {
    if (addStep === 1 && !selectedTemplateId) return;
    setAddStep(prev => Math.min(prev + 1, 3));
  };

  const toggleAddField = (fieldId) => {
    if (fieldId === 'name') return;
    setAddSelectedFields(prev => prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]);
  };

  const toggleAddPreviewColumn = (colId) => {
    setAddPreviewVisibleColumns(prev => prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]);
  };

  const toggleSavePreviewColumn = (colId) => {
    setSavePreviewVisibleColumns(prev => prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]);
  };

  const handleApplyTemplate = () => {
    try {
    setIsAddModalOpen(false);
    setConfirmCloseTarget(null);
    const t = templateList.find(x => x.id === selectedTemplateId);
    if (!t) { triggerToast('Template no longer exists.', 'error'); setIsAddModalOpen(true); return; }
    executeApplyToBoard(t ? t.tree : sampleTreeData, selectedPeriod, selectedSpace);
    } catch (err) { triggerToast('Apply failed. Please try again.', 'error'); }
  };

  const executeApplyToBoard = (treeArray, targetPeriod, targetSpace) => {
    const newData = mapTreeToTable(treeArray);
    const targetKey = `${targetSpace}|2025|${targetPeriod}`;

    setOkrDataMap(prev => {
      const existing = prev[targetKey] || [];
      const merged = [...existing];
      const existingNames = new Set(existing.map(r => r.name));
      newData.forEach(row => {
        if (!existingNames.has(row.name)) {
          merged.push({ ...row, id: Date.now() + Math.random() });
        }
      });
      return { ...prev, [targetKey]: merged };
    });

    setSelectedSpace(targetSpace);
    setSelectedYear('2025');
    setSelectedPeriod(targetPeriod);
    setActiveView('okr-dashboard');
    const added = newData.length;
    triggerToast(`Template applied to ${targetSpace} - ${targetPeriod}. ${added} nodes added.`);
  }

  const filteredTemplates = templateList.filter(t => 
    t.title.toLowerCase().includes(addSearchQuery.toLowerCase()) || 
    t.tags.some(tag => tag.toLowerCase().includes(addSearchQuery.toLowerCase()))
  );
  
  const selectedTemplateData = templateList.find(t => t.id === selectedTemplateId);

  // --- HANDLERS: FLOW C & C' ---
  const openDeleteConfirm = (template) => setDeleteTarget(template);
  const confirmDelete = () => {
    setTemplateList(templateList.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);
    triggerToast('Template deleted.');
  };

  const handleViewClick = (template) => { setViewTarget(template); setViewTreeVisibleColumns([...DEFAULT_VISIBLE_COLUMNS]); setViewCollapsedObjs({}); };

  const toggleViewTreeColumn = (colId) => {
    setViewTreeVisibleColumns(prev => prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]);
  };
  const closeViewModal = () => {
    setViewTarget(null);
    setNodeDetailConfig({ isOpen: false, mode: 'view', data: null, path: [] });
    setViewCollapsedObjs({});
  };
  
  const openNodeDetail = (nodeData, mode, path = []) => {
    setEditingNodeData({...nodeData});
    setNodeDetailConfig({ isOpen: true, mode, data: nodeData, path });
  };
  const closeNodeDetail = () => {
    setNodeDetailConfig({ isOpen: false, mode: 'view', data: null, path: [] });
    setEditingNodeData(null);
  };

  const handleOpenTimelineSelection = () => setIsTimelineModalOpen(true);
  const handleConfirmUseTemplate = () => {
    if(!selectedSpaceForUse) {
       triggerToast('Please select Space to continue.', 'warning');
       return;
    }
    if(!selectedTimelineForUse) {
       triggerToast('Please select Timeline to continue.', 'warning');
       return;
    }
    executeApplyToBoard(viewTarget.tree, selectedTimelineForUse, selectedSpaceForUse);
    setIsTimelineModalOpen(false);
    closeViewModal();
  };

  const handleEditClick = (template) => {
    setEditTargetId(template.id);
    setEditFormData({ title: template.title, desc: template.desc, tags: template.tags.join(', ') });
    setEditTreeData(JSON.parse(JSON.stringify(template.tree))); 
    setEditFormErrors({});
  };
  const closeEditModal = () => {
    setEditTargetId(null);
    closeNodeDetail();
  };

  const handleEditTreeAction = (action, objIndex, krIndex = null, path = null) => {
    let newTree = [...editTreeData];
    
    if (action === 'add-obj') {
      newTree.push({
        id: `O-NEW-${Date.now()}`, 
        type: 'objective', 
        name: 'New Objective', 
        description: '', 
        user: '', 
        group: '', 
        team: '', 
        metric: '', 
        agg: 'SUM',
        level: 1,
        children: [{ 
          id: `KR-NEW-${Date.now()}`, 
          type: 'kr', 
          name: 'New Key Result', 
          description: '', 
          user: '', 
          group: '', 
          team: '', 
          metric: '', 
          agg: 'SUM', 
          progress: '0%', 
          timeline: '',
          level: 2,
          children: []
        }]
      });
      setEditTreeData(newTree);
    }
    else if (action === 'add-kr') {
      newTree[objIndex].children.push({ 
        id: `KR-NEW-${Date.now()}`, 
        type: 'kr', 
        name: 'New Key Result', 
        description: '', 
        user: '', 
        group: '', 
        team: '', 
        metric: '', 
        agg: 'SUM', 
        progress: '0%', 
        timeline: '',
        level: 2,
        children: []
      });
      setEditTreeData(newTree);
    }
    else if (action === 'add-child') {
      // Add child to nested node (support up to 4 levels)
      if (!path || path.length === 0) return;
      
      let targetNode = newTree[path[0]];
      for (let i = 1; i < path.length; i++) {
        targetNode = targetNode.children[path[i]];
      }
      
      // Calculate level from path:
      // Path [0] = Level 1 (Objective)
      // Path [0, 0] = Level 2 (KR)
      // Path [0, 0, 0] = Level 3
      // Path [0, 0, 0, 0] = Level 4
      const currentNodeLevel = path.length;
      const newChildLevel = currentNodeLevel + 1;
      
      // Validate max depth (4 levels) - only alert when trying to create level 5
      if (newChildLevel > 4) {
        alert('Maximum depth reached!');
        return;
      }
      
      if (!targetNode.children) {
        targetNode.children = [];
      }
      
      targetNode.children.push({
        id: `NODE-NEW-${Date.now()}`,
        type: 'kr',
        name: `New Node Level ${newChildLevel}`,
        description: '',
        user: '',
        group: '',
        team: '',
        metric: '',
        agg: 'SUM',
        progress: '0%',
        timeline: '',
        level: newChildLevel,
        children: []
      });
      
      setEditTreeData(newTree);
    }
    else if (action === 'delete-obj') {
      if (newTree[objIndex].children && newTree[objIndex].children.length > 0) {
         if(!window.confirm(`Are you sure you want to delete this Objective and ${newTree[objIndex].children.length} child KRs?`)) return;
      }
      newTree.splice(objIndex, 1);
      setEditTreeData(newTree);
    }
    else if (action === 'delete-kr') {
      newTree[objIndex].children.splice(krIndex, 1);
      setEditTreeData(newTree);
    }
    else if (action === 'delete-node') {
      // Delete nested node
      if (!path || path.length < 2) return;
      
      let parentNode = newTree[path[0]];
      for (let i = 1; i < path.length - 1; i++) {
        parentNode = parentNode.children[path[i]];
      }
      
      const nodeIndex = path[path.length - 1];
      parentNode.children.splice(nodeIndex, 1);
      setEditTreeData(newTree);
    }
  };

  const handleSaveNodeDetails = () => {
    const newTree = [...editTreeData];
    const path = nodeDetailConfig.path; 
    if (path.length === 1) newTree[path[0]] = {...newTree[path[0]], ...editingNodeData};
    else if (path.length === 2) newTree[path[0]].children[path[1]] = {...newTree[path[0]].children[path[1]], ...editingNodeData};
    setEditTreeData(newTree);
    closeNodeDetail();
    triggerToast('Node changes saved.');
  };

  const handleSaveTemplateChanges = () => {
    if (!editFormData.title.trim()) { setEditFormErrors({ title: 'Template name cannot be empty.' }); return; }
    if (editTreeData.length === 0) { setEditFormErrors({ general: 'Template must have at least 1 Objective.' }); return; }
    const newTags = editFormData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const updatedList = templateList.map(t => {
      if (t.id === editTargetId) return { ...t, title: editFormData.title, desc: editFormData.desc, tags: newTags, tree: editTreeData, date: new Date().toISOString().split('T')[0] };
      return t;
    });
    setTemplateList(updatedList);
    closeEditModal();
    triggerToast('Changes saved successfully.');
  };

  // --- HANDLERS: FLOW D (IMPORT) ---
  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
    setImportStep(1);
    setImportFileStatus('idle');
    setImportReviewTab('all');
    setImportSelectedFields(availableFields.map(f => f.id)); 
    setImportFormData({ title: '', desc: '', tags: '' });
    setImportFormErrors({});
    setImportTreeVisibleColumns([...DEFAULT_VISIBLE_COLUMNS]);
    setImportValidationVisibleColumns([...DEFAULT_VISIBLE_COLUMNS]);
    setImportFormData({ title: '', desc: '', tags: '' });
    setImportFormErrors({});
  };

  const toggleImportValidationColumn = (colId) => {
    setImportValidationVisibleColumns(prev =>
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.json')) {
        setImportFileStatus('error');
        setImportFormErrors({ file: 'Only .json format is supported.' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setImportFileStatus('error');
        setImportFormErrors({ file: 'File exceeds maximum size of 10MB.' });
        return;
      }
      setImportFileStatus('loading');
      setImportFormErrors({});
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          JSON.parse(ev.target.result);
          setImportFileStatus('parsed');
          setImportFormData(prev => ({...prev, title: file.name.replace('.json', '')}));
        } catch (err) {
          setImportFileStatus('error');
          setImportFormErrors({ file: 'Invalid JSON format. Please check file syntax.' });
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadSampleTemplate = () => {
    try {
      const sample = {
        title: 'Sample OKR Template',
        tree: sampleTreeData
      };
      const data = JSON.stringify(sample, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'okr_template_sample.json';
      a.click();
      URL.revokeObjectURL(url);
      triggerToast('Sample template downloaded.');
    } catch (err) {
      triggerToast('Failed to download sample template.', 'error');
    }
  };

  const handleNextImportStep = () => {
    if (importStep === 1) {
       if (importFileStatus !== 'parsed') return;
       if (!importFormData.title.trim()) {
          setImportFormErrors({ title: 'Please enter template name before continuing.' });
          return;
       }
       setImportFormErrors({});
    }
    setImportStep(prev => Math.min(prev + 1, 3));
  };

  const toggleImportField = (fieldId) => {
    setImportSelectedFields(prev => prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]);
  };

  const handleConfirmImport = () => {
    setIsImportModalOpen(false);
    setConfirmCloseTarget(null);
    const finalDesc = importFormData.desc.trim() ? importFormData.desc : '';
    const finalTags = importFormData.tags.trim() ? importFormData.tags.split(',').map(t=>t.trim()) : [];
    const newTemplate = {
      id: Date.now(), title: importFormData.title, desc: finalDesc, tags: finalTags, creator: 'Current User', date: new Date().toISOString().split('T')[0], tree: JSON.parse(JSON.stringify(sampleTreeData))
    };
    setTemplateList([newTemplate, ...templateList]);
    triggerToast('Template imported successfully from JSON.');
  };

  // --- HANDLERS: FLOW E (EXPORT) ---
  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
    setExportStep(1);
    setExportSelectedTemplates(templateList.map(t => t.id));
    setExportSelectedFields(availableFields.map(f => f.id)); 
  };
  const handleNextExportStep = () => {
    if (exportStep === 1 && exportSelectedTemplates.length === 0) return;
    setExportStep(prev => Math.min(prev + 1, 3));
  };
  const toggleExportTemplate = (templateId) => {
    setExportSelectedTemplates(prev => prev.includes(templateId) ? prev.filter(id => id !== templateId) : [...prev, templateId]);
  };
  const toggleExportField = (fieldId) => {
    setExportSelectedFields(prev => prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]);
  };
  const handleConfirmExport = () => {
    setIsExportModalOpen(false);
    triggerToast('JSON file downloaded successfully.');
  };

  // --- HANDLERS: CHUNG ---
  const handleCloseAttempt = (type) => {
    if (type === 'save' && (formData.title || saveStep > 1)) setConfirmCloseTarget('save');
    else if (type === 'add' && (selectedTemplateId || addStep > 1)) setConfirmCloseTarget('add');
    else if (type === 'import' && (importFileStatus === 'parsed' || importStep > 1)) setConfirmCloseTarget('import');
    else if (type === 'export' && exportStep > 1) setConfirmCloseTarget('export');
    else {
      if(type === 'save') setIsSaveModalOpen(false);
      if(type === 'add') setIsAddModalOpen(false);
      if(type === 'import') setIsImportModalOpen(false);
      if(type === 'export') setIsExportModalOpen(false);
    }
  };

  const confirmClose = () => {
    if (confirmCloseTarget === 'save') setIsSaveModalOpen(false);
    if (confirmCloseTarget === 'add') setIsAddModalOpen(false);
    if (confirmCloseTarget === 'import') setIsImportModalOpen(false);
    if (confirmCloseTarget === 'export') setIsExportModalOpen(false);
    setConfirmCloseTarget(null);
  };

  // --- RENDER HELPERS: PREVIEW CÂY (COMPACT COLLAPSIBLE) ---
  const renderPreviewTree = (isStep2, currentFields, isFinalReview = false, treeData = previewTreeData, visibleColumns = DEFAULT_VISIBLE_COLUMNS, onToggleColumn = null, maximized = false, onMaximize = null) => {
    const toggleCollapse = (id) => setPreviewCollapsed(prev => ({...prev, [id]: !prev[id]}));

    const getFieldValue = (node, fieldId) => {
      if (isStep2 && !currentFields.includes(fieldId)) {
        const defaults = { 'description': 'Default description', 'user': 'Unassigned', 'team': 'Default Team', 'metric': 'Default Metric', 'progress_percent': '0%' };
        return defaults[fieldId] || '-';
      }
      const map = { 'description': node.description, 'user': node.assign || node.user, 'team': node.team, 'metric': node.metric, 'progress_percent': node.progress };
      return map[fieldId] || '-';
    };

    const getStatus = (node) => node.status || 'valid';

    const renderCell = (node, colId, isObj) => {
      if (isObj) {
        if (colId === 'status') return <CheckCircle2 size={14} className="inline text-green-600" />;
        return <span className="text-gray-300">-</span>;
      }
      switch (colId) {
        case 'user': return <span className="truncate">{getFieldValue(node, 'user')}</span>;
        case 'metric': return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600">{getFieldValue(node, 'metric')}</span>;
        case 'progress': {
          const p = getFieldValue(node, 'progress_percent');
          return (
            <div className="flex items-center justify-center gap-1">
              <div className="w-10 bg-gray-200 h-1.5 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{ width: p }}></div></div>
              <span className="text-[10px] text-green-600 font-medium">{p}</span>
            </div>
          );
        }
        case 'status':
          const s = getStatus(node);
          return <>
            {s === 'valid' && <CheckCircle2 size={14} className="inline text-green-600" />}
            {s === 'warning' && <AlertTriangle size={14} className="inline text-amber-600" />}
            {s === 'error' && <XOctagon size={14} className="inline text-red-600" />}
          </>;
        case 'team': return <span className="truncate">{getFieldValue(node, 'team')}</span>;
        case 'timeline': return <span className="truncate">{node.timeline || '-'}</span>;
        case 'agg': return <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-medium">{node.agg || 'SUM'}</span>;
        case 'description': return <span className="truncate">{node.description || '-'}</span>;
        default: return null;
      }
    };

    const rows = [];
    const objId = treeData.objective?.id || 'root';
    const isCollapsed = previewCollapsed[objId];
    rows.push(
      <div key={objId} className="flex items-center border-b border-gray-100 py-1.5 px-2 hover:bg-blue-50/30 transition-colors">
        <div className="flex items-center gap-1 shrink-0" style={{ width: '140px' }}>
          <button onClick={() => toggleCollapse(objId)} className="p-0.5 hover:bg-gray-200 rounded shrink-0">
            <ChevronRight size={10} className={`text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
          </button>
          <Box size={11} className="text-blue-500 shrink-0" />
          <div onClick={() => openNodeDetail(treeData.objective, 'view')} className="text-[11px] font-medium text-blue-600 truncate cursor-pointer hover:underline">{treeData.objective?.name}</div>
        </div>
        <div className="flex items-center gap-1.5 ml-1">
          {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
            <div key={col.id} className={`${col.width} text-[10px] text-gray-500 text-center shrink-0`}>{renderCell(treeData.objective, col.id, true)}</div>
          ))}
        </div>
        <div className="ml-auto shrink-0">
          {onToggleColumn && <ColumnToggle visibleColumns={visibleColumns} onToggle={onToggleColumn} />}
        </div>
      </div>
    );
    if (!isCollapsed) {
      treeData.krs.forEach(kr => {
        const s = getStatus(kr);
        rows.push(
          <div key={kr.id} className="flex items-center border-b border-gray-100 py-1.5 px-2 hover:bg-blue-50/30 transition-colors" style={{ paddingLeft: '20px' }}>
            <div className="flex items-center gap-1 shrink-0" style={{ width: '125px' }}>
              <div className="w-1 h-1 rounded-full bg-green-500 shrink-0"></div>
              <div onClick={() => openNodeDetail(kr, 'view')} className={`text-[11px] font-medium truncate cursor-pointer hover:underline ${s === 'error' ? 'text-red-600' : s === 'warning' ? 'text-amber-600' : 'text-gray-700'}`}>{kr.name}</div>
            </div>
            <div className="flex items-center gap-1.5 ml-1">
              {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                <div key={col.id} className={`${col.width} text-[10px] text-gray-600 text-center shrink-0`}>{renderCell(kr, col.id, false)}</div>
              ))}
            </div>
          </div>
        );
      });
    }

    return (
      <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
        <div className="flex items-center bg-gray-50 border-b border-gray-200 py-2 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          <div className="shrink-0" style={{ width: '180px', paddingLeft: '4px' }}>Node</div>
          <div className="flex items-center gap-3 ml-2">
            {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
              <div key={col.id} className={`${col.width} text-center shrink-0`}>{col.label}</div>
            ))}
          </div>
          <div className="ml-auto shrink-0">
            {onToggleColumn && <ColumnToggle visibleColumns={visibleColumns} onToggle={onToggleColumn} />}
            {onMaximize && (
              <button onClick={() => onMaximize(!maximized)} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title={maximized ? 'Minimize' : 'Maximize'}>
                {maximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-50 overflow-auto">
          <div className="min-w-[500px]">{rows}</div>
        </div>
        <div className="text-xs text-gray-400 italic mt-2 px-2">Note: OKR preview và node details chỉ mang tính minh họa, trong triển khai phải sử dụng giao diện OKR/Details của hệ thống gốc trên XCORP</div>
      </div>
    );

    const treeContent = (
      <div className="flex flex-col h-full min-h-0">
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm flex-1 flex flex-col min-h-0">
          <div className="flex items-center bg-gray-50 border-b border-gray-200 py-1 px-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            <div className="shrink-0" style={{ width: '130px', paddingLeft: '2px' }}>Node</div>
            <div className="flex items-center gap-1 ml-1">
              {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                <div key={col.id} className={`${col.width} text-center shrink-0`}>{col.label}</div>
              ))}
            </div>
            <div className="ml-auto shrink-0 flex items-center gap-0.5">
              {onToggleColumn && <ColumnToggle visibleColumns={visibleColumns} onToggle={onToggleColumn} />}
              {onMaximize && (
                <button onClick={() => onMaximize(!maximized)} className="p-0.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title={maximized ? 'Minimize' : 'Maximize'}>
                  {maximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <div className="min-w-[400px]">{rows}</div>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 italic mt-0.5 px-1 shrink-0">OKR preview mang tính minh họa.</div>
      </div>
    );

    if (maximized) {
      return (
        <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden relative">
            <div className="absolute top-3 right-3 z-20">
              <button onClick={() => onMaximize(false)} className="p-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-100 text-gray-600 transition-colors" title="Close">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-4 pt-12 overflow-hidden">
              {treeContent}
            </div>
          </div>
        </div>
      );
    }

    return treeContent;
  };

  const renderImportValidationTree = (filterTab, visibleColumns = DEFAULT_VISIBLE_COLUMNS, onToggleColumn = null, maximized = false, onMaximize = null) => {

    const isNodeVisible = (n) => {
      if (filterTab === 'all') return true;
      if (filterTab === 'errors') return n.status === 'error';
      if (filterTab === 'warnings') return n.status === 'warning';
      if (filterTab === 'passed') return n.status === 'valid';
      return true;
    };

    const treeData = mockImportParsedTree;
    const objVisible = isNodeVisible(treeData.objective);
    const visibleKRs = treeData.krs.filter(kr => isNodeVisible(kr));
    const shouldShowObj = objVisible || visibleKRs.length > 0;

    if (!shouldShowObj && visibleKRs.length === 0) {
       return <div className="p-8 text-center text-gray-500">No nodes match the current filter.</div>;
    }

    const renderValidationCell = (node, colId) => {
      switch (colId) {
        case 'user': return <span className="truncate">{node.assign || node.user || '-'}</span>;
        case 'metric': return <span className="truncate">{node.metric || '-'}</span>;
        case 'progress': {
          const p = node.progress || '0%';
          return (
            <div className="flex items-center justify-center gap-1">
              <div className="w-10 bg-gray-200 h-1.5 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{ width: p }}></div></div>
              <span className="text-[10px] text-green-600 font-medium">{p}</span>
            </div>
          );
        }
        case 'status':
          return <>
            {node.status === 'valid' && <CheckCircle2 size={14} className="inline text-green-600" />}
            {node.status === 'warning' && <AlertTriangle size={14} className="inline text-amber-600" />}
            {node.status === 'error' && <XOctagon size={14} className="inline text-red-600" />}
          </>;
        case 'team': return <span className="truncate">{node.team || '-'}</span>;
        case 'timeline': return <span className="truncate">{node.timeline || '-'}</span>;
        case 'agg': return <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-medium">{node.agg || '-'}</span>;
        case 'description': return <span className="truncate">{node.description || '-'}</span>;
        default: return null;
      }
    };

    const toggleCollapse = (id) => setImportValidationCollapsed(prev => ({...prev, [id]: !prev[id]}));
    const objId = treeData.objective?.id || 'val-root';
    const isCollapsed = importValidationCollapsed[objId];

    const treeContent = (
      <div className="flex flex-col h-full min-h-0">
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm flex-1 flex flex-col min-h-0">
          <div className="flex items-center bg-gray-50 border-b border-gray-200 py-1 px-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            <div className="shrink-0" style={{ width: '130px', paddingLeft: '2px' }}>Node</div>
            <div className="flex items-center gap-1 ml-1">
              {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                <div key={col.id} className={`${col.width} text-center shrink-0`}>{col.label}</div>
              ))}
            </div>
            <div className="ml-auto shrink-0 flex items-center gap-0.5">
              {onToggleColumn && <ColumnToggle visibleColumns={visibleColumns} onToggle={onToggleColumn} />}
              {onMaximize && (
                <button onClick={() => onMaximize(!maximized)} className="p-0.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title={maximized ? 'Minimize' : 'Maximize'}>
                  {maximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <div className="min-w-[400px]">
              {objVisible && (
                <div className="flex items-center border-b border-gray-100 py-1 px-1.5 hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-center gap-1 shrink-0" style={{ width: '130px' }}>
                    <button onClick={() => toggleCollapse(objId)} className="p-0.5 hover:bg-gray-200 rounded shrink-0">
                      <ChevronRight size={10} className={`text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
                    </button>
                    <Box size={11} className="text-blue-500 shrink-0" />
                    <div onClick={() => openNodeDetail(treeData.objective, 'view')} className="text-[11px] font-medium text-blue-600 truncate cursor-pointer hover:underline">{treeData.objective.id}: {treeData.objective.name}</div>
                  </div>
                  <div className="flex items-center gap-1 ml-1">
                    {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                      <div key={col.id} className={`${col.width} text-[10px] text-gray-500 text-center shrink-0`}>{renderValidationCell(treeData.objective, col.id)}</div>
                    ))}
                  </div>
                </div>
              )}
              {!isCollapsed && visibleKRs.map(kr => (
                <div key={kr.id} className="flex items-center border-b border-gray-100 py-1 px-1.5 hover:bg-blue-50/30 transition-colors" style={{ paddingLeft: '16px' }}>
                  <div className="flex items-center gap-1 shrink-0" style={{ width: '115px' }}>
                    <div className="w-1 h-1 rounded-full bg-green-500 shrink-0"></div>
                    <div onClick={() => openNodeDetail(kr, 'view')} className={`text-[11px] font-medium truncate cursor-pointer hover:underline ${kr.status === 'error' ? 'text-red-600' : kr.status === 'warning' ? 'text-amber-600' : 'text-gray-700'}`}>{kr.id}: {kr.name}</div>
                  </div>
                  <div className="flex items-center gap-1 ml-1">
                    {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                      <div key={col.id} className={`${col.width} text-[10px] text-gray-600 text-center shrink-0`}>{renderValidationCell(kr, col.id)}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    if (maximized) {
      return (
        <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl w-[80vw] h-[80vh] flex flex-col overflow-hidden relative">
            <div className="absolute top-3 right-3 z-20">
              <button onClick={() => onMaximize(false)} className="p-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-100 text-gray-600 transition-colors" title="Close">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-4 pt-12 overflow-hidden">
              {treeContent}
            </div>
          </div>
        </div>
      );
    }

    return treeContent;
  };

  const FieldRow = ({ label, required, children }) => (
    <div>
      <label className="text-[11px] font-medium text-gray-500 mb-1 block">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );

  // --- RENDER HELPERS: NODE DETAILS ---
  const renderNodeDetailSidePanel = () => {
    if (!nodeDetailConfig.isOpen || !nodeDetailConfig.data) return null;
    const { mode, data } = nodeDetailConfig;
    const isEdit = mode === 'edit';
    const isObj = data.type === 'objective';
    
    return (
      <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-[70] flex flex-col transform transition-transform border-l border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
           <div className="flex items-center gap-3">
             <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isObj ? 'bg-blue-100' : 'bg-green-100'}`}>
               {isObj ? <Box size={18} className="text-blue-600" /> : <CheckSquare size={18} className="text-green-600" />}
             </div>
             <div>
               <div className="flex items-center gap-2">
                 <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded text-white uppercase ${isObj ? 'bg-blue-600' : 'bg-green-600'}`}>
                   {isObj ? 'O' : 'KR'}
                 </span>
                 <span className="text-xs text-gray-400 font-mono">{data.id || 'AUTO'}</span>
                 {isEdit && <span className="text-[10px] font-medium text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">Editing</span>}
               </div>
               <h3 className="font-bold text-gray-900 text-sm mt-0.5 leading-tight">{data.name}</h3>
              <div className="text-[11px] text-gray-400 italic mt-1">Note: OKR preview và node details chỉ mang tính minh họa, trong triển khai phải sử dụng giao diện OKR/Details của hệ thống gốc trên XCORP</div>
             </div>
           </div>
           <button onClick={closeNodeDetail} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={18}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/40">
          
          <div className="p-5 space-y-5">
            
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FileText size={13} /> Basic Information</h4>
              <div className="space-y-3">
                <FieldRow label="Title" required>
                  {isEdit ? <input type="text" value={editingNodeData?.name || ''} onChange={(e) => setEditingNodeData({...editingNodeData, name: e.target.value})} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500" /> : <div className="text-sm font-semibold text-gray-900">{data.name}</div>}
                </FieldRow>
                <FieldRow label="Description">
                  {isEdit ? <textarea value={editingNodeData?.description || ''} onChange={(e) => setEditingNodeData({...editingNodeData, description: e.target.value})} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded-md h-16 custom-scrollbar focus:ring-1 focus:ring-blue-500" /> : <div className="text-sm text-gray-600">{data.description || <span className="italic text-gray-400">Not set</span>}</div>}
                </FieldRow>
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="Code">
                    <div className="text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1.5 rounded border border-gray-200">{data.id || 'AUTO-GEN'}</div>
                  </FieldRow>
                  <FieldRow label="Category">
                    {isEdit ? (
                      <select value={isObj ? 'objective' : 'kr'} onChange={(e) => setEditingNodeData({...editingNodeData, type: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md">
                        <option value="objective">Objective</option><option value="kr">Key Result</option>
                      </select>
                    ) : <div className="text-sm text-gray-800">{isObj ? 'Objective' : 'Key Result'}</div>}
                  </FieldRow>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="Level">
                    {isEdit ? (
                      <select value={editingNodeData?.levelName || 'Company'} onChange={(e) => setEditingNodeData({...editingNodeData, levelName: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md">
                        <option>Personal</option><option>Team</option><option>Company</option>
                      </select>
                    ) : <div className="text-sm text-gray-800">{data.levelName || 'Company'}</div>}
                  </FieldRow>
                  <FieldRow label="Space">
                    {isEdit ? <input type="text" value={editingNodeData?.space || selectedSpace} onChange={(e) => setEditingNodeData({...editingNodeData, space: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm text-gray-800">{data.space || selectedSpace}</div>}
                  </FieldRow>
                </div>
                {!isObj && (
                  <FieldRow label="Timeline" required>
                    {isEdit ? <input type="text" value={editingNodeData?.timeline || ''} onChange={(e) => setEditingNodeData({...editingNodeData, timeline: e.target.value})} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm text-gray-800">{data.timeline || 'Not set'}</div>}
                  </FieldRow>
                )}
              </div>
            </div>

            {/* Assignment & Tracking */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Users size={13} /> Assignment & Tracking</h4>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Assignee">
                  {isEdit ? <input type="text" placeholder="Select user..." value={editingNodeData?.user || ''} onChange={(e) => setEditingNodeData({...editingNodeData, user: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm flex items-center gap-1.5">{data.user ? <><div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden shrink-0"><img src={`https://i.pravatar.cc/100?u=${data.user}`} alt="u"/></div><span className="font-medium">{data.user}</span></> : <span className="italic text-gray-400">Not set</span>}</div>}
                </FieldRow>
                <FieldRow label="Team">
                  {isEdit ? <input type="text" value={editingNodeData?.team || ''} onChange={(e) => setEditingNodeData({...editingNodeData, team: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm text-gray-800">{data.team || <span className="italic text-gray-400">Not set</span>}</div>}
                </FieldRow>
                <FieldRow label="Group">
                  {isEdit ? <input type="text" value={editingNodeData?.group || ''} onChange={(e) => setEditingNodeData({...editingNodeData, group: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm text-gray-800">{data.group || <span className="italic text-gray-400">Not set</span>}</div>}
                </FieldRow>
                <FieldRow label="Stakeholders">
                  {isEdit ? <input type="text" placeholder="User1, User2" value={editingNodeData?.stakeholders || ''} onChange={(e) => setEditingNodeData({...editingNodeData, stakeholders: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm text-gray-800">{data.stakeholders || <span className="italic text-gray-400">Not set</span>}</div>}
                </FieldRow>
              </div>
            </div>

            {/* Additional Attributes */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Package size={13} /> Additional Attributes</h4>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Indicator">
                  {isEdit ? <input type="text" value={editingNodeData?.indicator || ''} onChange={(e) => setEditingNodeData({...editingNodeData, indicator: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm text-gray-800">{data.indicator || <span className="italic text-gray-400">Not set</span>}</div>}
                </FieldRow>
                <FieldRow label="Due Date">
                  {isEdit ? <input type="text" placeholder="dd/mm/yyyy" value={editingNodeData?.dueDate || ''} onChange={(e) => setEditingNodeData({...editingNodeData, dueDate: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm text-gray-800">{data.dueDate || <span className="italic text-gray-400">Not set</span>}</div>}
                </FieldRow>
                <div className="col-span-2">
                  <FieldRow label="Labels">
                    {isEdit ? <input type="text" placeholder="label1, label2" value={editingNodeData?.labels || ''} onChange={(e) => setEditingNodeData({...editingNodeData, labels: e.target.value})} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm text-gray-800">{data.labels || <span className="italic text-gray-400">Not set</span>}</div>}
                  </FieldRow>
                </div>
                <div className="col-span-2">
                  <FieldRow label="Policies">
                    {isEdit ? <textarea value={editingNodeData?.policies || ''} onChange={(e) => setEditingNodeData({...editingNodeData, policies: e.target.value})} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded-md h-14 custom-scrollbar" /> : <div className="text-sm text-gray-600">{data.policies || <span className="italic text-gray-400">Not set</span>}</div>}
                  </FieldRow>
                </div>
              </div>
            </div>

            {/* Metrics & Results */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><BarChart2 size={13} /> Metrics & Results</h4>
              <div className="space-y-3">
                <FieldRow label="Metric">
                  {isEdit ? <input type="text" value={editingNodeData?.metric || ''} onChange={(e) => setEditingNodeData({...editingNodeData, metric: e.target.value})} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">{data.metric || <span className="italic text-gray-400">Not set</span>}</div>}
                </FieldRow>
                <div className="grid grid-cols-3 gap-3">
                  <FieldRow label="Name">
                    {isEdit ? <input type="text" value={editingNodeData?.mName || ''} onChange={(e) => setEditingNodeData({...editingNodeData, mName: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm text-gray-800">{data.mName || <span className="italic text-gray-400">-</span>}</div>}
                  </FieldRow>
                  <FieldRow label="Unit">
                    {isEdit ? <input type="text" value={editingNodeData?.mUnit || ''} onChange={(e) => setEditingNodeData({...editingNodeData, mUnit: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md" /> : <div className="text-sm text-gray-800">{data.mUnit || <span className="italic text-gray-400">-</span>}</div>}
                  </FieldRow>
                  <FieldRow label="Agg">
                    {isEdit ? (
                      <select value={editingNodeData?.agg || 'SUM'} onChange={(e) => setEditingNodeData({...editingNodeData, agg: e.target.value})} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md">
                        <option>SUM</option><option>AVG</option><option>COUNT</option><option>MAX</option><option>MIN</option>
                      </select>
                    ) : <div className="text-sm text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded font-bold border border-blue-100">{data.agg || <span className="italic text-gray-400">-</span>}</div>}
                  </FieldRow>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <label className="text-[10px] text-gray-500 font-medium block mb-0.5">Start</label>
                    {isEdit ? <input type="number" className="w-full text-sm bg-white border border-gray-300 px-2 py-1 rounded" defaultValue={0}/> : <span className="text-sm font-semibold text-gray-700">{data.start || 0}</span>}
                  </div>
                  <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-200">
                    <label className="text-[10px] text-gray-500 font-medium block mb-0.5">Current</label>
                    {isEdit ? <input type="number" className="w-full text-sm bg-white border border-blue-300 px-2 py-1 rounded" defaultValue={0}/> : <span className="text-sm font-semibold text-blue-700">{data.current || 0}</span>}
                  </div>
                  <div className="bg-green-50/50 p-2.5 rounded-lg border border-green-200">
                    <label className="text-[10px] text-gray-500 font-medium block mb-0.5">Expected</label>
                    {isEdit ? <input type="number" className="w-full text-sm bg-white border border-green-300 px-2 py-1 rounded" defaultValue={100}/> : <span className="text-sm font-semibold text-green-700">{data.expected || 100}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <FieldRow label="Progress Formula">
                    {isEdit ? (
                      <select className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md"><option>Default</option><option>Custom</option></select>
                    ) : <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded w-fit font-medium">Default</div>}
                  </FieldRow>
                  <FieldRow label="Risk Formula">
                    {isEdit ? (
                      <select className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md"><option>Default</option><option>Custom</option></select>
                    ) : <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded w-fit font-medium">Default</div>}
                  </FieldRow>
                </div>
              </div>
            </div>

          </div>

        </div>

        {isEdit && (
          <div className="px-5 py-3 border-t border-gray-200 bg-white flex justify-end gap-2 shrink-0 shadow-[0_-2px_6px_-1px_rgba(0,0,0,0.05)]">
             <button onClick={closeNodeDetail} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
             <button onClick={handleSaveNodeDetails} className="px-5 py-2 bg-[#2563eb] rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5"><Save size={15} /> Save Changes</button>
          </div>
        )}
      </div>
    );
  };


  // --- RENDERING MAIN ---
  return (
    <div className="flex h-screen w-full bg-white text-gray-800 font-sans overflow-hidden">
      
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded shadow-lg flex items-center animate-bounce-in max-w-md ${
          toastType === 'success' ? 'bg-green-600 text-white' :
          toastType === 'error' ? 'bg-red-600 text-white' :
          toastType === 'warning' ? 'bg-amber-600 text-white' :
          'bg-blue-600 text-white'
        }`}>
          {toastType === 'success' && <Check size={18} className="text-white mr-2 shrink-0" />}
          {toastType === 'error' && <XCircle size={18} className="text-white mr-2 shrink-0" />}
          {toastType === 'warning' && <AlertTriangle size={18} className="text-white mr-2 shrink-0" />}
          {toastType === 'info' && <Info size={18} className="text-white mr-2 shrink-0" />}
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* --- C3: DELETE DIALOG --- */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 animate-fade-in border-t-4 border-red-500">
            <div className="flex items-center text-red-500 mb-2">
              <AlertTriangle size={24} className="mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Confirm Delete Template</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6 mt-2 leading-relaxed">
              Are you sure you want to delete template <strong>"{deleteTarget.title}"</strong>?<br/>This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 flex items-center"><Trash2 size={16} className="mr-1.5"/> Delete Template</button>
            </div>
          </div>
        </div>
      )}

      {/* --- TIMELINE SELECTION POPUP CHO USE TEMPLATE --- */}
      {isTimelineModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-[420px] overflow-visible animate-fade-in flex flex-col">
             <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                <h3 className="font-bold text-gray-800">Select Space & Timeline</h3>
                <button onClick={() => setIsTimelineModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18}/></button>
             </div>
             <div className="p-5">
                <p className="text-sm text-gray-600 mb-3">Select Space and timeline to apply template <strong>{viewTarget?.title}</strong> into the system:</p>
                <div className="mb-4">
                   <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Space</label>
                   <SpaceDropdown selected={selectedSpaceForUse} onSelect={(s) => { setSelectedSpaceForUse(s); setSelectedTimelineForUse(''); }} />
                </div>
                <div className="mb-4">
                   <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Timeline Tree</label>
                    <TimelineTreeDropdown selected={selectedTimelineForUse} onSelect={setSelectedTimelineForUse} space={selectedSpaceForUse} />
                </div>
             </div>
             <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                <button onClick={() => setIsTimelineModalOpen(false)} className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
                <button onClick={handleConfirmUseTemplate} className="px-4 py-1.5 text-sm text-white bg-green-600 rounded hover:bg-green-700 font-medium">Apply Template</button>
             </div>
          </div>
        </div>
      )}

      {/* --- C1: VIEW TEMPLATE MODAL --- */}
      {viewTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-gray-500/75 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden relative">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-3"><Eye size={18}/></div>
                <div>
                  <h2 className="text-lg font-bold text-[#1e3a8a]">{viewTarget.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Previewing template structure (Read-only)</p>
                  <p className="text-[11px] text-gray-400 italic mt-1">Note: OKR preview và node details chỉ mang tính minh họa, trong triển khai phải sử dụng giao diện OKR/Details của hệ thống gốc trên XCORP</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={handleOpenTimelineSelection} className="px-4 py-1.5 bg-green-600 text-white rounded-md font-semibold text-xs hover:bg-green-700 transition flex items-center shadow-sm whitespace-nowrap">
                  <Download size={14} className="mr-1.5" /> Use This Template
                </button>
                <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-200 transition bg-white border border-gray-200 shadow-sm"><X size={18} /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 custom-scrollbar relative flex flex-col">
               <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6 shrink-0">
                 <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">General Information</h4>
                 <p className="text-sm text-gray-700 mb-3">{viewTarget.desc || <span className="text-gray-400 italic">Default description</span>}</p>
                 <div className="flex space-x-2">
                   {viewTarget.tags && viewTarget.tags.length > 0 ? (
                      viewTarget.tags.map(tag => <span key={tag} className="px-2 py-0.5 rounded text-xs bg-gray-100 border border-gray-200 text-gray-600">{tag}</span>)
                   ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100 border border-gray-200 text-gray-400 italic">Default Tag</span>
                   )}
                 </div>
               </div>

               <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <span>OKR Tree Structure Preview</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <div className="min-w-[500px]">
                      <div className="flex items-center bg-gray-50 border-b border-gray-200 py-2 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="shrink-0" style={{ width: '180px', paddingLeft: '4px' }}>Node</div>
                        <div className="flex items-center gap-3 ml-2">
                          {TREE_COLUMNS.filter(c => viewTreeVisibleColumns.includes(c.id)).map(col => (
                            <div key={col.id} className={`${col.width} text-center shrink-0`}>{col.label}</div>
                          ))}
                        </div>
                        <div className="ml-auto shrink-0">
                          <ColumnToggle visibleColumns={viewTreeVisibleColumns} onToggle={toggleViewTreeColumn} />
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {viewTarget.tree.map((obj) => {
                          const objCollapsed = viewCollapsedObjs[obj.id];
                          const toggleViewObj = () => setViewCollapsedObjs(prev => ({...prev, [obj.id]: !prev[obj.id]}));
                          const renderCell = (node, colId, isKr = false) => {
                            if (colId === 'user') return <span className="truncate text-[12px]">{node.user || <span className="text-gray-300">-</span>}</span>;
                            if (colId === 'metric') return <span className="truncate text-[12px]">{node.metric || <span className="text-gray-300">-</span>}</span>;
                            if (colId === 'team') return <span className="truncate text-[12px]">{node.team || <span className="text-gray-300">-</span>}</span>;
                            if (colId === 'progress') return <span className="text-[12px] font-medium text-green-600">{isKr ? (node.progress || '-') : <span className="text-gray-300">-</span>}</span>;
                            if (colId === 'timeline') return <span className="truncate text-[12px]">{isKr ? (node.timeline || <span className="text-gray-300">-</span>) : <span className="text-gray-300">-</span>}</span>;
                            if (colId === 'agg') return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600">{node.agg || 'SUM'}</span>;
                            if (colId === 'status') return <CheckCircle2 size={14} className="inline text-green-600" />;
                            if (colId === 'description') return <span className="truncate text-[12px]">{node.description || '-'}</span>;
                            return null;
                          };
                          return (
                            <div key={obj.id}>
                              <div className="flex items-center py-2 px-3 hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => openNodeDetail(obj, 'view')}>
                                <div className="flex items-center gap-1.5 shrink-0" style={{ width: '180px' }}>
                                  <button onClick={(e) => { e.stopPropagation(); toggleViewObj(); }} className="p-0.5 hover:bg-gray-200 rounded shrink-0">
                                    <ChevronRight size={12} className={`text-gray-400 transition-transform ${objCollapsed ? '' : 'rotate-90'}`} />
                                  </button>
                                  <Box size={13} className="text-blue-500 shrink-0" />
                                  <span className="text-xs font-semibold text-blue-600 hover:underline truncate">{obj.id} - {obj.name}</span>
                                </div>
                                <div className="flex items-center gap-3 ml-2">
                                  {TREE_COLUMNS.filter(c => viewTreeVisibleColumns.includes(c.id)).map(col => (
                                    <div key={col.id} className={`${col.width} text-center shrink-0`}>{renderCell(obj, col.id, false)}</div>
                                  ))}
                                </div>
                              </div>
                              {!objCollapsed && obj.children && obj.children.map(kr => (
                                <div key={kr.id} className="flex items-center py-2 px-3 hover:bg-blue-50/30 transition-colors cursor-pointer border-t border-gray-50" onClick={() => openNodeDetail(kr, 'view')} style={{ paddingLeft: '28px' }}>
                                  <div className="flex items-center gap-1.5 shrink-0" style={{ width: '170px' }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                                    <span className="text-xs text-gray-700 hover:text-blue-600 hover:underline truncate">{kr.id} - {kr.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3 ml-2">
                                    {TREE_COLUMNS.filter(c => viewTreeVisibleColumns.includes(c.id)).map(col => (
                                      <div key={col.id} className={`${col.width} text-center shrink-0`}>{renderCell(kr, col.id, true)}</div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-4">
                    <DisclaimerNote />
                  </div>
                </div>
               
            </div>
            
            {renderNodeDetailSidePanel()}

            {nodeDetailConfig.isOpen && <div className="absolute inset-0 bg-black/5 z-[65]" onClick={closeNodeDetail}></div>}
          </div>
        </div>
      )}

      {/* --- C2: EDIT TEMPLATE MODAL --- */}
      {editTargetId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-gray-500/75 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative">
            
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 flex items-center justify-center mr-3"><Edit size={18}/></div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Edit Template</h2>
                  <p className="text-xs text-gray-500 mt-0.5">ID: {editTargetId}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                 <button onClick={closeEditModal} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                 <button onClick={handleSaveTemplateChanges} className="px-4 py-2 bg-blue-600 rounded text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm flex items-center"><Save size={16} className="mr-2"/> Save</button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex bg-gray-50/50">
              <div className="w-[350px] bg-white border-r border-gray-200 p-6 overflow-y-auto custom-scrollbar shrink-0">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2 mb-4">General Information</h3>
                {editFormErrors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start">
                    <AlertCircle size={14} className="mr-1.5 shrink-0 mt-0.5" />
                    <span>{editFormErrors.general}</span>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                    <input type="text" maxLength={120} value={editFormData.title} onChange={(e) => { setEditFormData({...editFormData, title: e.target.value}); if(e.target.value) setEditFormErrors({...editFormErrors, title: null}); }} className={`w-full p-2 border ${editFormErrors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded text-sm focus:outline-none focus:ring-1`} />
                    {editFormErrors.title && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle size={12} className="mr-1"/>{editFormErrors.title}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                    <textarea value={editFormData.desc} onChange={(e) => setEditFormData({...editFormData, desc: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm h-24 focus:outline-none focus:ring-1 focus:ring-blue-500 custom-scrollbar" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Domain/Tags</label>
                    <input type="text" value={editFormData.tags} onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
                 <div className="bg-blue-50 border border-blue-200 p-3 rounded-md shadow-sm mb-6 flex items-start">
                    <Info size={18} className="text-blue-500 mr-2 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-800">Editing Tips (Template Builder)</h4>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc ml-4">
                         <li>Hover any node to reveal action buttons (right).</li>
                         <li>Click <strong>"+"</strong> on Objective to add new Key Result.</li>
                         <li>Click <strong>"+"</strong> on child nodes to create nested nodes (max 4 levels).</li>
                         <li>Click <strong>Edit</strong> icon to edit Node details.</li>
                         <li>Click <strong>Delete</strong> icon to remove node (Warning: Deleting parent also deletes all children).</li>
                         <li><strong>Level indicator (L2, L3, L4)</strong> shows node depth in the tree.</li>
                      </ul>
                    </div>
                 </div>

                 <div className="bg-white rounded-lg border border-gray-200 shadow-sm min-h-[400px] overflow-x-auto">
                    <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200 bg-gray-50/50">
                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">OKR Tree Editor</h4>
                    </div>
                    <div className="min-w-[900px]">
                      <div className="flex items-center border-b border-gray-200 bg-gray-50 py-2 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="w-72">OKR</div><div className="w-28">User</div><div className="w-28">Team</div><div className="w-24">Metric</div><div className="w-20">Agg.Type</div><div className="w-20 text-center">Progress</div><div className="w-24 text-center">Actions</div>
                      </div>
                      <div className="divide-y divide-gray-100">
                         {editTreeData.map((obj, oIdx) => {
                           const renderNode = (node, path, level = 1) => {
                             const isObjective = level === 1;
                             const canAddChild = level < 4;
                             const paddingLeft = 16 + (level - 1) * 24;
                             return (
                               <React.Fragment key={node.id}>
                                 <div className="group flex items-center py-2.5 px-4 hover:bg-blue-50/30 transition-colors relative" style={{ paddingLeft: `${paddingLeft}px` }}>
                                   <div className="w-72 flex items-center gap-2">
                                     {isObjective ? <Box size={14} className="text-blue-500 shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>}
                                     <span onClick={() => openNodeDetail(node, 'edit', path)} className={`${isObjective ? 'font-semibold text-blue-600' : 'text-gray-700'} text-[13px] hover:underline cursor-pointer line-clamp-1`}>{node.id} - {node.name}</span>
                                     {level > 1 && <span className="text-[10px] px-1 py-0.5 bg-gray-100 text-gray-500 rounded">L{level}</span>}
                                   </div>
                                   <div className="w-28 text-[12px] text-gray-600">{node.user || '-'}</div>
                                   <div className="w-28 text-[12px] text-gray-600">{node.team || '-'}</div>
                                   <div className="w-24 text-[12px] text-gray-600">{node.metric || '-'}</div>
                                   <div className="w-20 text-[12px]"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600">{node.agg}</span></div>
                                   <div className="w-20 text-center text-[12px]">{node.progress ? <span className="font-medium text-green-600">{node.progress}</span> : <span className="text-gray-400">-</span>}</div>
                                   <div className="w-24 text-center flex items-center justify-center gap-1">
                                     {isObjective && <button onClick={(e) => { e.stopPropagation(); handleEditTreeAction('add-kr', path[0]); }} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Add Key Result"><Plus size={14}/></button>}
                                     {!isObjective && canAddChild && <button onClick={(e) => { e.stopPropagation(); handleEditTreeAction('add-child', null, null, path); }} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Create mới (Add Child)"><Plus size={14}/></button>}
                                     <button onClick={(e) => { e.stopPropagation(); openNodeDetail(node, 'edit', path); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit Node"><Edit size={14}/></button>
                                     {isObjective ? <button onClick={(e) => { e.stopPropagation(); handleEditTreeAction('delete-obj', path[0]); }} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete Objective"><Trash2 size={14}/></button>
                                       : level === 2 ? <button onClick={(e) => { e.stopPropagation(); handleEditTreeAction('delete-kr', path[0], path[1]); }} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete Key Result"><Trash2 size={14}/></button>
                                       : <button onClick={(e) => { e.stopPropagation(); handleEditTreeAction('delete-node', null, null, path); }} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete Node"><Trash2 size={14}/></button>}
                                   </div>
                                 </div>
                                 {node.children && node.children.map((child, cIdx) => renderNode(child, [...path, cIdx], level + 1))}
                               </React.Fragment>
                             );
                           };
                           return renderNode(obj, [oIdx], 1);
                         })}
                         {editTreeData.length === 0 && (
                           <div className="py-10 text-center text-gray-400">
                              <FolderTree size={32} className="mx-auto mb-2 opacity-50" />
                              <p className="text-sm font-medium">Chưa có Objectives</p>
                              <p className="text-xs mt-1">Template này chưa có dữ liệu OKR tree.</p>
                           </div>
                         )}
                      </div>
                    </div>
                    <div className="px-5 pb-4">
                      <DisclaimerNote />
                    </div>
                  </div>
              </div>
            </div>

            {renderNodeDetailSidePanel()}
            {nodeDetailConfig.isOpen && <div className="absolute inset-0 bg-black/10 z-[65]" onClick={closeNodeDetail}></div>}
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRM CLOSE --- */}
      {confirmCloseTarget && (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Exit progress?</h3>
            <p className="text-gray-600 text-sm mb-6">Progress will be lost. Are you sure you want to exit and cancel current action?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setConfirmCloseTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Continue</button>
              <button onClick={confirmClose} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700">Confirm exit</button>
            </div>
          </div>
        </div>
      )}

      {/* --- TITLE DUPLICATE WARNING --- */}
      {titleDupTarget && (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 animate-fade-in border-t-4 border-amber-500">
            <div className="flex items-center text-amber-500 mb-3">
              <AlertTriangle size={24} className="mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Title already exists</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">Template name <strong>"{titleDupTarget}"</strong> already exists.</p>
            <p className="text-gray-600 text-sm mb-6">The name will be changed to <strong>"{titleDupTarget}_(1)"</strong>. Continue?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setTitleDupTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
              <button onClick={() => { setTitleDupTarget(null); handleSaveFinal(); }} className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded hover:bg-amber-700">Continue with rename</button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================================== */}
      {/* --- MODAL D: IMPORT JSON TEMPLATE FLOW --- */}
      {/* ================================================================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <UploadCloud size={20} className="text-[#3B5998]" /> Import Template
              </h2>
              <button onClick={() => handleCloseAttempt('import')} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24} />
              </button>
            </div>

            {/* Stepper */}
            <Stepper currentStep={importStep} />

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50">
              
              {/* STEP 1: UPLOAD & REVIEW */}
              {importStep === 1 && (
                <div className="p-6 h-full flex flex-col">
                  {importFileStatus === 'idle' && (
                    <div className="max-w-xl w-full mx-auto my-auto animate-fade-in flex flex-col justify-center h-full pb-10">
                      <div className="text-center mb-4 mt-6">
                        <h3 className="text-lg font-semibold text-gray-800">Upload File</h3>
                        <p className="text-sm text-gray-500">Supported format: <strong>.json only</strong> - UTF-8 encoding</p>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 py-8 px-6 flex flex-col items-center justify-center hover:bg-gray-50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".json" className="hidden" />
                        <UploadCloud size={40} className="text-indigo-300 mb-3" />
                        <p className="text-gray-700 font-medium mb-1">Drag & drop your file here</p>
                        <p className="text-gray-400 text-sm mb-3">or</p>
                        <button className="bg-[#3B5998] hover:bg-[#2d4373] text-white px-6 py-2 rounded-md font-medium transition pointer-events-none">
                          Browse Files
                        </button>
                        <p className="text-gray-400 text-xs mt-3">.json only</p>
                      </div>
                      <div className="mt-4 flex justify-center">
                        <button onClick={downloadSampleTemplate} className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md transition font-medium">
                          <Download size={14} /> Download Sample Template
                        </button>
                      </div>
                    </div>
                  )}

                  {importFileStatus === 'loading' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {importFileStatus === 'error' && (
                    <div className="max-w-xl w-full mx-auto my-auto animate-fade-in flex flex-col justify-center h-full pb-10">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-red-600">Upload Error</h3>
                        <p className="text-sm text-red-500 mt-2">{importFormErrors.file || 'File validation failed.'}</p>
                      </div>
                      <div className="border-2 border-dashed border-red-200 rounded-xl bg-red-50 py-8 px-6 flex flex-col items-center justify-center hover:bg-red-100 transition cursor-pointer" onClick={() => { setImportFileStatus('idle'); setImportFormErrors({}); }}>
                        <UploadCloud size={40} className="text-red-300 mb-3" />
                        <p className="text-gray-700 font-medium mb-1">Click to try again</p>
                        <p className="text-gray-400 text-xs">Select a valid .json file (max 10MB)</p>
                      </div>
                    </div>
                  )}

                  {importFileStatus === 'parsed' && (() => {
                    const allNodes = [mockImportParsedTree.objective, ...mockImportParsedTree.krs];
                    const filteredNodes = allNodes.filter(n => {
                      if (importReviewTab === 'all') return true;
                      if (importReviewTab === 'errors') return n.status === 'error';
                      if (importReviewTab === 'warnings') return n.status === 'warning';
                      if (importReviewTab === 'passed') return n.status === 'valid';
                      return true;
                    });

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 animate-fade-in">
                        {/* Left Column: Stats & Form */}
                        <div className="flex flex-col space-y-6">
                          <div className="mt-6">
                            <h3 className="text-sm font-bold text-gray-800 mb-1">Upload File</h3>
                            <p className="text-xs text-gray-500 mb-4">Supported format: <strong>.json only</strong></p>
                            
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between relative overflow-hidden">
                              <div className="absolute top-0 bottom-0 left-0 w-1 bg-green-500"></div>
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 text-blue-600 font-bold text-[10px] px-2 py-1 rounded">JSON</div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800 truncate max-w-[150px]">{mockImportParsedTree.fileName}</p>
                                  <p className="text-xs text-gray-500">{mockImportParsedTree.size}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setImportFileStatus('idle')} className="text-gray-400 hover:text-red-500" title="Remove"><X size={16}/></button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Form */}
                          <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm relative">
                            <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg">Template Info</div>
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Imported Template Information</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                <input type="text" maxLength={120} value={importFormData.title} onChange={(e) => { setImportFormData({...importFormData, title: e.target.value}); if(e.target.value) setImportFormErrors({...importFormErrors, title: null}); }} placeholder="Ex: Q4 Global Product Launch" className={`w-full p-2 border ${importFormErrors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded text-sm focus:outline-none focus:ring-1`} />
                                {importFormErrors.title && <p className="text-[10px] text-red-500 mt-1 flex items-center"><AlertCircle size={10} className="mr-1"/>{importFormErrors.title}</p>}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea value={importFormData.desc} onChange={(e) => setImportFormData({...importFormData, desc: e.target.value})} placeholder="Leave empty to use default..." className="w-full p-2 border border-gray-300 rounded text-sm h-16 focus:outline-none focus:ring-1 focus:ring-blue-500 custom-scrollbar" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Domain/Tags (Optional)</label>
                                <input type="text" value={importFormData.tags} onChange={(e) => setImportFormData({...importFormData, tags: e.target.value})} placeholder="Separate by comma (,)" className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                              <p className="text-lg font-bold text-gray-800">{mockImportParsedTree.stats.total}</p>
                              <p className="text-[10px] text-gray-500 mt-1">Total Nodes</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                              <p className="text-lg font-bold text-gray-800">{mockImportParsedTree.stats.obj}</p>
                              <p className="text-[10px] text-gray-500 mt-1">Objectives</p>
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-center">
                              <p className="text-base font-bold text-red-600">{mockImportParsedTree.stats.error}</p>
                              <p className="text-[10px] text-red-500 mt-0.5">Errors</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-center">
                              <p className="text-base font-bold text-amber-600">{mockImportParsedTree.stats.warning}</p>
                              <p className="text-[10px] text-amber-600 mt-0.5">Warnings</p>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Validation */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-[600px]">
                          <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <div>
                              <h3 className="text-sm font-bold text-gray-800">Validation Results</h3>
                              <p className="text-xs text-gray-500">{mockImportParsedTree.stats.error + mockImportParsedTree.stats.warning} issues found across {mockImportParsedTree.stats.total} nodes</p>
                            </div>
                            <button onClick={() => { const report = JSON.stringify(mockImportParsedTree, null, 2); const blob = new Blob([report], {type: 'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'error_report.json'; a.click(); URL.revokeObjectURL(url); }} className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                              <FileJson size={14} /> Error Report
                            </button>
                          </div>
                          
                          <div className="px-4 py-3 flex gap-2 border-b border-gray-100 overflow-x-auto shrink-0">
                            <button onClick={() => setImportReviewTab('all')} className={`px-4 py-1.5 rounded text-xs font-medium transition ${importReviewTab === 'all' ? 'bg-[#3B5998] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>All {mockImportParsedTree.stats.total}</button>
                            <button onClick={() => setImportReviewTab('errors')} className={`px-4 py-1.5 rounded text-xs font-medium transition ${importReviewTab === 'errors' ? 'bg-red-50 border-red-200 text-red-600' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Errors <span className={`${importReviewTab==='errors'? 'text-red-600' : 'text-red-500'} ml-1`}>{mockImportParsedTree.stats.error}</span></button>
                            <button onClick={() => setImportReviewTab('warnings')} className={`px-4 py-1.5 rounded text-xs font-medium transition ${importReviewTab === 'warnings' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Warnings <span className={`${importReviewTab==='warnings'? 'text-amber-600' : 'text-amber-500'} ml-1`}>{mockImportParsedTree.stats.warning}</span></button>
                            <button onClick={() => setImportReviewTab('passed')} className={`px-4 py-1.5 rounded text-xs font-medium transition ${importReviewTab === 'passed' ? 'bg-green-50 border-green-200 text-green-600' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Passed <span className={`${importReviewTab==='passed'? 'text-green-600' : 'text-green-500'} ml-1`}>{mockImportParsedTree.stats.valid}</span></button>
                          </div>

                          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 custom-scrollbar">
                            {renderImportValidationTree(importReviewTab, importValidationVisibleColumns, toggleImportValidationColumn, importValidationMaximized, setImportValidationMaximized)}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* STEP 2: SELECTION */}
              {importStep === 2 && (
                <div className="flex h-full animate-fade-in">
                  {/* Left Column */}
                  <div className="w-[45%] bg-white border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Field Selection</h3>
                    <p className="text-xs text-gray-500 mb-6">Uncheck to skip import — system default value will be used instead</p>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4 shrink-0">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                          checked={importSelectedFields.length === availableFields.length}
                          onChange={(e) => { 
                            if(e.target.checked) setImportSelectedFields(availableFields.map(f => f.id));
                            else setImportSelectedFields(['name']);
                          }}
                        />
                        <span className="font-semibold text-sm text-gray-800">Select All Fields</span>
                      </label>
                      <span className="text-xs text-gray-500">{availableFields.length} fields · {importSelectedFields.length} selected</span>
                    </div>

                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 flex shrink-0">
                      <span className="w-[140px]">FIELD NAME</span>
                      <span>DESCRIPTION</span>
                    </div>

                    <div className="space-y-0 border-t border-gray-100 flex-1">
                      {availableFields.map(field => {
                        const isChecked = importSelectedFields.includes(field.id);
                        return (
                          <div key={field.id} className="py-4 px-2 border-b border-gray-100 flex gap-4 hover:bg-gray-50 transition">
                            <div className="w-[140px] flex items-start gap-2">
                              <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 cursor-pointer" 
                                checked={isChecked} disabled={field.locked} onChange={() => toggleImportField(field.id)} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${!isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{field.id}</span>
                                  <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-medium">{field.type === 'number' ? 'num' : field.type}</span>
                                </div>
                                {field.locked && <div className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> Required field</div>}
                                {!isChecked && !field.locked && <p className="text-[10px] text-gray-400 italic mt-1">Using default</p>}
                              </div>
                            </div>
                            <div className="flex-1 text-xs text-gray-500">
                              <p className={!isChecked ? 'line-through opacity-50' : ''}>{field.desc}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right Column (OKR Tree Preview) */}
                  <div className="flex-1 p-6 bg-slate-50 flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                      <div>
                        <h3 className="text-base font-bold text-gray-800">OKR Tree Preview</h3>
                        <p className="text-xs text-gray-500">Real-time preview with selected fields</p>
                      </div>
                      <div className="flex gap-2 flex-wrap max-w-sm justify-end">
                        {importSelectedFields.slice(0, 3).map(f => (
                          <div key={f} className="bg-white border border-gray-200 shadow-sm rounded px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                            {f}
                          </div>
                        ))}
                        {importSelectedFields.length > 3 && <div className="text-xs text-gray-400 pt-1">+{importSelectedFields.length - 3}</div>}
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <OKRTreePreview 
                        treeData={mockImportParsedTree}
                        selectedFields={importSelectedFields}
                        showNameColumn={false}
                        showDisclaimer={true}
                        visibleColumns={importTreeVisibleColumns}
                        onToggleColumn={toggleImportTreeColumn}
                        maximizable={true}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW */}
              {importStep === 3 && (
                <div className="flex h-full animate-fade-in">
                  {/* Left Column */}
                  <div className="w-[35%] bg-white border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white mx-auto mb-3 shadow-md">
                        <Check size={24} strokeWidth={3} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Ready to Import</h3>
                      <p className="text-sm text-gray-600">{mockImportParsedTree.stats.valid} of {mockImportParsedTree.stats.total} nodes will be imported</p>
                      {mockImportParsedTree.stats.error > 0 && (
                        <p className="text-xs text-red-500 font-medium mt-1">{mockImportParsedTree.stats.error} nodes skipped due to errors.</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-3 truncate">{mockImportParsedTree.fileName}</p>
                      <p className="text-[10px] text-gray-400">{mockImportParsedTree.size}</p>
                    </div>

                    <h4 className="text-sm font-bold text-gray-800 mb-4">Import Summary</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-600">Total Nodes in File</span>
                        <span className="text-lg font-bold text-gray-800">{mockImportParsedTree.stats.total}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <span className="text-sm font-semibold text-green-700">Nodes Ready</span>
                        <span className="text-lg font-bold text-green-700">{mockImportParsedTree.stats.valid}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                        <span className="text-sm font-semibold text-red-700">Nodes Skipped</span>
                        <span className="text-lg font-bold text-red-700">{mockImportParsedTree.stats.error}</span>
                      </div>
                    </div>

                    <div className="mt-5">
                      <h4 className="text-sm font-bold text-gray-800 mb-3">Field Selection Summary</h4>
                      <div className="space-y-2">
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                          <span className="font-semibold block mb-1"><Check size={12} className="inline mr-1"/> Fields selected ({importSelectedFields.length}):</span>
                          <div className="flex flex-wrap gap-1">
                            {importSelectedFields.map(fId => {
                              const f = availableFields.find(x => x.id === fId);
                              return f ? <span key={f.id} className="px-1.5 py-0.5 bg-white border border-green-200 rounded text-[10px] text-green-700 shadow-sm">{f.label}</span> : null;
                            })}
                          </div>
                        </div>
                        {importSelectedFields.length < availableFields.length && (
                          <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                            <span className="font-semibold block mb-1"><AlertTriangle size={12} className="inline mr-1"/> Fields using default values ({availableFields.length - importSelectedFields.length}):</span>
                            <div className="flex flex-wrap gap-1">
                              {availableFields.filter(f => !importSelectedFields.includes(f.id)).map(f => (
                                <span key={f.id} className="px-1.5 py-0.5 bg-white border border-orange-200 rounded text-[10px] text-orange-600 shadow-sm">{f.label}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (OKR Tree Preview) */}
                  <div className="flex-1 p-6 bg-slate-50 flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                      <div>
                        <h3 className="text-base font-bold text-gray-800">Final OKR Preview</h3>
                        <p className="text-xs text-gray-500">Validated items only - {mockImportParsedTree.stats.valid} of {mockImportParsedTree.stats.total} nodes</p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <OKRTreePreview 
                        treeData={{
                          ...mockImportParsedTree,
                          krs: mockImportParsedTree.krs.filter(kr => kr.status !== 'error')
                        }}
                        selectedFields={importSelectedFields}
                        showNameColumn={false}
                        showDisclaimer={true}
                        visibleColumns={importTreeVisibleColumns}
                        onToggleColumn={toggleImportTreeColumn}
                        maximizable={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-white flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-20">
              <div className="flex items-center text-sm">
                {importStep === 1 && importFileStatus === 'parsed' && (
                  <span className="text-gray-600 font-medium">
                    <AlertCircle size={16} className="inline text-amber-500 mr-1" />
                    <strong className="text-amber-600">{mockImportParsedTree.stats.error} invalid nodes</strong> will be skipped — <strong className="text-green-600">{mockImportParsedTree.stats.valid} valid nodes</strong> will be imported
                  </span>
                )}
                {importStep === 2 && (
                  <span className="text-gray-500 flex items-center gap-2 text-xs">
                    <AlertCircle size={14} className="text-blue-500" />
                    <span className="text-green-600 font-semibold">{importSelectedFields.length} selected</span> / <span className="text-orange-600 font-semibold">{availableFields.length - importSelectedFields.length} will use default</span>
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {importStep === 1 ? (
                  <button onClick={() => handleCloseAttempt('import')} className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                ) : (
                  <button onClick={() => setImportStep(importStep - 1)} className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                     <ChevronRight size={16} className="rotate-180" /> Back
                  </button>
                )}
                
                {importStep < 3 ? (
                  <button 
                    onClick={handleNextImportStep} 
                    disabled={importFileStatus !== 'parsed'}
                    className="px-6 py-2 bg-[#3B5998] hover:bg-[#2d4373] text-white rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition"
                  >
                    {importStep === 2 ? 'Next: Review' : 'Continue'} <ChevronRight size={16} className={importStep === 2 ? "" : "hidden"} />
                  </button>
                ) : (
                  <button 
                    onClick={handleConfirmImport}
                    className="px-6 py-2 bg-[#3B5998] hover:bg-[#2d4373] text-white rounded text-sm font-semibold flex items-center gap-1 transition"
                  >
                    Confirm Import <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ================================================================================================== */}
      {/* --- MODAL E: EXPORT JSON TEMPLATE FLOW --- */}
      {/* ================================================================================================== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <div>
                <h2 className="text-xl flex items-center gap-2 font-bold text-[#1e3a8a]">
                  <Download size={20} className="text-[#3B5998]" /> Export OKR Template
                </h2>
                <p className="text-xs text-gray-500 mt-1">Export template list to JSON format for sharing or backup</p>
              </div>
              <button onClick={() => handleCloseAttempt('export')} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-200 rounded-md">
                <X size={24} />
              </button>
            </div>

            {/* Stepper Header Flow E */}
            <div className="flex border-b border-gray-100 bg-white shrink-0">
              {[1, 2, 3].map(step => (
                <div key={step} className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${exportStep === step ? 'border-blue-600 text-blue-600' : exportStep > step ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-2 ${exportStep === step ? 'bg-blue-600 text-white' : exportStep > step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {exportStep > step ? <Check size={12} /> : step}
                  </div>
                  {step === 1 ? '1. Select Template' : step === 2 ? '2. Select Export Fields' : '3. Preview & Download'}
                </div>
              ))}
            </div>

            {/* Content Area - Split View */}
            <div className="flex-1 flex overflow-hidden bg-gray-50/50">
              
              {/* STEP 1: CHỌN TEMPLATE */}
              {exportStep === 1 && (
                <>
                  <div className="w-[45%] bg-white border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto custom-scrollbar animate-fade-in">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2 shrink-0 mb-4">Template Library</h3>
                    <p className="text-xs text-gray-500 mb-4 shrink-0">Select OKR templates to include in the JSON file</p>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4 shrink-0">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                          checked={exportSelectedTemplates.length === templateList.length && templateList.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setExportSelectedTemplates(templateList.map(t => t.id));
                            else setExportSelectedTemplates([]);
                          }}
                        />
                        <span className="font-semibold text-sm text-gray-800">Select All</span>
                      </label>
                      <span className="text-xs text-gray-500 font-medium bg-white px-2 py-0.5 border border-gray-200 rounded">{exportSelectedTemplates.length} / {templateList.length}</span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                       {templateList.map(t => (
                         <div key={t.id} className={`border rounded-lg p-3 flex gap-3 transition cursor-pointer hover:bg-blue-50/50 ${exportSelectedTemplates.includes(t.id) ? 'border-blue-300 bg-blue-50/30 shadow-sm ring-1 ring-blue-500/20' : 'border-gray-200 bg-white'}`} onClick={() => toggleExportTemplate(t.id)}>
                            <input type="checkbox" checked={exportSelectedTemplates.includes(t.id)} readOnly className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 cursor-pointer pointer-events-none" />
                            <div>
                              <div className="font-semibold text-sm text-[#1e3a8a]">{t.title}</div>
                              <div className="text-xs text-gray-500 line-clamp-1 mt-1">{t.desc || <span className="italic text-gray-400">Default description</span>}</div>
                              <div className="flex gap-1 mt-2">
                                {t.tags && t.tags.length > 0 ? (
                                  <>
                                    {t.tags.slice(0, 2).map(tag => <span key={tag} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{tag}</span>)}
                                    {t.tags.length > 2 && <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">+{t.tags.length - 2}</span>}
                                  </>
                                ) : (
                                  <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 italic">Default Tag</span>
                                )}
                              </div>
                            </div>
                         </div>
                       ))}
                       {templateList.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No templates in the library.</p>}
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 bg-slate-50 flex flex-col h-full overflow-hidden animate-fade-in border-l border-gray-200">
                    <div className="mb-4 shrink-0 border-b border-gray-200 pb-3 flex justify-between items-end">
                       <div>
                         <h3 className="text-base font-bold text-gray-800 mb-1">Export Queue</h3>
                         <p className="text-xs text-gray-500">These items will be merged into a single file</p>
                       </div>
                       <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">{exportSelectedTemplates.length} Templates</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                       {exportSelectedTemplates.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <FolderTree size={48} className="mb-3 opacity-20"/>
                            <span className="text-sm font-medium">Please select at least 1 template to continue</span>
                          </div>
                       ) : (
                          exportSelectedTemplates.map((tId, idx) => {
                            const t = templateList.find(x => x.id === tId);
                            if(!t) return null;
                            return (
                              <div key={tId} className="bg-white border border-gray-200 rounded-md p-4 shadow-sm flex justify-between items-center relative overflow-hidden group">
                                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                 <div className="pl-2">
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-mono text-gray-400">#{idx + 1}</span>
                                      <div className="font-bold text-sm text-gray-800">{t.title}</div>
                                   </div>
                                   <div className="text-xs text-gray-500 flex items-center">
                                      <User size={12} className="mr-1"/> {t.creator} <span className="mx-2 text-gray-300">|</span> <Calendar size={12} className="mr-1"/> {t.date}
                                   </div>
                                 </div>
                                 <button onClick={() => toggleExportTemplate(tId)} className="text-gray-300 hover:text-red-500 transition p-1 hover:bg-red-50 rounded" title="Remove from list"><X size={16}/></button>
                              </div>
                            )
                          })
                       )}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: CHỌN FIELD */}
              {exportStep === 2 && (
                <>
                  <div className="w-[35%] bg-white border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto custom-scrollbar animate-fade-in shrink-0">
                    <div className="shrink-0 mb-6">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-1">Field Selection</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">Choose data fields to include in the exported JSON.</p>
                      
                      <div className="mt-5 border border-gray-200 rounded-lg p-3.5 flex items-center justify-between bg-white shadow-sm">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                            checked={exportSelectedFields.length === availableFields.length}
                            onChange={(e) => {
                              if (e.target.checked) setExportSelectedFields(availableFields.map(f => f.id));
                              else setExportSelectedFields([]);
                            }}
                          />
                          <span className="font-bold text-sm text-gray-800">Select All Fields</span>
                        </label>
                        <div className="text-xs text-gray-500 text-right leading-tight">
                          <span className="block font-bold text-gray-700">{exportSelectedFields.length} / {availableFields.length}</span>
                          <span>selected</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
                      {/* ALWAYS INCLUDED */}
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">Always Included <div className="w-1 h-3 bg-gray-300 rounded-full"></div></h4>
                        <div className="bg-green-50/50 border border-green-200 rounded-lg p-3.5 flex gap-3 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400"></div>
                          <input type="checkbox" checked disabled className="w-4 h-4 mt-0.5 rounded border-gray-300 text-green-600 opacity-50" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-green-800">okr_key</span>
                              <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">string</span>
                              <span className="text-[10px] text-green-600 bg-white border border-green-200 px-1.5 py-0.5 rounded shadow-sm">auto</span>
                            </div>
                            <p className="text-xs text-green-700/80 mt-1.5 leading-relaxed">Unique identifier — always exported automatically</p>
                          </div>
                        </div>
                      </div>

                      {/* SELECTABLE FIELDS - Including progress_percent */}
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">Selectable Fields <div className="w-1 h-3 bg-gray-300 rounded-full"></div></h4>
                        <div className="space-y-3">
                          {availableFields.map(field => {
                            const isChecked = exportSelectedFields.includes(field.id);
                            return (
                              <div key={field.id} className={`border rounded-lg p-3.5 flex gap-3 transition relative overflow-hidden ${isChecked ? 'bg-white border-blue-200 shadow-sm' : 'bg-gray-50/50 border-gray-200'}`}>
                                {isChecked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>}
                                <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 cursor-pointer relative z-10" 
                                  checked={isChecked} onChange={() => toggleExportField(field.id)} />
                                <div className="relative z-10">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-sm font-bold ${isChecked ? 'text-gray-800' : 'text-gray-500'}`}>{field.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isChecked ? 'text-blue-500 bg-blue-50 border-blue-100' : 'text-gray-400 bg-gray-100 border-gray-200'}`}>{field.type === 'number' ? 'num' : field.type}</span>
                                  </div>
                                  <p className={`text-xs mt-1.5 leading-relaxed ${isChecked ? 'text-gray-600' : 'text-gray-400'}`}>{field.desc}</p>
                                  {!isChecked && <p className="text-[10px] text-amber-600 font-medium mt-2 flex items-center gap-1"><AlertTriangle size={10}/> Not included in export</p>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6 bg-slate-50 flex flex-col h-full animate-fade-in border-l border-gray-200">
                    <div className="mb-4 shrink-0">
                      <h3 className="text-base font-bold text-gray-800 mb-1">JSON Format Preview</h3>
                      <p className="text-xs text-gray-500">Preview output structure based on selected fields</p>
                    </div>

                    {exportSelectedFields.length === 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex gap-2 text-amber-800 items-start shrink-0 shadow-sm">
                        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                        <span className="text-xs font-medium"><strong>No fields selected</strong> — The output file will only contain mandatory auto-included fields.</span>
                      </div>
                    )}

                    {/* Code Editor Mockup */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden font-mono text-sm min-h-0">
                      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center text-xs shrink-0">
                        <div className="flex gap-4">
                          <span className="font-semibold text-gray-600 flex items-center gap-1.5"><FileJson size={14}/> {exportFileName}</span>
                          <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded font-medium">sample mapping preview</span>
                        </div>
                      </div>
                      <div className="p-4 overflow-auto flex-1 bg-[#FAFAFA] text-gray-800 leading-relaxed whitespace-pre custom-scrollbar">
{`[
  {
    // - auto-included (read-only) -
    "okr_key": "OBJ-TEMPLATE-X",
${exportSelectedFields.includes('name') ? `\n    // - selected field -\n    "name": "Objective / KR Name",` : ''}
${exportSelectedFields.includes('description') ? `\n    // - selected field -\n    "description": "Custom Description...",` : ''}
${exportSelectedFields.includes('user') ? `\n    // - selected field -\n    "user": "Owner Name",` : ''}
${exportSelectedFields.includes('metric') ? `\n    // - selected field -\n    "metric": "Revenue",` : ''}
${exportSelectedFields.includes('progress_percent') ? `\n    // - selected field -\n    "progress_percent": 75,` : ''}
    
    // - excluded keys: ${exportSelectedFields.length < availableFields.length ? availableFields.filter(f => !exportSelectedFields.includes(f.id)).map(f => f.label).join(', ') : 'None'}
  }
]`}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-lg p-3 shrink-0">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Key color:</p>
                      <div className="flex gap-6 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-400"></div> auto-included</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-400"></div> selected</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-400"></div> excluded</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 3: XEM TRƯỚC & XÁC NHẬN */}
              {exportStep === 3 && (
                <>
                  <div className="w-[35%] bg-white border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto custom-scrollbar animate-fade-in">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white mx-auto mb-3 shadow-md">
                        <Download size={24} strokeWidth={2} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Ready to Export</h3>
                      <p className="text-sm text-gray-600">JSON file is ready for download</p>
                    </div>
                    
                    <h4 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Export Summary</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border border-gray-200 rounded bg-gray-50">
                        <span className="text-sm font-semibold text-gray-600">Templates Selected</span>
                        <span className="text-lg font-bold text-blue-600">{exportSelectedTemplates.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-sm font-semibold text-green-700">Fields Mapped</span>
                        <span className="text-lg font-bold text-green-700">{exportSelectedFields.length} <span className="text-xs text-green-500 font-normal">/ {availableFields.length}</span></span>
                      </div>
                      <div className="p-2 mt-3 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                        <span className="font-semibold block mb-1"><Check size={12} className="inline mr-1"/> Fields selected ({exportSelectedFields.length}):</span>
                        <div className="flex flex-wrap gap-1">
                          {exportSelectedFields.map(fId => {
                            const f = availableFields.find(x => x.id === fId);
                            return f ? <span key={f.id} className="px-1.5 py-0.5 bg-white border border-green-200 rounded text-[10px] text-green-700 shadow-sm">{f.label}</span> : null;
                          })}
                        </div>
                      </div>
                      {exportSelectedFields.length < availableFields.length && (
                        <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                          <span className="font-semibold block mb-1"><AlertTriangle size={12} className="inline mr-1"/> Fields not selected ({availableFields.length - exportSelectedFields.length}):</span>
                          <div className="flex flex-wrap gap-1">
                            {availableFields.filter(f => !exportSelectedFields.includes(f.id)).map(f => (
                              <span key={f.id} className="px-1.5 py-0.5 bg-white border border-orange-200 rounded text-[10px] text-orange-600 shadow-sm">{f.label}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-4 p-3 bg-blue-50/50 rounded border border-blue-100 leading-relaxed text-center">
                        All selected templates will be consolidated into <strong className="text-gray-700">1 single JSON file</strong>. You can reuse this file via the Import function.
                      </div>
                      <div className="mt-4">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Selected Templates</h5>
                        <div className="space-y-1.5">
                          {exportSelectedTemplates.map(tId => {
                            const t = templateList.find(x => x.id === tId);
                            if (!t) return null;
                            return (
                              <div key={tId} onClick={() => { const previewNode = { id: t.id.toString(), name: t.title, description: t.desc, type: 'objective', user: t.creator, timeline: t.date }; openNodeDetail(previewNode, 'view'); }} className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                                <FileText size={14} className="text-blue-500 shrink-0" />
                                <span className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline truncate">{t.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 bg-slate-50 flex flex-col h-full overflow-hidden animate-fade-in border-l border-gray-200">
                    <div className="mb-4 shrink-0 flex justify-between items-end border-b border-gray-200 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-800 mb-1">Final JSON Payload</h3>
                        <p className="text-xs text-gray-500">Preview the actual data to be exported</p>
                      </div>
                      <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded shadow-sm text-xs font-mono font-bold flex items-center gap-1.5">
                        <FileJson size={14} className="text-blue-500"/> {exportFileName}
                      </span>
                    </div>

                    <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg shadow-inner flex flex-col overflow-hidden font-mono text-sm text-green-400 min-h-0">
                      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center text-xs text-gray-400 shrink-0 border-b border-gray-700">
                        <span>JSON Preview (Read-only array)</span>
                      </div>
                      <div className="p-4 overflow-auto flex-1 whitespace-pre custom-scrollbar">
{`[
${exportSelectedTemplates.map(tId => {
  const t = templateList.find(x => x.id === tId);
  return `  {
    "okr_key": "OBJ-${tId}",
    ${exportSelectedFields.includes('name') ? `"name": "${t.title}",` : ''}
    ${exportSelectedFields.includes('description') ? `"description": "${t.desc || 'Default description'}",` : ''}
    ${exportSelectedFields.includes('progress_percent') ? `"progress_percent": 0,` : ''}
    "type": "objective",
    "children": [
      // ... nested KRs will be mapped here
    ]
  }`}).join(',\n')}
]`}
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Modal Footer Flow E */}
            <div className="border-t border-gray-200 px-6 py-4 bg-white flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-20 shrink-0">
              <div className="text-xs text-gray-500 font-medium">
                {exportStep === 1 && (
                   <span className="flex items-center gap-1.5"><AlertCircle size={14} className="text-blue-500" /> {exportSelectedTemplates.length} templates selected</span>
                )}
                 {exportStep === 2 && (
                    <span className="flex items-center gap-1.5"><AlertCircle size={14} className="text-blue-500" /> <span className="text-green-600 font-semibold">{exportSelectedFields.length} selected</span> / <span className="text-orange-600 font-semibold">{availableFields.length - exportSelectedFields.length} excluded</span></span>
                 )}
              </div>
              <div className="flex gap-3">
                 <button onClick={() => handleCloseAttempt('export')} className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                 {exportStep > 1 && (<button onClick={() => setExportStep(prev => prev - 1)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition flex items-center gap-1"><ChevronRight size={16} className="rotate-180" /> Back</button>)}
                 {exportStep < 3 ? (
                   <button 
                     onClick={handleNextExportStep} 
                     disabled={exportStep === 1 && exportSelectedTemplates.length === 0}
                     className={`px-4 py-2 rounded-md text-sm font-medium transition shadow-sm flex items-center gap-1 ${exportStep === 1 && exportSelectedTemplates.length === 0 ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-[#2563eb] text-white hover:bg-blue-700'}`}
                   >
                     Continue <ChevronRight size={16} />
                   </button>
                 ) : (
                   <button 
                     onClick={handleConfirmExport}
                     className="px-6 py-2 bg-[#3B5998] hover:bg-[#2d4373] text-white rounded text-sm font-semibold flex items-center gap-2 transition shadow-sm"
                   >
                     <Download size={16} /> Download JSON
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================================== */}
      {/* --- MODAL B: ADD TEMPLATE FLOW (APPLY) --- */}
      {/* ================================================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-500/75 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#1e3a8a]">{tableData.length === 0 ? 'Add template to' : 'Override template to'} <span className="text-sm font-normal text-gray-500">(Apply to)</span></h2>
                <div className="flex items-center gap-6 mt-2">
                  <div className="flex items-center gap-2"><span className="text-xs font-medium text-gray-500">Space:</span><span className="text-xs font-bold text-blue-700 bg-blue-100/50 border border-blue-200 px-2.5 py-1 rounded">{selectedSpace}</span></div>
                  <div className="flex items-center gap-2"><span className="text-xs font-medium text-gray-500">Timeline:</span><span className="text-xs font-bold text-blue-700 bg-blue-100/50 border border-blue-200 px-2.5 py-1 rounded">{selectedYear}</span></div>
                </div>
              </div>
              <button onClick={() => handleCloseAttempt('add')} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-gray-100 bg-white shrink-0">
              {[1, 2, 3].map(step => (
                <div key={step} className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${addStep === step ? 'border-blue-600 text-blue-600' : addStep > step ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-2 ${addStep === step ? 'bg-blue-600 text-white' : addStep > step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {addStep > step ? <Check size={12} /> : step}
                  </div>
                  {step === 1 ? '1. Select Template' : step === 2 ? '2. Field Import' : '3. Review & Apply'}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-hidden flex bg-gray-50/50">
              <div className="w-1/2 p-6 overflow-y-auto bg-white border-r border-gray-200 custom-scrollbar relative">
                
                {addStep === 1 && (
                  <div className="space-y-4 animate-fade-in flex flex-col h-full">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2 shrink-0">Template Library</h3>
                    <div className="relative shrink-0">
                      <input 
                        type="text" 
                        value={addSearchQuery}
                        onChange={(e) => setAddSearchQuery(e.target.value)}
                        placeholder="Search templates by title or tags..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-2 pr-1">
                      {filteredTemplates.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => setSelectedTemplateId(t.id)}
                          className={`p-4 border rounded-md cursor-pointer transition-all ${selectedTemplateId === t.id ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50 hover:border-blue-300'}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-sm text-[#1e3a8a]">{t.title}</h4>
                            {selectedTemplateId === t.id && <CheckCircleIcon />}
                          </div>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{t.desc || <span className="italic text-gray-400">Default description</span>}</p>
                          <div className="flex justify-between items-end">
                            <div className="flex flex-wrap gap-1">
                              {t.tags && t.tags.length > 0 ? t.tags.map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-gray-200 text-gray-600">{tag}</span>
                              )) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-gray-200 text-gray-400 italic">Default Tag</span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 flex flex-col items-end">
                              <span>{t.creator}</span>
                              <span>{t.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredTemplates.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <Search size={28} className="mb-2 opacity-30" />
                          <p className="text-sm font-medium">No matching templates found</p>
                          <p className="text-xs mt-1">Try different keywords or clear search</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {addStep === 2 && (
                  <div className="animate-fade-in flex flex-col h-full">
                    <div className="mb-4 shrink-0">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Field Import Selection</h3>
                      <p className="text-sm text-blue-700 bg-blue-50 px-3 py-3 rounded border border-blue-100 mt-2">
                        Select fields to take from template. <strong>Unselected fields will use system default values.</strong>
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border border-gray-200 flex justify-between items-center mb-4 shrink-0">
                      <label className="flex items-center font-bold text-sm text-gray-800 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={addSelectedFields.length === availableFields.length} 
                          onChange={() => {
                            if(addSelectedFields.length === availableFields.length) {
                              setAddSelectedFields(['name']); 
                            } else {
                              setAddSelectedFields(availableFields.map(f => f.id)); 
                            }
                          }}
                          className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                        />
                        Select All Fields
                      </label>
                      <span className="text-xs text-gray-500">{addSelectedFields.length} selected</span>
                    </div>

                    <div className="flex-1 overflow-y-auto border border-gray-200 rounded custom-scrollbar min-h-[200px]">
                      <div className="flex px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
                        <div className="w-1/3">Field Name</div>
                        <div className="w-2/3">Description</div>
                      </div>
                      
                      {availableFields.map(field => {
                        const isChecked = addSelectedFields.includes(field.id);
                        return (
                          <div key={field.id} className="flex px-3 py-3 border-b border-gray-50 hover:bg-gray-50 transition">
                            <div className="w-1/3 flex items-start">
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                disabled={field.locked}
                                onChange={() => toggleAddField(field.id)}
                                className={`mt-1 mr-3 w-4 h-4 rounded border-gray-300 ${field.locked ? 'text-gray-400' : 'text-blue-600 focus:ring-blue-500 cursor-pointer'}`}
                              />
                              <div>
                                <span className="font-medium text-sm text-gray-800">{field.label}</span>
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600">{field.type === 'number' ? 'num' : field.type}</span>
                              </div>
                            </div>
                            <div className="w-2/3 flex flex-col justify-center">
                              <span className={`text-sm ${isChecked ? 'text-gray-600' : 'text-gray-400 line-through'}`}>{field.desc}</span>
                              {!isChecked && <span className="text-[11px] text-orange-500 mt-0.5 italic flex items-center"><Info size={10} className="mr-1"/> Will use system default</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200 shrink-0">
                      <p className="text-sm text-gray-600 leading-relaxed space-y-2">
                        <span className="font-semibold text-green-600 flex items-center mb-1"><Check size={16} className="mr-1"/> Fields selected:</span>
                        <span className="inline-flex flex-wrap gap-1">{availableFields.filter(f => addSelectedFields.includes(f.id)).map(f => <strong key={f.id} className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 text-xs">{f.label}</strong>)}</span>
                      </p>
                      {addSelectedFields.length < availableFields.length && (
                      <p className="text-sm text-gray-600 leading-relaxed mt-2">
                        <span className="font-semibold text-orange-600 flex items-center mb-1"><AlertTriangle size={16} className="mr-1"/> Fields not selected (will use defaults):</span>
                        <span className="inline-flex flex-wrap gap-1">{availableFields.filter(f => !addSelectedFields.includes(f.id)).map(f => <strong key={f.id} className="text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-xs">{f.label}</strong>)}</span>
                      </p>
                      )}
                    </div>
                  </div>
                )}

                {addStep === 3 && (
                  <div className="space-y-5 animate-fade-in flex flex-col h-full">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2 shrink-0">Review Summary</h3>
                    {tableData.length > 0 && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded shrink-0 shadow-sm">
                        <div className="flex items-start">
                          <AlertTriangle className="text-red-500 mr-2 shrink-0 mt-0.5" size={18} />
                          <div>
                            <h4 className="text-sm font-bold text-red-800">Important Warning</h4>
                            <p className="text-xs text-red-700 mt-1 leading-relaxed">
                              ⚠️ Apply Template will create and overwrite OKR data immediately on the current Timeline. 
                              <strong> This action cannot be undone after confirmation.</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                      <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100">
                        <span className="text-xs text-blue-600 font-semibold block mb-1">Target Context (Apply to)</span>
                        <div className="text-sm font-bold text-[#1e3a8a]"><span className="text-gray-500 font-normal">Space:</span> {selectedSpace}</div>
                        <div className="text-sm font-bold text-[#1e3a8a]"><span className="text-gray-500 font-normal">Timeline:</span> {selectedYear}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Template Selected</span>
                        <div className="font-medium text-gray-900 border border-gray-200 px-3 py-2 rounded bg-gray-50">{selectedTemplateData?.title}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Fields Configuration</span>
                        <div className="text-sm mb-1 text-gray-700">
                          <span className="font-medium text-blue-600">{addSelectedFields.length}</span> field(s) mapped from template.
                        </div>
                        <div className="mt-2 space-y-2">
                          <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                            <span className="font-semibold block mb-1"><Check size={12} className="inline mr-1"/> Fields selected ({addSelectedFields.length}):</span>
                            <div className="flex flex-wrap gap-1">
                              {addSelectedFields.map(fId => {
                                const f = availableFields.find(x => x.id === fId);
                                return f ? <span key={f.id} className="px-1.5 py-0.5 bg-white border border-green-200 rounded text-[10px] text-green-700 shadow-sm">{f.label}</span> : null;
                              })}
                            </div>
                          </div>
                          {addSelectedFields.length < availableFields.length && (
                            <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                              <span className="font-semibold block mb-1"><AlertTriangle size={12} className="inline mr-1"/> Fields using default values ({availableFields.length - addSelectedFields.length}):</span>
                              <div className="flex flex-wrap gap-1">
                                {availableFields.filter(f => !addSelectedFields.includes(f.id)).map(f => (
                                  <span key={f.id} className="px-1.5 py-0.5 bg-white border border-orange-200 rounded text-[10px] text-orange-600 shadow-sm">{f.label}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              
              <div className="w-1/2 p-6 overflow-y-auto bg-gray-50/50 custom-scrollbar border-l border-gray-200 relative">
                {addStep === 1 && (
                  <div className="animate-fade-in h-full flex flex-col">
                    {selectedTemplateId ? (
                      <>
                        <div className="mb-4 flex items-center justify-between shrink-0">
                          <span className="text-sm font-medium text-gray-700">Template OKR Structure</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                           {renderPreviewTree(false, availableFields.map(f=>f.id), false, previewTreeData, addPreviewVisibleColumns, toggleAddPreviewColumn, previewMaximized, setPreviewMaximized)}
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <FolderTree size={48} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium text-gray-500">Please select a template on the left</p>
                      </div>
                    )}
                  </div>
                )}
                {addStep === 2 && (
                  <div className="animate-fade-in">
                    <div className="mb-4">
                       <span className="text-sm font-bold text-gray-700 block">Import Data Preview</span>
                       <span className="text-xs text-gray-500">Preview how nodes will be created on Timeline.</span>
                    </div>
                    {renderPreviewTree(true, addSelectedFields, false, previewTreeData, addPreviewVisibleColumns, toggleAddPreviewColumn, previewMaximized, setPreviewMaximized)}
                  </div>
                )}
                {addStep === 3 && (
                  <div className="animate-fade-in">
                    <div className="mb-4">
                       <span className="text-sm font-bold text-gray-700 block">Final Validation Preview</span>
                       <span className="text-xs text-gray-500">Final OKR structure to be applied.</span>
                    </div>
                    {renderPreviewTree(true, addSelectedFields, true, previewTreeData, addPreviewVisibleColumns, toggleAddPreviewColumn, previewMaximized, setPreviewMaximized)}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
              <div className="text-xs text-gray-500 font-medium">
                {addStep === 2 && `${addSelectedFields.length} of ${availableFields.length} fields selected for import`}
              </div>
              <div className="flex space-x-3 ml-auto">
                <button onClick={() => handleCloseAttempt('add')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                {addStep > 1 && (<button onClick={() => setAddStep(prev => prev - 1)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition">Back</button>)}
                {addStep < 3 ? (
                  <button onClick={handleNextAddStep} disabled={addStep === 1 && !selectedTemplateId} className={`px-4 py-2 rounded-md text-sm font-medium transition shadow-sm ${addStep === 1 && !selectedTemplateId ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-[#2563eb] text-white hover:bg-blue-700'}`}>Continue</button>
                ) : (
                  <button onClick={handleApplyTemplate} className="px-6 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700 transition shadow-sm flex items-center"><Download size={16} className="mr-2" /> Apply to Timeline</button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================================================================================================== */}
      {/* --- MODAL A: SAVE AS TEMPLATE FLOW --- */}
      {/* ================================================================================================== */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[40] flex items-center justify-center p-4 sm:p-6 bg-gray-500/75 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#1e3a8a]">Save as Template</h2>
                <p className="text-xs text-gray-500 mt-1">Create a reusable OKR template from current view</p>
              </div>
              <button onClick={() => handleCloseAttempt('save')} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200"><X size={20} /></button>
            </div>
            <div className="flex border-b border-gray-100 bg-white shrink-0">
              {[1, 2, 3].map(step => (
                <div key={step} className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${saveStep === step ? 'border-blue-600 text-blue-600' : saveStep > step ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-2 ${saveStep === step ? 'bg-blue-600 text-white' : saveStep > step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {saveStep > step ? <Check size={12} /> : step}
                  </div>
                  {step === 1 ? '1. Template Info' : step === 2 ? '2. Field Selection' : '3. Preview & Confirm'}
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-hidden flex bg-gray-50/50">
              <div className="w-1/2 p-6 overflow-y-auto bg-white border-r border-gray-200 custom-scrollbar relative">
                {saveStep === 1 && (
                  <div className="space-y-5 animate-fade-in">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2">Template Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                      <input type="text" maxLength={120} value={formData.title} onChange={(e) => { setFormData({...formData, title: e.target.value}); if(e.target.value) setFormErrors({...formErrors, title: null}); }} placeholder="e.g., Q3 Sales Team Template" className={`w-full p-2 border ${formErrors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-md text-sm focus:outline-none focus:ring-1`} />
                      {formErrors.title && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle size={12} className="mr-1"/>{formErrors.title}</p>}
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the purpose..." className="w-full p-2 border border-gray-300 rounded-md text-sm h-24 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Domain</label><input type="text" value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} placeholder="e.g., Engineering" className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label><input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="e.g., Sales, Quarterly, Focus" className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                  </div>
                )}
                {saveStep === 2 && (
                  <div className="animate-fade-in flex flex-col h-full">
                    <div className="mb-4 shrink-0">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Field Selection</h3>
                      <p className="text-xs text-gray-500 mt-1">Uncheck to skip field — system default value will be used instead.</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center mb-4 shrink-0">
                      <label className="flex items-center font-medium text-sm text-gray-800 cursor-pointer">
                        <input type="checkbox" checked={selectedFields.length === availableFields.length} readOnly className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300" />
                        Select All Fields
                      </label>
                      <span className="text-xs text-gray-500">{selectedFields.length} selected</span>
                    </div>
                    <div className="flex-1 overflow-y-auto border border-gray-200 rounded custom-scrollbar min-h-[200px]">
                      <div className="flex px-2 py-2 bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
                        <div className="w-1/3">Field Name</div>
                        <div className="w-2/3">Description</div>
                      </div>
                      {availableFields.map(field => {
                        const isChecked = selectedFields.includes(field.id);
                        return (
                          <div key={field.id} className="flex px-2 py-3 border-b border-gray-50 hover:bg-gray-50 transition">
                            <div className="w-1/3 flex items-start"><input type="checkbox" checked={isChecked} disabled={field.locked} onChange={() => toggleSaveField(field.id)} className={`mt-1 mr-3 w-4 h-4 rounded border-gray-300 ${field.locked ? 'text-gray-400' : 'text-blue-600 focus:ring-blue-500 cursor-pointer'}`} /><div><span className="font-medium text-sm text-gray-800">{field.label}</span></div></div>
                            <div className="w-2/3 flex flex-col justify-center"><span className={`text-sm ${isChecked ? 'text-gray-600' : 'text-gray-400 line-through'}`}>{field.desc}</span>{!isChecked && <span className="text-[11px] text-orange-500 mt-0.5 italic flex items-center"><Info size={10} className="mr-1"/>Using default</span>}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {saveStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2">Review Summary</h3>
                    <div className="space-y-4">
                      <div><span className="text-xs text-gray-500 block mb-1">Template Title</span><div className="font-medium text-gray-900">{formData.title}</div></div>
                      <div><span className="text-xs text-gray-500 block mb-1">Description</span><div className="text-sm text-gray-700">{formData.description || <span className="text-gray-400 italic">No description provided</span>}</div></div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Fields Mapped</span>
                        <div className="text-sm"><span className="font-medium text-blue-600">{selectedFields.length}</span> out of {availableFields.length} fields will be saved.</div>
                        <div className="mt-2 space-y-2">
                          {selectedFields.length > 0 && (
                            <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                              <span className="font-semibold flex items-center mb-1"><Check size={12} className="mr-1"/> Fields selected ({selectedFields.length}):</span>
                              <div className="flex flex-wrap gap-1">{availableFields.filter(f => selectedFields.includes(f.id)).map(f => <span key={f.id} className="bg-white px-1 py-0.5 rounded border border-green-200 text-green-700">{f.label}</span>)}</div>
                            </div>
                          )}
                          {selectedFields.length < availableFields.length && (
                            <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                              <span className="font-semibold flex items-center mb-1"><AlertTriangle size={12} className="mr-1"/> Fields not selected ({availableFields.length - selectedFields.length}):</span>
                              <div className="flex flex-wrap gap-1">{availableFields.filter(f => !selectedFields.includes(f.id)).map(f => <span key={f.id} className="bg-white px-1 py-0.5 rounded border border-orange-200 text-orange-700">{f.label}</span>)}</div>
                              <p className="mt-1 italic">Will use system default values.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-1/2 p-6 overflow-y-auto bg-gray-50/50 custom-scrollbar border-l border-gray-200">
                {saveStep === 1 && (<div className="animate-fade-in"><div className="mb-4 flex items-center justify-between"><span className="text-sm font-medium text-gray-700">Previewing OKR from current View</span><span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">Total Nodes: 3</span></div>{renderPreviewTree(false, selectedFields, false, previewTreeData, savePreviewVisibleColumns, previewMaximized, setPreviewMaximized)}</div>)}
                {saveStep === 2 && (<div className="animate-fade-in"><div className="mb-4"><span className="text-sm font-medium text-gray-700 block">Field Preview</span><span className="text-xs text-gray-500">Live preview of how unchecking fields affects the template.</span></div>{renderPreviewTree(true, selectedFields, false, previewTreeData, savePreviewVisibleColumns, previewMaximized, setPreviewMaximized)}</div>)}
                {saveStep === 3 && (<div className="animate-fade-in"><div className="mb-4 flex items-center"><CheckSquare size={16} className="text-green-500 mr-2" /><span className="text-sm font-medium text-gray-700">Final Template Structure</span></div>{renderPreviewTree(true, selectedFields, false, previewTreeData, savePreviewVisibleColumns, previewMaximized, setPreviewMaximized)}</div>)}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
              <div className="text-xs text-gray-500">
                {saveStep === 2 && `${selectedFields.length} of ${availableFields.length} fields selected`}
              </div>
              <div className="flex space-x-3 ml-auto">
                <button onClick={() => handleCloseAttempt('save')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                {saveStep > 1 && (<button onClick={() => setSaveStep(prev => prev - 1)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition">Back</button>)}
                {saveStep < 3 ? (<button onClick={handleNextSaveStep} className="px-4 py-2 bg-[#2563eb] text-white rounded-md text-sm font-medium hover:bg-blue-700 transition shadow-sm">Continue</button>) : (<button onClick={handleSaveFinal} className="px-6 py-2 bg-[#16a34a] text-white rounded-md text-sm font-bold hover:bg-green-700 transition shadow-sm flex items-center">Save</button>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================================== */}
      {/* MAIN LAYOUT (Sidebar + Dashboard) */}
      {/* ================================================================================================== */}
      <div className="w-64 border-r border-gray-200 flex flex-col h-full bg-white shrink-0 overflow-y-auto custom-scrollbar relative z-10">
        <div className="h-14 flex items-center px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-lg tracking-wider">
            <div className="w-6 h-6 bg-indigo-600 text-white flex items-center justify-center rounded-full text-xs">X</div>
            <span>XCORP</span>
          </div>
        </div>

        <div className="flex-1 py-2 text-sm">
          <NavItem icon={<AlignLeft size={16} />} label="Workflow" />
          <NavItem icon={<CheckSquare size={16} />} label="Approval" />
          <NavItem icon={<List size={16} />} label="Eisenhower" />
          <NavItem icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <NavItem icon={<Calendar size={16} />} label="Leave" />
          <NavItem icon={<Clock size={16} />} label="Work Tracking" />
          <NavItem icon={<BarChart2 size={16} />} label="Timesheet" />
          <NavItem icon={<Briefcase size={16} />} label="Task Management" hasChevron />
          
          <div className="bg-blue-50/50">
            <div className="flex items-center px-4 py-2 text-blue-600 font-medium cursor-pointer">
              <FolderTree size={16} className="mr-3" />
              <span className="flex-1">OKR Board</span>
              <ChevronDown size={14} />
            </div>
            <div className="flex flex-col pb-2">
              <SubNavItem label="OKR Dashboard" icon={<LayoutDashboard size={14} />} />
              <SubNavItem label="My OKR" icon={<User size={14} />} />
              <SubNavItem label="OKR" active={activeView === 'okr-dashboard'} icon={<BarChart2 size={14} />} onClick={() => setActiveView('okr-dashboard')} />
              <SubNavItem label="OKR Template" isNew active={activeView === 'okr-template'} icon={<FileText size={14} />} onClick={() => setActiveView('okr-template')} />
              <SubNavItem label="OKR Settings" icon={<Settings size={14} />} />
            </div>
          </div>

          <NavItem icon={<FileText size={16} />} label="Document" hasChevron />
          <NavItem icon={<Users size={16} />} label="Organization" hasChevron />
          <NavItem icon={<Settings size={16} />} label="Settings" hasChevron />
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/30">
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white shrink-0">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-gray-500 text-xs">
              <span>XCORP</span><ChevronRight size={12} className="mx-1" /><span>XPERC</span><ChevronRight size={12} className="mx-1" /><span>OKR BOARD</span><ChevronRight size={12} className="mx-1" />
              <span className="font-semibold text-gray-800">{activeView === 'okr-template' ? 'OKR TEMPLATES' : 'OKR'}</span>
            </div>
            {activeView !== 'okr-template' && (
              <>
                <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition">CREATE</button>
                <button className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center hover:bg-indigo-700 transition">
                  <PlayCircle size={14} className="mr-1.5" /> AI OBJECTIVE
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4 text-gray-600">
            <button className="flex items-center text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded bg-gray-50">
              <PlayCircle size={14} className="mr-1.5 text-blue-500" /> START TIMER
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <Search size={18} className="cursor-pointer" />
            <div className="flex items-center cursor-pointer border border-gray-200 px-2 py-1 rounded text-xs">
              <Globe size={14} className="mr-1" /> EN
            </div>
            <Bell size={18} className="cursor-pointer" />
            <div className="w-7 h-7 rounded-full bg-gray-300 overflow-hidden cursor-pointer border border-gray-300">
               <img src="https://i.pravatar.cc/100?img=47" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col space-y-4 relative z-0">
          
          {/* --- OKR BOARD MAIN VIEW --- */}
          {activeView === 'okr-dashboard' && (
            <>
              {/* Metrics Row */}
              <div className="flex space-x-3 overflow-x-auto pb-2 custom-scrollbar">
                {metricsData.map((metric, idx) => (
                  <div key={idx} className={`flex-shrink-0 w-48 border rounded-md p-3 flex flex-col justify-between bg-white shadow-sm ${metric.isSummary ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}>
                    {metric.isSummary ? (
                      <div className="flex items-center justify-center h-full text-blue-800 font-medium">All Metrics</div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-600 font-medium leading-tight line-clamp-2 pr-2">{metric.title}</span>
                          <span className={`text-[10px] font-bold px-1 rounded ${metric.type === 'AVG' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{metric.type}</span>
                        </div>
                        <div>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-xl font-semibold text-gray-800">{metric.value}</span>
                            <span className={`text-xs ${metric.color} flex items-center`}>{metric.change}{metric.changeType === 'up' ? <ArrowUp size={10} className="ml-0.5" /> : <ArrowDown size={10} className="ml-0.5" />}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>Start: {metric.start}</span><span>Expected: {metric.expected}</span></div>
                        </div>
                      </>
                    )}
                    {!metric.isSummary && <div className={`h-1 w-full mt-2 rounded-b-md ${metric.color.replace('text-', 'bg-')}`}></div>}
                  </div>
                ))}
              </div>

              {/* Controls Toolbar (Updated to match mock image) */}
              <div className="flex flex-wrap items-end justify-between gap-3 bg-white p-3 rounded-md border border-gray-200 shadow-sm relative z-20">
                {/* Left Side */}
                <div className="flex items-end space-x-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 mb-1">Filter</span>
                    <button className="flex items-center text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-blue-600 font-medium">
                      <Filter size={14} className="mr-2" /> Filter
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 mb-1">Timeline</span>
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 bg-white cursor-pointer w-24 hover:bg-gray-50">
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 mb-1">Timeline Tree</span>
                    <div style={{width: '240px'}}>
                      <TimelineTreeDropdown selected={selectedPeriod} onSelect={setSelectedPeriod} space={selectedSpace} />
                    </div>
                  </div>

                </div>
                
                {/* Right Side */}
                <div className="flex items-end space-x-4">
                  <div className="flex flex-col relative pb-0.5" style={{zIndex: 25}}>
                    <span className="text-[10px] text-gray-500 mb-1">OKR Template</span>
                    <button onClick={() => {setIsTemplateDropdownOpen(!isTemplateDropdownOpen);}} className="flex items-center text-sm border border-blue-300 bg-blue-50 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors focus:outline-none font-medium">
                      <FileText size={14} className="mr-2" /> OKR Template <ChevronDown size={14} className="ml-2" />
                    </button>
                    {isTemplateDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                        {tableData.length === 0 ? (
                          <button onClick={handleOpenAddModal} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center font-medium"><Plus size={14} className="mr-2 text-green-500" /> Add template</button>
                        ) : (
                          <button onClick={handleOpenAddModal} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center font-medium"><Plus size={14} className="mr-2 text-orange-500" /> Override Template</button>
                        )}
                        <button onClick={handleOpenSaveModal} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center font-medium"><FileText size={14} className="mr-2 text-blue-500" /> Save as template</button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 mb-1">Mode View</span>
                    <div className="flex border border-gray-300 rounded overflow-hidden">
                        <button className="p-1.5 bg-gray-100 border-r border-gray-300"><Columns size={16} className="text-gray-600"/></button>
                        <button className="p-1.5 bg-white hover:bg-gray-50"><List size={16} className="text-gray-400"/></button>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 mb-1">Space</span>
                    <select value={selectedSpace} onChange={e => setSelectedSpace(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 bg-white cursor-pointer w-32 hover:bg-gray-50">
                      {allSpaces.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <div className="relative pb-0.5">
                        <input type="text" placeholder="Search" className="border border-gray-300 rounded pl-3 pr-8 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500" />
                        <Search size={14} className="absolute right-2.5 top-2 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex flex-col pb-0.5">
                    <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-500">
                      <Pin size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* TABLE BOARD */}
              <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-x-auto custom-scrollbar flex-1">
                <div className="min-w-[1200px]">
                  <div className="flex items-center border-b border-gray-200 bg-gray-50 py-2 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                    <div className="w-80 flex items-center"><span>OKR</span><ArrowUp size={12} className="ml-1" /><ArrowDown size={12} /><AlignLeft size={12} className="ml-2" /></div>
                    <div className="w-24">User</div><div className="w-24">Group</div><div className="w-24">Team</div><div className="w-24">Assign To</div><div className="w-32">Metric</div><div className="w-28">M.Name</div><div className="w-32">M.Key</div><div className="w-16">M.Unit</div><div className="w-16">Agg.Type</div><div className="w-24 text-center">Result</div><div className="w-32">Progress</div><div className="w-16 text-center">Risk</div><div className="w-12 text-center">TL</div><div className="w-12 text-center">IC+</div>
                  </div>
                  <div className="flex flex-col text-[11px] bg-white">
                    {tableData.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                         <FolderTree size={40} className="mb-3 opacity-30" />
                         <p className="text-sm font-medium">No OKR data in this Timeline</p>
                         <p className="text-xs mt-1">Use "Add template" button to add sample data here.</p>
                      </div>
                    ) : (
                      tableData.map((row) => (
                        <div key={row.id} className="flex items-center border-b border-gray-100 hover:bg-blue-50/30 py-2 px-4 transition-colors animate-fade-in">
                          <div className="w-80 flex flex-col justify-center" style={{ paddingLeft: `${row.level * 20}px` }}>
                            <div className="flex items-start">
                              {row.isExpanded !== undefined && <ChevronDown size={14} className="mr-1 text-gray-400 shrink-0 mt-0.5" />}
                              {row.level === 0 && <Box size={14} className="mr-1.5 text-blue-500 shrink-0 mt-0.5" />}
                              {row.level === 1 && <span className="text-gray-400 mr-1.5 shrink-0 mt-0.5">↳</span>}
                              {row.level === 2 && <Box size={14} className="mr-1.5 text-green-500 shrink-0 mt-0.5" />}
                              {row.level === 3 && <Box size={14} className="mr-1.5 text-green-400 shrink-0 mt-0.5" />}
                              {row.level === 4 && <User size={14} className="mr-1.5 text-purple-500 shrink-0 mt-0.5" />}
                              <div className="flex flex-col">
                                <span onClick={() => openNodeDetail({ ...row, id: row.id.toString(), description: row.subtitle, timeline: selectedPeriod, type: row.level === 0 ? 'objective' : 'kr', progress: row.progress, mName: row.mName, mKey: row.mKey, mUnit: row.mUnit }, 'view')}
                                  className={`font-medium cursor-pointer hover:text-blue-600 hover:underline ${row.level === 0 ? 'text-blue-600' : 'text-gray-700'} line-clamp-1`}>{row.name}</span>
                                {row.subtitle && <span className="text-[10px] text-gray-400 mt-0.5">{row.subtitle}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="w-24 text-gray-600 flex items-center">{row.user ? <><div className="w-5 h-5 rounded-full bg-gray-200 mr-1.5 overflow-hidden"><img src={`https://i.pravatar.cc/100?img=${(row.id%50) + 10}`} alt="u"/></div>{row.user}</> : <span className="text-gray-300">-</span>}</div>
                          <div className="w-24 text-gray-600">{row.group || <span className="text-gray-300">No Group</span>}</div><div className="w-24 text-gray-600">{row.team || <span className="text-gray-300">No Team</span>}</div><div className="w-24 text-gray-600">{row.assignTo || <span className="text-gray-300">No Group</span>}</div>
                          <div className="w-32 text-gray-600 whitespace-pre-line leading-tight">{row.metric || <span className="text-gray-300">-</span>}</div><div className="w-28 text-gray-600">{row.mName || <span className="text-gray-300">-</span>}</div><div className="w-32 text-gray-600 font-mono text-[10px] truncate">{row.mKey || `M-KEY-${row.id}`}</div><div className="w-16 text-gray-600">{row.mUnit || 'unit'}</div>
                          <div className="w-16"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${row.agg === 'AVG' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{row.agg}</span></div>
                          <div className="w-24 flex items-center justify-center space-x-1"><div className="flex flex-col items-center"><span className="text-[9px] text-gray-400 bg-gray-100 px-1 rounded mb-0.5">S</span><span className="font-medium text-gray-600">{row.resultS || 0}</span></div><div className="text-gray-300">/</div><div className="flex flex-col items-center"><span className="text-[9px] text-blue-400 bg-blue-50 border border-blue-100 px-1 rounded mb-0.5">C</span><span className="font-medium text-blue-600">{row.resultC || 0}</span></div></div>
                          <div className="w-32 pr-4"><div className="flex justify-between items-center mb-1"><span className="text-green-600 font-medium">{row.progress}%</span><span className="text-[9px] text-gray-400">Default</span></div><div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{ width: `${row.progress}%` }}></div></div></div>
                          <div className="w-16 flex flex-col items-center justify-center"><AlertTriangle size={14} className="text-red-500 mb-0.5" /><span className="text-[9px] text-gray-400">{row.risk}</span></div>
                          <div className="w-12 flex justify-center"><div className="flex items-center text-gray-500"><ArrowUp size={12} className="text-green-500 mr-0.5" />{row.tl}</div></div><div className="w-12 flex justify-center text-gray-400">-</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* --- OKR TEMPLATES PAGE (Flow C & D & E) --- */}
          {activeView === 'okr-template' && (
            <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white">
                <div>
                  <h2 className="text-2xl font-bold text-[#1e3a8a] mb-1">OKR Templates</h2>
                  <p className="text-sm text-gray-500">Manage and use available OKR templates</p>
                </div>
                <div className="flex space-x-3 mt-1">
                  <button onClick={handleOpenImportModal} className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                    <UploadCloud size={16} className="mr-2 text-gray-500" /> Import Template
                  </button>
                  <button onClick={handleOpenExportModal} className="flex items-center px-4 py-2 bg-[#2563eb] border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm">
                    <Download size={16} className="mr-2" /> Export Template
                  </button>
                </div>
              </div>
              
              <div className="w-full overflow-x-auto">
                <div className="min-w-[900px]">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-3">TITLE</div><div className="col-span-4">DESCRIPTION</div><div className="col-span-2">DOMAIN/TAGS</div><div className="col-span-1">CREATOR</div><div className="col-span-1">UPDATED DATE</div><div className="col-span-1 text-center">ACTIONS</div>
                  </div>
                  <div className="divide-y divide-gray-100 bg-white">
                    {templateList.map((template) => (
                      <div key={template.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-blue-50/40 transition-colors animate-fade-in group cursor-pointer" onClick={() => handleViewClick(template)}>
                        <div className="col-span-3 font-semibold text-[13px] text-[#1e3a8a] pr-4 leading-tight">{template.title}</div>
                        <div className="col-span-4 text-[13px] text-gray-500 pr-4 line-clamp-2">{template.desc || <span className="italic text-gray-400">Default description</span>}</div>
                        <div className="col-span-2 flex flex-wrap gap-1.5">
                          {template.tags && template.tags.length > 0 ? (
                            template.tags.map(tag => <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">{tag}</span>)
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 border border-gray-200 text-gray-400 italic">Default Tag</span>
                          )}
                        </div>
                        <div className="col-span-1 text-[13px] text-gray-700">{template.creator}</div>
                        <div className="col-span-1 text-[13px] text-gray-600">{template.date}</div>
                        <div className="col-span-1 flex justify-center items-center space-x-4">
                          <button onClick={(e) => { e.stopPropagation(); handleEditClick(template); }} className="text-gray-400 hover:text-orange-500 transition tooltip-trigger" title="Edit"><Edit size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); openDeleteConfirm(template); }} className="text-gray-400 hover:text-red-600 transition tooltip-trigger" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                    {templateList.length === 0 && (
                      <div className="p-8 text-center text-gray-500">No templates yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        @keyframes bounceIn { 0% { transform: scale(0.9); opacity: 0; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .animate-bounce-in { animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}} />
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)

const NavItem = ({ icon, label, hasChevron, active }) => (
  <div className={`flex items-center px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${active ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-600'}`}>
    <span className={`mr-3 ${active ? 'text-blue-600' : 'text-gray-500'}`}>{icon}</span>
    <span className="flex-1 font-medium">{label}</span>
    {hasChevron && <ChevronRight size={14} className="text-gray-400" />}
  </div>
);

const SubNavItem = ({ label, active, icon, isNew, onClick }) => (
  <div onClick={onClick} className={`flex items-center pl-10 pr-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${active ? 'bg-blue-100/50 text-blue-700 font-medium' : 'text-gray-600'}`}>
    {icon && <span className="mr-2 opacity-70">{icon}</span>}
    <span className="flex-1">{label}</span>
    {isNew && <span className="bg-green-100 text-green-600 text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 uppercase">New</span>}
  </div>
);

export default App;