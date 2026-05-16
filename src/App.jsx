import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Menu, ChevronDown, ChevronRight, Search, Globe, Bell, User, Clock,
  Briefcase, CheckSquare, LayoutDashboard, Calendar, BarChart2,
  FolderTree, Users, FileText, Settings, Shield, Package,
  MoreHorizontal, MoreVertical, Filter, Columns, List, Box, PlayCircle, Plus,
  AlertTriangle, ArrowUp, ArrowDown, AlignLeft,
  UploadCloud, Download, Eye, Edit, Trash2, X, Check, Info, AlertCircle,
  Save, XCircle, FileJson, CheckCircle2, XOctagon, Copy, CalendarDays, Pin,
  Maximize2, Minimize2, ArrowUpCircle, MessageSquare, Clipboard, Target
} from 'lucide-react';

const TREE_COLUMNS = [
  { id: 'description', label: 'Description', width: 'w-44' },
  { id: 'user', label: 'User', width: 'w-32' },
  { id: 'group', label: 'Group', width: 'w-28' },
  { id: 'team', label: 'Team', width: 'w-32' },
  { id: 'assign_to', label: 'Assign To', width: 'w-28' },
  { id: 'metric', label: 'Metric', width: 'w-28' },
  { id: 'metric_name', label: 'Metric Name', width: 'w-28' },
  { id: 'metric_key', label: 'Metric Key', width: 'w-28' },
  { id: 'metric_unit', label: 'Metric Unit', width: 'w-28' },
  { id: 'agg', label: 'Aggregation Type', width: 'w-28' },
  { id: 'result', label: 'Result', width: 'w-28' },
  { id: 'progress', label: 'Progress', width: 'w-36' },
  { id: 'risk_level', label: 'Risk Level', width: 'w-28' },
  { id: 'timeline', label: 'Timeline', width: 'w-28' },
  { id: 'timeline_view_metric', label: 'TL - View Metric', width: 'w-28' },
  { id: 'status', label: 'Status', width: 'w-16' },
];

const DEFAULT_VISIBLE_COLUMNS = ['description', 'user', 'metric', 'progress', 'status'];

const COL_WIDTH_MAP = {
  description: '176px', user: '128px', group: '112px', team: '128px', assign_to: '112px',
  metric: '112px', metric_name: '112px', metric_key: '112px', metric_unit: '112px',
  agg: '112px', result: '112px', progress: '144px', risk_level: '112px',
  timeline: '112px', timeline_view_metric: '112px', status: '64px'
};

const getGridTemplate = (visibleColumns) => {
  const cols = TREE_COLUMNS
    .filter(c => visibleColumns.includes(c.id))
    .map(c => COL_WIDTH_MAP[c.id] || '120px')
    .join(' ');
  return `minmax(200px, 360px) ${cols}`;
};

const isCenteredCol = (id) => ['metric', 'agg', 'result', 'progress', 'risk_level', 'status', 'timeline_view_metric'].includes(id);

const tableToTreeArray = (tableData) => {
  const treeArray = [];
  const stack = [];
  tableData.forEach(row => {
    while (stack.length > row.level) stack.pop();
    const node = {
      id: row.id?.toString() || `N${Date.now()}`,
      originalId: row.id,
      type: row.level === 0 ? 'objective' : 'kr',
      name: row.name || '', description: row.subtitle || '',
      user: row.user || '', group: row.group || '', team: row.team || '',
      metric: row.metric || '', agg: row.agg || 'SUM',
      progress: row.progress?.toString() || '0%',
      timeline: row.tl?.toString() || '',
      children: []
    };
    if (row.level === 0) {
      treeArray.push(node);
      stack[0] = node;
    } else {
      const parent = stack[row.level - 1];
      if (parent) { parent.children.push(node); stack[row.level] = node; }
    }
  });
  return treeArray;
};

// --- COMPONENTS ---
// 0. Disclaimer Note Component
const DisclaimerNote = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 mt-4">
      <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
      <p className="text-xs text-amber-700">
        <strong>Lưu ý:</strong> Các dữ liệu mang tính chất minh họa, tham khảo tài liệu chức năng để nắm rõ hơn. Giao diện chỉ mang tính chất minh họa, chức năng thực tế sẽ bám sát giao diện của hệ thống gốc XCORP.
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
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1 w-40 max-h-[260px] overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 sticky top-0 bg-white z-10">Show Columns</div>
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

// 0.1 Full-Screen Window Component (opens real separate browser popup via portal)
const FullScreenWindow = ({ children, onClose }) => {
  const [container, setContainer] = useState(null);
  const stateRef = useRef({});
  const scrollPosRef = useRef(0);

  useEffect(() => {
    const w = Math.round(window.screen.width * 0.7);
    const h = Math.round(window.screen.height * 0.7);
    const left = Math.round((window.screen.width - w) / 2);
    const top = Math.round((window.screen.height - h) / 2);

    const win = window.open(
      '', '_blank',
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!win || win.closed) {
      onClose?.();
      return;
    }

    stateRef.current = { win, closing: false };
    win.document.title = 'OKR Tree Preview (Full Screen)';

    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
      try { win.document.head.appendChild(el.cloneNode(true)); } catch (e) {}
    });

    win.document.body.style.margin = '0';
    win.document.body.style.padding = '0';
    win.document.body.style.overflow = 'hidden';
    win.document.body.style.backgroundColor = '#f9fafb';
    win.document.body.style.height = '100vh';

    const div = win.document.createElement('div');
    div.style.width = '100vw';
    div.style.height = '100vh';
    div.style.overflow = 'auto';
    win.document.body.appendChild(div);

    const done = new Promise(resolve => setTimeout(resolve, 0));
    done.then(() => setContainer(div));

    const timer = setInterval(() => {
      try {
        if (win.closed && !stateRef.current.closing) {
          stateRef.current.closing = true;
          clearInterval(timer);
          onClose?.();
        }
      } catch (e) {}
    }, 500);

    return () => {
      clearInterval(timer);
      stateRef.current.closing = true;
      const delay = new Promise(r => setTimeout(r, 100));
      delay.then(() => { try { if (!win.closed) win.close(); } catch (e) {} });
    };
  }, []);

  if (!container) return null;

  return createPortal(
    <div onScroll={(e) => { scrollPosRef.current = e.target.scrollTop; }}>
      {children}
    </div>,
    container
  );

  // Restore scroll position after re-renders
  useEffect(() => {
    const el = container?.querySelector?.('div');
    if (el && scrollPosRef.current > 0) {
      el.scrollTop = scrollPosRef.current;
    }
  });
};

// 0.2 OKR Tree Preview Component (Reusable)
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
  const gridCols = getGridTemplate(visibleColumns);

  const maximized = onMaximizeChange ? isMaximized : localMaximized;
  const setMaximized = onMaximizeChange || setLocalMaximized;

  const getFieldValue = (node, fieldId) => {
    if (fieldId === 'progress') fieldId = 'progress_percent';
    if (!selectedFields.includes(fieldId) && !selectedFields.includes('progress')) {
      const defaults = {
        'description': 'Default description', 'user': 'Unassigned',
        'group': 'Default Group', 'team': 'Default Team',
        'assign_to': 'Unassigned', 'metric': 'Default Metric',
        'metric_name': 'Default', 'metric_key': 'Default', 'metric_unit': 'Default',
        'agg': 'SUM', 'result': 'Default', 'progress_percent': '0%',
        'risk_level': 'Low', 'timeline_view_metric': 'Default'
      };
      return defaults[fieldId] || 'Default';
    }
    
    const fieldMap = {
      'description': node.description, 'user': node.assign || node.user,
      'group': node.group, 'team': node.team,
      'assign_to': node.assign || node.user,
      'metric': node.metric,
      'metric_name': node.mName || node.metricName,
      'metric_key': node.mKey || node.metricKey,
      'metric_unit': node.mUnit || node.metricUnit,
      'agg': node.agg, 'result': node.result,
      'progress_percent': node.progress,
      'risk_level': node.risk,
      'timeline_view_metric': 'Default'
    };
    
    return fieldMap[fieldId] || 'Default';
  };

  const toggleCollapse = (id) => {
    setCollapsedObjectives(prev => ({...prev, [id]: !prev[id]}));
  };

  const renderCell = (node, colId) => {
    switch (colId) {
      case 'description':
        return <span className="truncate">{node.description || 'Default'}</span>;
      case 'user':
        return <span className="truncate">{getFieldValue(node, 'user')}</span>;
      case 'group':
        return <span className="truncate">{node.group || 'Default'}</span>;
      case 'team':
        return <span className="truncate">{getFieldValue(node, 'team')}</span>;
      case 'assign_to':
        return <span className="truncate">{node.assign || node.user || 'Default'}</span>;
      case 'metric':
        return (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${selectedFields.includes('metric') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 italic'}`}>
            {getFieldValue(node, 'metric')}
          </span>
        );
      case 'metric_name':
        return <span className="truncate">{node.mName || node.metricName || 'Default'}</span>;
      case 'metric_key':
        return <span className="truncate">{node.mKey || node.metricKey || 'Default'}</span>;
      case 'metric_unit':
        return <span className="truncate">{node.mUnit || node.metricUnit || 'Default'}</span>;
      case 'agg':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-medium">{node.agg || 'SUM'}</span>;
      case 'result':
        return <span className="truncate">{node.result ?? 'Default'}</span>;
      case 'progress': {
        const pct = selectedFields.includes('progress') || selectedFields.includes('progress_percent') ? getFieldValue(node, 'progress_percent') : '0%';
        const pctStr = typeof pct === 'string' ? pct : (pct || '0') + '%';
        const pctNum = parseInt(pctStr.replace('%', ''));
        const pctColor = pctNum >= 100 ? '#77be79' : pctNum >= 50 ? '#5e9af8' : '#f1a404';
        return (
          <div className="flex items-center gap-1">
            <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pctNum}%`, backgroundColor: pctColor }}></div>
            </div>
            <span className="text-[10px] font-medium" style={{ color: pctColor }}>{pctStr}</span>
          </div>
        );
      }
      case 'risk_level':
        return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${node.risk === 'high' ? 'bg-red-100 text-red-600' : node.risk === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{node.risk || 'Low'}</span>;
      case 'timeline':
        return <span className="truncate">{node.timeline || 'Default'}</span>;
      case 'timeline_view_metric':
        return <span className="text-[10px] text-gray-500 italic">Default</span>;
      case 'status':
        return (
          <div className="flex justify-center">
            {node.status === 'valid' && <CheckCircle2 size={14} className="inline text-green-600" />}
            {node.status === 'warning' && <AlertTriangle size={14} className="inline text-amber-600" />}
            {node.status === 'error' && <XOctagon size={14} className="inline text-red-600" />}
          </div>
        );
      default:
        return null;
    }
  };

  const renderNode = (node, level = 0, objId = null) => {
    const isObjective = node.type === 'objective';
    const hasWarning = node.status === 'warning';
    const hasDuplicate = node.status === 'duplicate';
    const hasError = node.status === 'error';
    const isCollapsed = objId && collapsedObjectives[objId];

    return (
      <React.Fragment key={node.id}>
        <div onClick={() => onNodeClick && onNodeClick(node)} className={`border-b border-gray-100 py-1.5 px-2 hover:bg-blue-50/30 transition-colors ${onNodeClick ? 'cursor-pointer' : ''} ${hasError ? 'bg-red-50/40' : hasDuplicate ? 'bg-orange-50/40' : hasWarning ? 'bg-amber-50/40' : ''}`}
          style={{ display: 'grid', gridTemplateColumns: gridCols, alignItems: 'center' }}
        >
          <div className="flex items-center gap-1 truncate" style={{ paddingLeft: `${6 + level * 16}px` }}>
            {isObjective && (
              <button onClick={(e) => { e.stopPropagation(); objId && toggleCollapse(objId); }} className="p-0.5 hover:bg-gray-200 rounded shrink-0">
                <ChevronRight size={10} className={`text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
              </button>
            )}
            {!isObjective && <div className="w-3 shrink-0"></div>}
            {isObjective ? (() => { const il = node.level ?? 1; if (il === 1) return <Box size={11} className="text-blue-500 shrink-0" />; if (il === 2) return <span className="text-gray-400 shrink-0 leading-none">↳</span>; if (il === 3) return <Box size={11} className="text-green-500 shrink-0" />; return <User size={11} className="text-purple-500 shrink-0" />; })() : (
              <div className="w-1 h-1 rounded-full bg-green-500 shrink-0"></div>
            )}
            <span className={`text-[11px] font-medium truncate ${isObjective ? 'text-blue-600' : hasError ? 'text-red-600' : hasDuplicate ? 'text-orange-600' : hasWarning ? 'text-amber-600' : 'text-gray-700'}`}>
              {node.name}
            </span>
            {(node.warnMsg || node.errorMsg) && <span className="relative group inline-flex" onDoubleClick={() => alert(node.warnMsg || node.errorMsg)} title={node.warnMsg || node.errorMsg}><p className={`text-[10px] italic truncate max-w-[120px] ${hasError ? 'text-red-600' : hasDuplicate ? 'text-orange-600' : 'text-amber-600'}`}>{node.warnMsg || node.errorMsg}</p><div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-50 pointer-events-none"><div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-normal break-words max-w-[260px] max-h-[120px] overflow-y-auto">{node.warnMsg || node.errorMsg}</div></div></span>}
          </div>

          {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
            <div key={col.id} className={`px-1.5 text-[10px] text-gray-600 ${isCenteredCol(col.id) ? 'text-center' : 'text-left'} overflow-hidden truncate`}>
              {renderCell(node, col.id)}
            </div>
          ))}
        </div>
        {isObjective && !isCollapsed && treeData.krs && treeData.krs.map(kr => renderNode(kr, 1, objId))}
      </React.Fragment>
    );
  };

  const objId = treeData.objective?.id || 'obj-root';

  const treeContent = (
    <div className="flex flex-col h-full min-h-0">
      <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
          <div className="min-w-[400px]">
            <div className="bg-gray-50 border-b border-gray-200 py-1 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10"
                 style={{ display: 'grid', gridTemplateColumns: gridCols + ' auto', alignItems: 'center' }}>
              <div className="bg-gray-50 truncate" style={{ paddingLeft: '2px' }}>Node</div>
              {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                <div key={col.id} className={`px-1.5 ${isCenteredCol(col.id) ? 'text-center' : 'text-left'} bg-gray-50 truncate`}>{col.label}</div>
              ))}
              <div className="flex items-center gap-0.5" style={{ justifySelf: 'end' }}>
                {onToggleColumn && <ColumnToggle visibleColumns={visibleColumns} onToggle={onToggleColumn} />}
                {maximizable && (
                  <button onClick={() => setMaximized(!maximized)} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title={maximized ? 'Minimize' : 'Maximize'}>
                    {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                )}
              </div>
            </div>
            {treeData.objective && renderNode(treeData.objective, 0, objId)}
          </div>
        </div>
      </div>
      {showDisclaimer && <div className="text-[10px] text-gray-400 italic mt-0.5 px-1 shrink-0">Các dữ liệu mang tính chất minh họa, tham khảo tài liệu chức năng để nắm rõ hơn.</div>}
    </div>
  );

    if (maximized) {
      return (
        <FullScreenWindow onClose={() => setMaximized(false)}>
          {treeContent}
        </FullScreenWindow>
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
    <div className="flex items-center justify-center w-full py-3 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between w-[50%] max-w-xl relative">
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
  useEffect(() => { try { const p = new URLSearchParams(window.location.search); const v = p.get('view'); if (v && ['okr-dashboard','okr-template'].includes(v)) { setActiveView(v); window.history.replaceState({}, '', window.location.pathname); } } catch(e) {} }, []);
  
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
  const loadPersistedOkrData = () => { try { const s = localStorage.getItem('okrDataMap'); if (s) return JSON.parse(s); } catch (e) {} return null; };
  const initialOkrData = loadPersistedOkrData() || initOkrDataMap(allSpaces, timelineTreeBySpace);
  const [okrDataMap, setOkrDataMap] = useState(initialOkrData);
  useEffect(() => { try { localStorage.setItem('okrDataMap', JSON.stringify(okrDataMap)); } catch (e) {} }, [okrDataMap]);

  const getMaxLevel = (data) => data.reduce((max, r) => Math.max(max, r.level), 0);
  const isPersonalLevel = (level) => level >= 3;
  const getLevelCategory = (level) => { if (level === 0) return 'company'; if (level === 1) return 'team'; if (level === 2) return 'group'; return 'personal'; };
  const mapTreeToTableDeep = (treeArray, baseLevel = 0) => { let result = []; let counter = Date.now(); const flatten = (nodes, level) => { nodes.forEach(node => { const el = (node.level !== undefined && node.level !== null) ? (node.level - 1) : level; result.push({ id: counter++, level: el, name: node.name, subtitle: node.description, user: node.user, group: node.group, team: node.team, assignTo: node.team, metric: node.metric, agg: node.agg, progress: parseInt(node.progress) || 0, risk: 'high', tl: 1, isExpanded: true }); if (node.children && node.children.length > 0) flatten(node.children, el + 1); }); }; flatten(treeArray, baseLevel); return result; };

  const urlParams = new URLSearchParams(window.location.search);
  const isBranchAddMode = urlParams.get('branchAddTemplate') === 'true';
  const isSaveAsMode = urlParams.get('saveAsTemplate') === 'true';
  const [branchInfo, setBranchInfo] = useState(null);
  const [branchAddStep, setBranchAddStep] = useState(1);
  const [branchSelectedTemplateId, setBranchSelectedTemplateId] = useState(null);
  const [branchAddSearchQuery, setBranchAddSearchQuery] = useState('');
  const [branchError, setBranchError] = useState(null);
  const [branchDuplicateConfirm, setBranchDuplicateConfirm] = useState(null);
  const handleBranchDuplicateForce = () => { setBranchDuplicateConfirm({ ...branchDuplicateConfirm, force: true }); setTimeout(() => handleBranchApplyTemplate(), 0); };

  const redirectClean = () => { window.location.href = window.location.origin + window.location.pathname; };
  const navigateView = (view) => {
    if (isBranchAddMode || isSaveAsMode) {
      window.location.href = window.location.origin + window.location.pathname + '?view=' + view;
    } else {
      setActiveView(view);
    }
  };

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
    { id: 'O1', level: 3, type: 'objective', name: 'Increase Enterprise Revenue to $10M', children: [ { id: 'KR1.1', level: 4, type: 'kr', name: 'Achieve $5M ARR in US Market' }, { id: 'KR1.2', level: 4, type: 'kr', name: 'Close 50 Enterprise deals globally' }, { id: 'KR1.3', level: 4, type: 'kr', name: 'Reduce enterprise churn rate to < 5%' } ] },
    { id: 'O2', level: 3, type: 'objective', name: 'Launch New V2 Platform Infrastructure', children: [ { id: 'KR2.1', level: 4, type: 'kr', name: 'Release Beta to 1000 users' }, { id: 'KR2.2', level: 4, type: 'kr', name: 'Achieve 99.99% system uptime' } ] }
  ];
  const engTreeData = [
    { id: 'O1', level: 1, type: 'objective', name: 'Accelerate Platform Modernization', children: [ { id: 'KR1.1', level: 2, type: 'kr', name: 'Migrate 80% of APIs to new gateway' }, { id: 'KR1.2', level: 2, type: 'kr', name: 'Reduce avg response time to < 200ms' }, { id: 'KR1.3', level: 2, type: 'kr', name: 'Achieve 99.99% uptime for core services' } ] }
  ];
  const productTreeData = [
    { id: 'O1', level: 2, type: 'objective', name: 'Deliver V2 Product Experience', children: [ { id: 'KR1.1', level: 3, type: 'kr', name: 'Launch 12 new UI components' }, { id: 'KR1.2', level: 3, type: 'kr', name: 'Achieve NPS score of 45+' } ] },
    { id: 'O2', level: 2, type: 'objective', name: 'Improve User Onboarding Flow', children: [ { id: 'KR2.1', level: 3, type: 'kr', name: 'Increase onboarding completion to 80%' } ] }
  ];
  const arrowHighTreeData = [ { id: 'AR1', level: 2, type: 'objective', name: 'Optimize Team Productivity', children: [ { id: 'AR1.1', level: 3, type: 'kr', name: 'Reduce meeting time by 30%' }, { id: 'AR1.2', level: 3, type: 'kr', name: 'Achieve 90% tool adoption' } ] } ];
  const greenHighTreeData = [ { id: 'GR1', level: 3, type: 'objective', name: 'Enhance Personal Development', children: [ { id: 'GR1.1', level: 4, type: 'kr', name: 'Complete 20 training modules' }, { id: 'GR1.2', level: 4, type: 'kr', name: 'Conduct 3 cross-team workshops' } ] } ];

  const loadTemplateList = () => {
    try { const s = localStorage.getItem('templateList'); if (s) { const d = JSON.parse(s); if (Array.isArray(d) && d.length > 0) return d; } } catch (e) {}
    return [
      { id: 1, title: 'HR Performance Template', desc: 'Template with green cube and personal level nodes', tags: ['HR', 'Performance'], creator: 'Duc Le', date: '2025-05-08', tree: JSON.parse(JSON.stringify(sampleTreeData)) },
      { id: 2, title: 'Engineering Sprint Template', desc: 'Template with blue cube and arrow level nodes', tags: ['Engineering'], creator: 'Minh Nguyen', date: '2025-05-07', tree: JSON.parse(JSON.stringify(engTreeData)) }, 
      { id: 3, title: 'Product Quality Template', desc: 'Template with arrow and green cube level nodes', tags: ['Product', 'Quality', 'UX'], creator: 'Hoa Pham', date: '2025-05-06', tree: JSON.parse(JSON.stringify(productTreeData)) },
      { id: 4, title: 'Team Productivity Template', desc: 'Team-level OKR template with arrow as highest level', tags: ['Team', 'Productivity'], creator: 'Lan Nguyen', date: '2025-05-15', tree: JSON.parse(JSON.stringify(arrowHighTreeData)) },
      { id: 5, title: 'Personal Growth Template', desc: 'Personal/group-level OKR template with green cube as highest level', tags: ['Personal', 'Growth'], creator: 'Duc Le', date: '2025-05-15', tree: JSON.parse(JSON.stringify(greenHighTreeData)) },
    ];
  };
  const [templateList, setTemplateList] = useState(loadTemplateList);
  useEffect(() => { try { localStorage.setItem('templateList', JSON.stringify(templateList)); } catch (e) {} }, [templateList]);

  const previewTreeData = {
    objective: { id: 'O1', type: 'objective', name: 'Increase Enterprise Revenue to $10M', description: 'Drive Q3 revenue growth focusing on Tier 1 clients', user: 'Duc Le', group: 'Sales', team: 'Global Sales', metric: 'Revenue', agg: 'SUM' },
    krs: [
      { id: 'KR1.1', type: 'kr', name: 'Achieve $5M ARR in US Market', description: 'Target top 100 Fortune companies', user: 'Ngan Vu', group: 'Sales', team: 'US Sales', metric: 'Revenue', agg: 'SUM', progress: '75', timeline: 'Q3 2025' },
      { id: 'KR1.2', type: 'kr', name: 'Close 50 Enterprise deals globally', description: 'Avg deal size > $100k', user: 'Duy Nguyen', group: 'Sales', team: 'Global Sales', metric: 'Deals', agg: 'COUNT', progress: '60', timeline: 'Q3 2025' }
    ]
  };

  const availableFields = [
    { id: 'name', label: 'Name (Title)', type: 'string', desc: 'OKR title / name shown in dashboard', locked: true },
    { id: 'description', label: 'Description', type: 'string', desc: 'Optional text description for the OKR node' },
    { id: 'user', label: 'User', type: 'string', desc: 'Owner of this OKR node' },
    { id: 'group', label: 'Group', type: 'string', desc: 'Organizational group for this OKR' },
    { id: 'team', label: 'Team', type: 'string', desc: 'Assigned team' },
    { id: 'assign_to', label: 'Assign To', type: 'string', desc: 'Person assigned to this OKR' },
    { id: 'metric', label: 'Metric', type: 'string', desc: 'Measurement metric' },
    { id: 'metric_name', label: 'Metric Name', type: 'string', desc: 'Name of the metric' },
    { id: 'metric_key', label: 'Metric Key', type: 'string', desc: 'Key identifier for the metric' },
    { id: 'metric_unit', label: 'Metric Unit', type: 'string', desc: 'Unit of measurement' },
    { id: 'agg', label: 'Aggregation Type', type: 'string', desc: 'SUM / AVG aggregation' },
    { id: 'result', label: 'Result', type: 'string', desc: 'Result value of the metric' },
    { id: 'progress', label: 'Progress', type: 'number', desc: 'Completion percentage, computed by system' },
    { id: 'risk_level', label: 'Risk Level', type: 'string', desc: 'Risk level indicator, read-only' },
    { id: 'timeline_view_metric', label: 'Timeline - View Metric', type: 'string', desc: 'View metric timeline data' },
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

  // --- STATES FLOW A & A' (save-as tab) ---
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveStep, setSaveStep] = useState(1);
  const [formData, setFormData] = useState({ title: '', description: '', domain: '', tags: '' });
  const [formErrors, setFormErrors] = useState({});
  const [selectedFields, setSelectedFields] = useState(availableFields.map(f => f.id));
  const [savePreviewVisibleColumns, setSavePreviewVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);
  const [saveAsStep, setSaveAsStep] = useState(1);
  const [saveAsSelectedNodeIds, setSaveAsSelectedNodeIds] = useState(new Set());
  const [saveAsFormData, setSaveAsFormData] = useState({ title: '', description: '', domain: '', tags: '' });
  const [saveAsFormErrors, setSaveAsFormErrors] = useState({});
  const [saveAsSelectedFields, setSaveAsSelectedFields] = useState(availableFields.map(f => f.id));
  const [saveAsPreviewVisibleColumns, setSaveAsPreviewVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);
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
  const [viewTreeMaximized, setViewTreeMaximized] = useState(false);
  const [editTreeMaximized, setEditTreeMaximized] = useState(false);
  const [viewTreeVisibleColumns, setViewTreeVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);
  const [viewCollapsedObjs, setViewCollapsedObjs] = useState({});
  const [nodeDetailConfig, setNodeDetailConfig] = useState({ isOpen: false, mode: 'view', data: null, path: [] });
  const [nodeDetailTab, setNodeDetailTab] = useState('detail');
  const [nodeDetailTopTab, setNodeDetailTopTab] = useState('general');
  const [nodeDetailBottomTab, setNodeDetailBottomTab] = useState('comment'); 
  const [editingNodeData, setEditingNodeData] = useState(null);
  
  const [actionDropdown, setActionDropdown] = useState(null);
  const [isBranchSelectOpen, setIsBranchSelectOpen] = useState(false);
  const [selectedBranchRowId, setSelectedBranchRowId] = useState(null);
  const handleConfirmBranchSelect = () => { if (selectedBranchRowId === null) return; const row = tableData.find(r => r.id === selectedBranchRowId); if (!row) return; setIsBranchSelectOpen(false); setSelectedBranchRowId(null); handleOpenBranchAdd(row); };

  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [selectedSpaceForUse, setSelectedSpaceForUse] = useState('Engineering');
  const [selectedTimelineForUse, setSelectedTimelineForUse] = useState('Quarter 3, 2025');
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);

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
  const [editTreeVisibleColumns, setEditTreeVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);
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
    try {
      const saveCtx = { space: selectedSpace, year: selectedYear, period: selectedPeriod, tableData };
      localStorage.setItem('saveAsTemplate', JSON.stringify(saveCtx));
    } catch (e) { triggerToast('Failed to open save template.', 'error'); return; }
    window.open(window.location.origin + window.location.pathname + '?saveAsTemplate=true', '_blank');
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

  // --- HANDLERS: FLOW A' (SAVE AS TAB) ---
  const [saveAsTreeData, setSaveAsTreeData] = useState([]);
  useEffect(() => {
    if (isSaveAsMode) {
      try {
        const s = localStorage.getItem('saveAsTemplate');
        if (s) {
          const ctx = JSON.parse(s);
          const tree = tableToTreeArray(ctx.tableData || []);
          setSaveAsTreeData(tree);
          const allIds = []; const collect = (nodes) => { nodes.forEach(n => { allIds.push(n.id); if (n.children) collect(n.children); }); }; collect(tree);
          setSaveAsSelectedNodeIds(new Set(allIds));
        }
      } catch (e) {}
    }
  }, [isSaveAsMode]);

  const getAllDescendantIds = (nodes) => {
    const ids = [];
    const walk = (list) => { list.forEach(n => { ids.push(n.id); if (n.children) walk(n.children); }); };
    walk(nodes);
    return ids;
  };

  const findTreeNode = (nodes, id) => { for (const n of nodes) { if (n.id === id) return n; if (n.children) { const f = findTreeNode(n.children, id); if (f) return f; } } return null; };

  const handleSaveAsToggleNode = (nodeId) => {
    setSaveAsSelectedNodeIds(prev => {
      const next = new Set(prev);
      const node = findTreeNode(saveAsTreeData, nodeId);
      if (!node) return prev;
      const all = getAllDescendantIds([node]);
      if (prev.has(nodeId)) all.forEach(id => next.delete(id));
      else all.forEach(id => next.add(id));
      return next;
    });
  };

  const handleSaveAsSelectAll = () => {
    setSaveAsSelectedNodeIds(new Set(getAllDescendantIds(saveAsTreeData)));
  };

  const handleSaveAsDeselectAll = () => {
    setSaveAsSelectedNodeIds(new Set());
  };

  const handleNextSaveAsStep = () => {
    if (saveAsStep === 1) {
      if (!saveAsFormData.title.trim()) {
        setSaveAsFormErrors({ title: 'Please enter template name.' });
        return;
      }
      if (saveAsSelectedNodeIds.size === 0) {
        triggerToast('Please select at least one OKR node to save.', 'error');
        return;
      }
      setSaveAsFormErrors({});
    }
    setSaveAsStep(prev => Math.min(prev + 1, 3));
  };

  const toggleSaveAsField = (fieldId) => {
    if (fieldId === 'name') return;
    setSaveAsSelectedFields(prev => prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]);
  };

  const handleSaveAsSubmit = () => {
    try {
      const newTags = saveAsFormData.tags ? saveAsFormData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      if (saveAsFormData.domain) newTags.unshift(saveAsFormData.domain);
      let finalTitle = saveAsFormData.title;
      if (templateList.some(t => t.title === finalTitle)) {
        finalTitle = `${finalTitle}_(1)`;
      }
      const hasSelectedDesc = (node) => saveAsSelectedNodeIds.has(node.id) || (node.children && node.children.some(c => hasSelectedDesc(c)));
      const countSelected = (nodes) => nodes.reduce((s, n) => s + 1 + (n.children ? countSelected(n.children) : 0), 0);
      const filterTree = (nodes) => nodes.filter(n => hasSelectedDesc(n)).map(n => ({ ...n, children: n.children ? filterTree(n.children) : [] }));
      const savedTree = filterTree(saveAsTreeData);
      const savedCount = countSelected(savedTree);
      console.log('=== SAVE AS DEBUG ===', { selectedCount: saveAsSelectedNodeIds.size, savedCount, saveAsSelectedNodeIds: [...saveAsSelectedNodeIds], savedTree });
      const newTemplate = {
        id: Date.now(),
        title: finalTitle,
        desc: saveAsFormData.description,
        tags: newTags,
        creator: 'Current User',
        date: new Date().toISOString().split('T')[0],
        tree: savedTree
      };
      setTemplateList([newTemplate, ...templateList]);
      try { localStorage.setItem('templateList', JSON.stringify([newTemplate, ...templateList])); } catch(e) {}
      window.location.href = window.location.origin + window.location.pathname + '?view=okr-template';
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

  const executeApplyToBoard = (treeArray, targetPeriod, targetSpace, overrideMode = false) => {
    const newData = mapTreeToTable(treeArray);
    const targetKey = `${targetSpace}|2025|${targetPeriod}`;
    const cleanNode = (node) => ({
      ...node,
      progress: '0%',
      risk: 'low',
      result: 0,
      status: 'valid',
      warnMsg: null,
      errorMsg: null,
    });
    const cleanData = newData.map(cleanNode);

    setOkrDataMap(prev => {
      if (overrideMode) {
        return { ...prev, [targetKey]: cleanData.map(r => ({ ...r, id: Date.now() + Math.random() })) };
      }
      const existing = prev[targetKey] || [];
      const merged = [...existing];
      const existingNames = new Set(existing.map(r => r.name));
      cleanData.forEach(row => {
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
    const added = cleanData.length;
    triggerToast(`Template ${overrideMode ? 'overridden' : 'applied'} to ${targetSpace} - ${targetPeriod}. ${added} nodes ${overrideMode ? 'replaced' : 'added'}.`);
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
  
  const toggleImportTreeColumn = (colId) => {
    setImportTreeVisibleColumns(prev => prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]);
  };

  const toggleEditTreeColumn = (colId) => {
    setEditTreeVisibleColumns(prev => prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]);
  };
  
  const closeViewModal = () => {
    setViewTarget(null);
    setNodeDetailConfig({ isOpen: false, mode: 'view', data: null, path: [] });
    setViewCollapsedObjs({});
  };
  
  const openNodeDetail = (nodeData, mode, path = [], onSave = null) => {
    setEditingNodeData({...nodeData});
    setNodeDetailConfig({ isOpen: true, mode, data: nodeData, path, onSave });
    setNodeDetailTab('detail');
    setNodeDetailBottomTab('comment');
  };
  const closeNodeDetail = () => {
    setNodeDetailConfig({ isOpen: false, mode: 'view', data: null, path: [], onSave: null });
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
    executeApplyToBoard(viewTarget.tree, selectedTimelineForUse, selectedSpaceForUse, showOverrideConfirm);
    setShowOverrideConfirm(false);
    setIsTimelineModalOpen(false);
    closeViewModal();
  };

  const handleEditClick = (template) => {
    setEditTargetId(template.id);
    setEditFormData({ title: template.title || '', desc: template.desc || '', tags: (template.tags || []).join(', ') });
    setEditTreeData(JSON.parse(JSON.stringify(template.tree)) || []); 
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
      setEditFormErrors(prev => ({...prev, general: null}));
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
      if (newTree.length === 0) {
        setEditFormErrors(prev => ({...prev, general: 'Template must have at least 1 Objective.'}));
      }
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
    if (nodeDetailConfig.onSave) {
      nodeDetailConfig.onSave(editingNodeData, nodeDetailConfig.path);
      closeNodeDetail();
      return;
    }
    const newTree = [...editTreeData];
    const path = nodeDetailConfig.path; 
    if (path.length === 1) newTree[path[0]] = {...newTree[path[0]], ...editingNodeData};
    else if (path.length === 2) newTree[path[0]].children[path[1]] = {...newTree[path[0]].children[path[1]], ...editingNodeData};
    setEditTreeData(newTree);
    closeNodeDetail();
    triggerToast('Node changes saved.');
  };

  const handleSaveTemplateChanges = () => {
    if (!editFormData.title.trim()) { setEditFormErrors({ title: 'Template name must not be empty.' }); return; }
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

  const handleCloseAttempt = (type) => {
    const steps = { import: importStep, export: exportStep, add: addStep, save: saveStep };
    const canClose = { import: importFileStatus === 'idle', export: exportStep === 1 && exportSelectedTemplates.length === 0, add: addStep === 1 && !selectedTemplateId, save: saveStep === 1 && !formData.title.trim() };
    if (canClose[type]) {
      if (type === 'import') { setIsImportModalOpen(false); setImportFileStatus('idle'); setImportStep(1); }
      else if (type === 'export') { setIsExportModalOpen(false); setExportStep(1); setExportSelectedTemplates([]); }
      else if (type === 'add') { setIsAddModalOpen(false); setAddStep(1); setSelectedTemplateId(null); }
      else if (type === 'save') { setIsSaveModalOpen(false); setSaveStep(1); setFormData({ title: '', desc: '', tags: '' }); }
    } else {
      setConfirmCloseTarget(type);
    }
  };

  const handleConfirmClose = () => {
    if (confirmCloseTarget === 'import') { setIsImportModalOpen(false); setImportFileStatus('idle'); setImportStep(1); }
    else if (confirmCloseTarget === 'export') { setIsExportModalOpen(false); setExportStep(1); setExportSelectedTemplates([]); }
    else if (confirmCloseTarget === 'add') { setIsAddModalOpen(false); setAddStep(1); setSelectedTemplateId(null); }
    else if (confirmCloseTarget === 'save') { setIsSaveModalOpen(false); setSaveStep(1); setFormData({ title: '', desc: '', tags: '' }); }
    setConfirmCloseTarget(null);
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
    if (fieldId === 'name') return;
    setExportSelectedFields(prev => prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]);
  };
  const handleConfirmExport = () => {
    setIsExportModalOpen(false);
    triggerToast('JSON file downloaded successfully.');
  };

  // --- BRANCH ADD TEMPLATE HANDLERS ---
  useEffect(() => {
    if (isBranchAddMode) { try { const s = localStorage.getItem('branchAddTemplate'); if (s) setBranchInfo(JSON.parse(s)); else setBranchError('No branch information found.'); } catch (e) { setBranchError('Failed to read branch information.'); } }
  }, []);
  const handleOpenBranchAdd = (row) => { const bi = { nodeId: row.id, nodeLevel: row.level, nodeName: row.name, space: selectedSpace, year: selectedYear, period: selectedPeriod, maxDepth: getMaxLevel(tableData) }; try { localStorage.setItem('branchAddTemplate', JSON.stringify(bi)); } catch (e) { triggerToast('Failed to open branch add template.', 'error'); return; } window.open(window.location.origin + window.location.pathname + '?branchAddTemplate=true', '_blank'); };
  const handleOpenEmptyAddTemplate = () => { const bi = { isFullBoard: true, space: selectedSpace, year: selectedYear, period: selectedPeriod }; try { localStorage.setItem('branchAddTemplate', JSON.stringify(bi)); } catch (e) { triggerToast('Failed to open add template.', 'error'); return; } window.open(window.location.origin + window.location.pathname + '?branchAddTemplate=true', '_blank'); };
  const filteredBranchTemplates = templateList.filter(t => t.title.toLowerCase().includes(branchAddSearchQuery.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(branchAddSearchQuery.toLowerCase())));
  const branchSelectedTemplateData = templateList.find(t => t.id === branchSelectedTemplateId);

  const handleBranchApplyTemplate = () => {
    try {
      const t = templateList.find(x => x.id === branchSelectedTemplateId); if (!t) { setBranchError('Template no longer exists.'); return; } if (!branchInfo) { setBranchError('Branch info missing.'); return; }
      const branchKey = `${branchInfo.space}|${branchInfo.year}|${branchInfo.period}|node${branchInfo.nodeId}`;
      const prevApplied = (() => { try { return JSON.parse(localStorage.getItem('branchAppliedTemplates') || '{}'); } catch (e) { return {}; } })();
      const isDuplicate = prevApplied[branchKey] && prevApplied[branchKey].includes(t.id);
      if (isDuplicate && !branchDuplicateConfirm?.force) { setBranchDuplicateConfirm({ branchKey, templateId: t.id, title: t.title }); return; }
      const getNodeLevel = (node, depth) => (node.level !== undefined && node.level !== null) ? (node.level - 1) : depth;
      const hasIncompatibleLevel = (nodes, depth) => { for (const node of nodes) { const nl = getNodeLevel(node, depth); if (nl < branchInfo.nodeLevel) return true; if (node.children && node.children.length > 0) { if (hasIncompatibleLevel(node.children, depth + 1)) return true; } } return false; };
      if (hasIncompatibleLevel(t.tree, 0)) { setBranchError('The selected template contains nodes at a higher or equal organizational level than the target branch. Please choose another template with compatible level structure.'); return; }
      const targetKey = `${branchInfo.space}|${branchInfo.year}|${branchInfo.period}`;
      const currentData = okrDataMap[targetKey] || [];
      const treeArray = tableToTreeArray(currentData);
      const targetNodeId = branchInfo.nodeId?.toString();
      let targetFound = false;
      const findAndInsertSiblings = (nodes) => { for (let i = 0; i < nodes.length; i++) { if (nodes[i].id === targetNodeId || nodes[i].originalId === branchInfo.nodeId) { const ct = JSON.parse(JSON.stringify(t.tree)); nodes.splice(i + 1, 0, ...ct); targetFound = true; return true; } if (nodes[i].children && nodes[i].children.length > 0) { if (findAndInsertSiblings(nodes[i].children)) return true; } } return false; };
      findAndInsertSiblings(treeArray);
      if (!targetFound) { if (currentData.length === 0) { setBranchError('No data found.'); return; } const ct = JSON.parse(JSON.stringify(t.tree)); treeArray.push(...ct); }
      const newTableData = mapTreeToTableDeep(treeArray);
      setOkrDataMap(prev => ({ ...prev, [targetKey]: newTableData.map(r => ({ ...r, id: Date.now() + Math.random(), progress: r.progress || 0, risk: 'low', result: 0, status: 'valid', warnMsg: null, errorMsg: null })) }));
      try { prevApplied[branchKey] = [...(prevApplied[branchKey] || []), t.id]; localStorage.setItem('branchAppliedTemplates', JSON.stringify(prevApplied)); } catch (e) {}
      setBranchDuplicateConfirm(null); try { localStorage.removeItem('branchAddTemplate'); } catch (e) {} window.location.href = window.location.origin + window.location.pathname;
    } catch (err) { setBranchError('Apply failed: ' + err.message); }
  };
  const handleEmptyApplyTemplate = () => { try { const t = templateList.find(x => x.id === branchSelectedTemplateId); if (!t) { setBranchError('Template no longer exists.'); return; } if (!branchInfo) { setBranchError('Context info missing.'); return; } executeApplyToBoard(t.tree, branchInfo.period, branchInfo.space); setBranchDuplicateConfirm(null); try { localStorage.removeItem('branchAddTemplate'); } catch (e) {} window.location.href = window.location.origin + window.location.pathname; } catch (err) { setBranchError('Apply failed: ' + err.message); } };

  
  
  const renderImportValidationTree = (tab, visCol, onToggle, maxd, setMax) => (<div className="text-sm text-gray-500 p-4">Validation results will appear here after file upload.</div>);

  const renderPreviewTree = (isStep2, currentFields, isFinalReview = false, treeData = previewTreeData, visibleColumns = DEFAULT_VISIBLE_COLUMNS, onToggleColumn = null, maximized = false, onMaximize = null, showCheckboxes = false, selectedIds = new Set(), onToggleCheckbox = null) => {
    const gridCols = getGridTemplate(visibleColumns);
    const toggleCollapse = (id) => setPreviewCollapsed(prev => ({...prev, [id]: !prev[id]}));

    const getFieldValue = (node, fieldId) => {
      if (fieldId === 'progress') fieldId = 'progress_percent';
      if (isStep2 && !currentFields.includes(fieldId)) {
        const defaults = { 'description': 'Default description', 'user': 'Unassigned', 'group': 'Default Group', 'team': 'Default Team', 'assign_to': 'Unassigned', 'metric': 'Default Metric', 'metric_name': 'Default', 'metric_key': 'Default', 'metric_unit': 'Default', 'agg': 'SUM', 'result': 'Default', 'progress_percent': '0%', 'risk_level': 'Low', 'timeline_view_metric': 'Default' };
        return defaults[fieldId] || 'Default';
      }
      const map = { 'description': node.description, 'user': node.assign || node.user, 'group': node.group, 'team': node.team, 'assign_to': node.assign || node.user, 'metric': node.metric, 'metric_name': node.mName, 'metric_key': node.mKey, 'metric_unit': node.mUnit, 'agg': node.agg, 'result': node.result, 'progress_percent': node.progress, 'risk_level': node.risk, 'timeline_view_metric': 'Default' };
      return map[fieldId] || 'Default';
    };

    const getStatus = (node) => node.status || 'valid';

    const renderCell = (node, colId, isObj) => {
      if (isObj) {
        if (colId === 'status') return <div className="flex justify-center"><CheckCircle2 size={14} className="inline text-green-600" /></div>;
        return <span className="text-gray-300">Default</span>;
      }
      switch (colId) {
        case 'description': return <span className="truncate">{node.description || 'Default'}</span>;
        case 'user': return <span className="truncate">{getFieldValue(node, 'user')}</span>;
        case 'group': return <span className="truncate">{node.group || 'Default'}</span>;
        case 'team': return <span className="truncate">{getFieldValue(node, 'team')}</span>;
        case 'assign_to': return <span className="truncate">{node.assign || node.user || 'Default'}</span>;
        case 'metric': return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600">{getFieldValue(node, 'metric')}</span>;
        case 'metric_name': return <span className="truncate">{node.mName || 'Default'}</span>;
        case 'metric_key': return <span className="truncate">{node.mKey || 'Default'}</span>;
        case 'metric_unit': return <span className="truncate">{node.mUnit || 'Default'}</span>;
        case 'agg': return <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-600 font-medium">{node.agg || 'SUM'}</span>;
        case 'result': return <span className="truncate">{node.result ?? 'Default'}</span>;
        case 'progress': {
          const p = getFieldValue(node, 'progress_percent');
          return (
            <div className="flex items-center justify-center gap-1">
              <div className="w-10 bg-gray-200 h-1.5 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{ width: p }}></div></div>
              <span className="text-[10px] text-green-600 font-medium">{p}</span>
            </div>
          );
        }
        case 'risk_level': return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${node.risk === 'high' ? 'bg-red-100 text-red-600' : node.risk === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{node.risk || 'Low'}</span>;
        case 'timeline': return <span className="truncate">{node.timeline || 'Default'}</span>;
        case 'timeline_view_metric': return <span className="text-[10px] text-gray-500 italic">Default</span>;
        case 'status':
          const s = getStatus(node);
          return <div className="flex justify-center">
            {s === 'valid' && <CheckCircle2 size={14} className="inline text-green-600" />}
            {s === 'warning' && <AlertTriangle size={14} className="inline text-amber-600" />}
            {s === 'error' && <XOctagon size={14} className="inline text-red-600" />}
          </div>;
        default: return null;
      }
    };

    const rows = [];
    const objectives = Array.isArray(treeData)
      ? treeData
      : treeData.objective
        ? [{ ...treeData.objective, children: treeData.krs || [] }]
        : [];
    const renderNode = (node, level) => {
      const nodeId = node.id || `n${rows.length}`;
      const isCollapsed = previewCollapsed[nodeId];
      const indent = (level - 1) * 14;
      const isTopLevel = level === 1;
      const s = getStatus(node);
      rows.push(
        <div key={nodeId} onClick={() => openNodeDetail(node, 'view')} className={`border-b border-gray-100 py-1.5 px-2 hover:bg-blue-50/30 transition-colors cursor-pointer ${s === 'error' ? 'bg-red-50/40' : s === 'warning' ? 'bg-amber-50/40' : ''}`}
             style={{ display: 'grid', gridTemplateColumns: gridCols, alignItems: 'center' }}>
          <div className="flex items-center gap-1 truncate" style={{ paddingLeft: `${indent}px` }}>
            {showCheckboxes && (
              <span onClick={(e) => { e.stopPropagation(); if (onToggleCheckbox) onToggleCheckbox(nodeId); }} className="shrink-0 flex items-center">
                <input type="checkbox" checked={selectedIds.has(nodeId)} readOnly className="w-3 h-3 rounded border-gray-300 text-blue-600 cursor-pointer" />
              </span>
            )}
            {isTopLevel && (
              <button onClick={(e) => { e.stopPropagation(); toggleCollapse(nodeId); }} className="p-0.5 hover:bg-gray-200 rounded shrink-0">
                <ChevronRight size={10} className={`text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
              </button>
            )}
            {!isTopLevel && <div className="w-3 shrink-0"></div>}
            {(() => { const il = node.level ?? level; if (il === 1) return <Box size={11} className="text-blue-500 shrink-0" />; if (il === 2) return <span className="text-gray-400 shrink-0 leading-none">↳</span>; if (il === 3) return <Box size={11} className="text-green-500 shrink-0" />; if (il >= 4) return <User size={11} className="text-purple-500 shrink-0" />; return null; })()}
            <span className={`text-[11px] font-medium truncate ${showCheckboxes && !selectedIds.has(nodeId) ? 'text-gray-400' : isTopLevel ? 'text-blue-600' : s === 'error' ? 'text-red-600' : s === 'warning' ? 'text-amber-600' : 'text-gray-700'}`}>{node.name}</span>
          </div>
          {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
            <div key={col.id} className={`px-1.5 text-[10px] ${isTopLevel ? 'text-gray-500' : 'text-gray-600'} ${isCenteredCol(col.id) ? 'text-center' : 'text-left'} overflow-hidden truncate`}>{renderCell(node, col.id, isTopLevel)}</div>
          ))}
        </div>
      );
      if (!isCollapsed && node.children) {
        node.children.forEach(child => renderNode(child, level + 1));
      }
    };
    objectives.forEach(obj => renderNode(obj, 1));

    const treeContent = (
      <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm flex flex-col h-full">
        <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
          <div className="min-w-[500px]">
            <div className="bg-gray-50 border-b border-gray-200 py-1 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10"
                 style={{ display: 'grid', gridTemplateColumns: gridCols + ' auto', alignItems: 'center' }}>
              <div className="bg-gray-50 truncate" style={{ paddingLeft: '2px' }}>Node</div>
              {TREE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map(col => (
                <div key={col.id} className={`px-1.5 ${isCenteredCol(col.id) ? 'text-center' : 'text-left'} bg-gray-50 truncate`}>{col.label}</div>
              ))}
              <div className="flex items-center gap-0.5" style={{ justifySelf: 'end' }}>
                {onToggleColumn && <ColumnToggle visibleColumns={visibleColumns} onToggle={onToggleColumn} />}
                {onMaximize && (
                  <button onClick={() => onMaximize(!maximized)} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title={maximized ? 'Minimize' : 'Maximize'}>
                    {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                )}
              </div>
            </div>
            {rows}
          </div>
        </div>
        <div className="text-[10px] text-gray-400 italic px-2 py-0.5 shrink-0 bg-gray-50/50 border-t border-gray-100">Giao diện chỉ mang tính chất minh họa, chức năng thực tế sẽ bám sát giao diện của hệ thống gốc XCORP</div>
      </div>
    );

    if (maximized && onMaximize) {
      return (
        <FullScreenWindow onClose={() => onMaximize(false)}>
          {treeContent}
        </FullScreenWindow>
      );
    }

    return treeContent;

  }


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
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono mt-0.5">
                  <span className="text-gray-500">{data.space || selectedSpace || 'WE-V2'}</span>
                  <ChevronRight size={10} className="text-gray-300" />
                  <span className="text-blue-500">{data.parentCode || 'OBJ-01'}</span>
                  <ChevronRight size={10} className="text-gray-300" />
                  <span className="text-gray-600 font-semibold">{data.id || 'AUTO'}</span>
                </div>
              </div>
            </div>
            <button onClick={closeNodeDetail} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={18}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/40">
          
          <div className="p-5 space-y-5">
            
            {/* Tabs: General | Detail | Template | Auto Link */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-200">
                {['General', 'Detail', 'Template', 'Auto Link'].map(tab => (
                  <button key={tab} onClick={() => setNodeDetailTopTab(tab.toLowerCase())}
                    className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${nodeDetailTopTab === tab.toLowerCase() ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab}
                  </button>
                ))}
              </div>
              
              {/* General Tab Content (empty - interface removed as requested) */}
              {nodeDetailTopTab === 'general' && (
                <div className="p-4 text-center">
                  <Info size={28} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-xs text-gray-400 italic">General information is now organized in the Detail tab</p>
                </div>
              )}
              
              {/* Detail Tab - all node details content */}
              {nodeDetailTopTab === 'detail' && (
                <div className="space-y-4 p-4">
                  {/* Details section */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-gray-100 mb-2"><FileText size={12} className="text-gray-400" /> Details</h4>
                    <div className="space-y-3">
                      <FieldRow label="Title" required>
                        {isEdit ? <input type="text" value={editingNodeData?.name || ''} onChange={(e) => setEditingNodeData({...editingNodeData, name: e.target.value})} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" /> : <div className="text-sm font-semibold text-gray-900">{data.name}</div>}
                      </FieldRow>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Level</label>
                          {isEdit ? (
                            <select value={editingNodeData?.level || 'PERSONAL'} onChange={(e) => setEditingNodeData({...editingNodeData, level: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded">
                              <option value="PERSONAL">PERSONAL</option><option value="GROUP">GROUP</option><option value="TEAM">TEAM</option><option value="COMPANY">COMPANY</option>
                            </select>
                          ) : <span className="text-sm text-gray-800">{data.level || 'PERSONAL'}</span>}
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Category</label>
                          {isEdit ? (
                            <select value={editingNodeData?.category || (isObj ? 'Objective' : 'KPI')} onChange={(e) => setEditingNodeData({...editingNodeData, category: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded">
                              <option value="Objective">Objective</option><option value="KPI">KPI</option>
                            </select>
                          ) : <span className="text-sm text-gray-800">{data.category || (isObj ? 'Objective' : 'KPI')}</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Code</label>
                          <span className="text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1.5 rounded border border-gray-200 block">{data.id || 'AUTO-GEN'}</span>
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Due Date</label>
                          {isEdit ? <input type="text" placeholder="dd/mm/yyyy" value={editingNodeData?.dueDate || ''} onChange={(e) => setEditingNodeData({...editingNodeData, dueDate: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded" /> : <span className="text-sm text-gray-800">{data.dueDate || <span className="italic text-gray-400">None</span>}</span>}
                        </div>
                      </div>
                      <FieldRow label="Description">
                        {isEdit ? <textarea value={editingNodeData?.description || ''} onChange={(e) => setEditingNodeData({...editingNodeData, description: e.target.value})} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded h-16 custom-scrollbar focus:ring-1 focus:ring-blue-500" /> : <div className="text-sm text-gray-600">{data.description || <span className="italic text-gray-400">Not set</span>}</div>}
                      </FieldRow>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Indicator</label>
                          {isEdit ? (
                            <select value={editingNodeData?.indicator || ''} onChange={(e) => setEditingNodeData({...editingNodeData, indicator: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded">
                              <option value="">None</option><option value="KPI">KPI</option><option value="OKR">OKR</option><option value="KRA">KRA</option>
                            </select>
                          ) : <span className="text-sm text-gray-800">{data.indicator || <span className="italic text-gray-400">None</span>}</span>}
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Policies</label>
                          {isEdit ? (
                            <select value={editingNodeData?.policies || ''} onChange={(e) => setEditingNodeData({...editingNodeData, policies: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded">
                              <option value="">None</option><option value="Policy A">Policy A</option><option value="Policy B">Policy B</option><option value="Policy C">Policy C</option>
                            </select>
                          ) : <span className="text-sm text-gray-800">{data.policies || <span className="italic text-gray-400">None</span>}</span>}
                        </div>
                      </div>
                      <FieldRow label="Labels">
                        {isEdit ? <input type="text" placeholder="label1, label2" value={editingNodeData?.labels || ''} onChange={(e) => setEditingNodeData({...editingNodeData, labels: e.target.value})} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded" /> : <div className="flex flex-wrap gap-1">{typeof data.labels === 'string' ? data.labels.split(',').map((l,i) => <span key={i} className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded text-gray-600">{l.trim()}</span>) : <span className="italic text-gray-400 text-sm">None</span>}</div>}
                      </FieldRow>
                      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Assignee</label>
                          {isEdit ? <input type="text" placeholder="Select user..." value={editingNodeData?.user || ''} onChange={(e) => setEditingNodeData({...editingNodeData, user: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded" /> : <div className="text-sm flex items-center gap-1.5">{data.user ? <><div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden shrink-0"><img src={`https://i.pravatar.cc/100?u=${data.user}`} alt="u"/></div><span className="font-medium">{data.user}</span></> : <span className="italic text-gray-400 text-sm">Unassigned</span>}</div>}
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Groups</label>
                          {isEdit ? <input type="text" value={editingNodeData?.group || ''} onChange={(e) => setEditingNodeData({...editingNodeData, group: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded" /> : <span className="text-sm text-gray-800">{data.group || <span className="italic text-gray-400 text-sm">None</span>}</span>}
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Teams</label>
                          {isEdit ? <input type="text" value={editingNodeData?.team || ''} onChange={(e) => setEditingNodeData({...editingNodeData, team: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded" /> : <span className="text-sm text-gray-800">{data.team || <span className="italic text-gray-400 text-sm">None</span>}</span>}
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Stakeholders</label>
                          {isEdit ? <input type="text" placeholder="User1, User2" value={editingNodeData?.stakeholders || ''} onChange={(e) => setEditingNodeData({...editingNodeData, stakeholders: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded" /> : <span className="text-sm text-gray-800">{data.stakeholders || <span className="italic text-gray-400 text-sm">None</span>}</span>}
                        </div>
                      </div>
                      <div className="pt-1 border-t border-gray-100">
                        <label className="text-[10px] font-medium text-gray-500 mb-1 block">Timeline (TL) <span className="text-red-500">*</span></label>
                        {isEdit ? (
                          <div className="grid grid-cols-2 gap-2">
                            <select value={editingNodeData?.tlYear || '2025'} onChange={(e) => setEditingNodeData({...editingNodeData, tlYear: e.target.value})} className="text-xs px-2 py-1.5 border border-gray-300 rounded">
                              <option>2024</option><option>2025</option><option>2026</option>
                            </select>
                            <select value={editingNodeData?.tlQuarter || 'Q3'} onChange={(e) => setEditingNodeData({...editingNodeData, tlQuarter: e.target.value})} className="text-xs px-2 py-1.5 border border-gray-300 rounded">
                              <option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option>
                            </select>
                          </div>
                        ) : <span className="text-sm text-gray-800">{data.tlYear && data.tlQuarter ? `${data.tlYear} ${data.tlQuarter}` : data.timeline || <span className="italic text-gray-400">Not set</span>}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Progress Formula</label>
                          {isEdit ? (
                            <select value={editingNodeData?.progressFormula || 'Default'} onChange={(e) => setEditingNodeData({...editingNodeData, progressFormula: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded"><option>Default</option><option>Custom</option></select>
                          ) : <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded font-medium inline-block">{data.progressFormula || 'Default'}</span>}
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Risk Formula</label>
                          {isEdit ? (
                            <select value={editingNodeData?.riskFormula || 'Default'} onChange={(e) => setEditingNodeData({...editingNodeData, riskFormula: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded"><option>Default</option><option>Custom</option></select>
                          ) : <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded font-medium inline-block">{data.riskFormula || 'Default'}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parent Objective */}
                  {!isObj && (
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-gray-100 mb-2"><ArrowUpCircle size={12} className="text-gray-400" /> Parent Objective</h4>
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Objective</label>
                          <div className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">{data.parentName || 'Product Launch'} <span className="text-xs text-gray-400 font-mono ml-1">{data.parentCode || 'OBJ-01'}</span></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-medium text-gray-500 mb-1 block">Assignee</label>
                            <div className="text-sm flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden shrink-0"><img src={`https://i.pravatar.cc/100?u=${data.parentAssignee || 'parent'}`} alt=""/></div>
                              <span className="font-medium">{data.parentAssignee || 'Tuan Ha'}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-gray-500 mb-1 block">Percent</label>
                            <span className="text-sm font-semibold text-gray-800">{data.parentPercent || 50}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 mb-1 block">Timeline (TL)</label>
                          <span className="text-sm text-gray-800">{data.parentTimeline || '2025 Q3'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nested Items */}
                  {(data.children?.length > 0) && (
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-gray-100 mb-2"><List size={12} className="text-gray-400" /> Nested Items</h4>
                      <div className="space-y-1.5">
                        {data.children.map((child, idx) => (
                          <div key={child.id || idx} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded border border-gray-100">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                              <span className="text-xs font-medium text-gray-800 truncate">{child.name || child.id} <span className="text-gray-400 font-mono">{child.id}</span></span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-2">
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden"><img src={`https://i.pravatar.cc/100?u=${child.user || child.id}`} alt=""/></div>
                                <span className="text-[10px] text-gray-600">{child.user || 'Unassigned'}</span>
                              </div>
                              <span className="text-[10px] font-semibold text-blue-600">{child.percent || 0}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline (TL) Detail */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-gray-100 mb-2"><Calendar size={12} className="text-gray-400" /> Timeline (TL) Detail</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">Planning Timeline</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={editingNodeData?.planningActive !== false} onChange={(e) => isEdit && setEditingNodeData({...editingNodeData, planningActive: e.target.checked})} />
                        <div className="w-7 h-3.5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" style={{ position: 'relative' }}>
                          <div className="absolute top-[1px] left-[1px] w-3 h-3 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-[14px]"></div>
                        </div>
                      </label>
                    </div>
                    <div className="border border-gray-200 rounded divide-y divide-gray-100">
                      <div className="px-2.5 py-1.5 bg-gray-50 flex items-center gap-1.5">
                        <ChevronRight size={10} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-700">{data.tlYear || '2025'} {data.tlQuarter || 'Q3'}</span>
                      </div>
                      <div className="px-2.5 py-2">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <label className="text-[9px] text-gray-500 block">Start</label>
                            {isEdit ? <input type="number" className="w-full text-xs bg-white border border-gray-300 px-1.5 py-1 rounded mt-0.5 text-center" value={editingNodeData?.start ?? data.start ?? 0} onChange={(e) => setEditingNodeData({...editingNodeData, start: Number(e.target.value)})} /> : <span className="text-xs font-semibold text-gray-700">{data.start || 0}</span>}
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 block">Current</label>
                            {isEdit ? <input type="number" className="w-full text-xs bg-white border border-blue-200 px-1.5 py-1 rounded mt-0.5 text-center" value={editingNodeData?.current ?? data.current ?? 0} onChange={(e) => setEditingNodeData({...editingNodeData, current: Number(e.target.value)})} /> : <span className="text-xs font-semibold text-blue-700">{data.current || 0}</span>}
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 block">Expected / Target</label>
                            {isEdit ? <input type="number" className="w-full text-xs bg-white border border-green-200 px-1.5 py-1 rounded mt-0.5 text-center" value={editingNodeData?.expected ?? data.expected ?? 100} onChange={(e) => setEditingNodeData({...editingNodeData, expected: Number(e.target.value)})} /> : <span className="text-xs font-semibold text-green-700">{data.expected || 100}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metric & Results */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-gray-100 mb-2"><BarChart2 size={12} className="text-gray-400" /> Metric & Results</h4>
                    <FieldRow label="Metric">
                      {isEdit ? <input type="text" value={editingNodeData?.metric || ''} onChange={(e) => setEditingNodeData({...editingNodeData, metric: e.target.value})} className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded" /> : <div className="text-sm font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">{data.metric || <span className="italic text-gray-400">Not set</span>}</div>}
                    </FieldRow>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 mb-1 block">Aggregation Type</label>
                        {isEdit ? (
                          <select value={editingNodeData?.agg || 'SUM'} onChange={(e) => setEditingNodeData({...editingNodeData, agg: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded">
                            <option>SUM</option><option>AVG</option>
                          </select>
                        ) : <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold border border-blue-100 inline-block">{data.agg || 'SUM'}</span>}
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 mb-1 block">Result</label>
                        {isEdit ? <input type="text" value={editingNodeData?.result ?? ''} onChange={(e) => setEditingNodeData({...editingNodeData, result: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded" /> : <span className="text-sm text-gray-800">{data.result ?? 'Default'}</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
                        <label className="text-[9px] text-gray-500 block">Start</label>
                        <span className="text-sm font-semibold text-gray-700">{data.start || 0}</span>
                      </div>
                      <div className="bg-blue-50/50 p-2 rounded border border-blue-200 text-center">
                        <label className="text-[9px] text-gray-500 block">Current</label>
                        <span className="text-sm font-semibold text-blue-700">{data.current || 0}</span>
                      </div>
                      <div className="bg-green-50/50 p-2 rounded border border-green-200 text-center">
                        <label className="text-[9px] text-gray-500 block">Expected</label>
                        <span className="text-sm font-semibold text-green-700">{data.expected || 100}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Tab - placeholder */}
              {nodeDetailTopTab === 'template' && (
                <div className="p-8 text-center">
                  <div className="text-xs text-gray-400 italic">Template configuration will be available here</div>
                </div>
              )}
              
              {/* Auto Link Tab - placeholder */}
              {nodeDetailTopTab === 'auto link' && (
                <div className="p-8 text-center">
                  <div className="text-xs text-gray-400 italic">Auto link configuration will be available here</div>
                </div>
              )}
            </div>

            {/* Comment / Check-in / History tabs */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50/50">
                {['Comment', 'Check-in', 'History'].map(tab => (
                  <button key={tab} onClick={() => setNodeDetailBottomTab(tab.toLowerCase())} className={`px-4 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${nodeDetailBottomTab === tab.toLowerCase() ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                    {tab === 'Comment' && <MessageSquare size={11} className="inline mr-1" />}
                    {tab === 'Check-in' && <Clipboard size={11} className="inline mr-1" />}
                    {tab === 'History' && <Clock size={11} className="inline mr-1" />}
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-4 min-h-[100px]">
                {nodeDetailBottomTab === 'comment' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden shrink-0 mt-0.5"><img src="https://i.pravatar.cc/100?u=current" alt="" className="w-full h-full object-cover" /></div>
                      <div className="flex-1">
                        <textarea placeholder="Write a comment..." className="w-full text-xs px-3 py-2 border border-gray-200 rounded resize-none h-16 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                        <div className="flex justify-end mt-1">
                          <button className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">Send</button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden shrink-0 mt-0.5"><img src={`https://i.pravatar.cc/100?u=commenter${i}`} alt="" className="w-full h-full object-cover" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-gray-800">{['Duc Le', 'Ngan Vu', 'Duy Nguyen'][i]}</span>
                              <span className="text-[9px] text-gray-400">{['2h ago', '1d ago', '3d ago'][i]}</span>
                            </div>
                            <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{['Updated progress to 75%', 'KR target adjusted to $5M', 'Approved timeline change'][i]}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <button className="text-[9px] text-gray-400 hover:text-gray-600 font-medium">Reply</button>
                              <button className="text-[9px] text-gray-400 hover:text-gray-600 font-medium">Edit</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {nodeDetailBottomTab === 'check-in' && (
                  <div className="text-center py-6 text-gray-400">
                    <Clipboard size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium">No check-ins yet</p>
                    <p className="text-[10px] mt-1">Check-ins help track progress regularly</p>
                  </div>
                )}
                {nodeDetailBottomTab === 'history' && (
                  <div className="space-y-3">
                    {[
                      { action: 'Created', user: 'Duc Le', date: 'Jan 15, 2025', detail: 'Objective created with initial target' },
                      { action: 'Updated', user: 'Ngan Vu', date: 'Feb 20, 2025', detail: 'Progress updated from 0% to 30%' },
                      { action: 'Updated', user: 'Duy Nguyen', date: 'Mar 10, 2025', detail: 'Assignee changed from Ngan Vu to Duy Nguyen' },
                    ].map((h, i) => (
                      <div key={i} className="flex items-start gap-2 pb-2 border-b border-gray-50 last:border-0">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${h.action === 'Created' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {h.action === 'Created' ? <Plus size={10} /> : <Edit size={10} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-800">{h.user}</span>
                            <span className="text-[9px] text-gray-400">{h.date}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">{h.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
  }


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

      {/* Action dropdown overlay + fixed dropdown */}
      {actionDropdown !== null && (
        <><div className="fixed inset-0 z-[60]" onClick={() => setActionDropdown(null)}></div>
          <div className="fixed z-[70] w-52 bg-white border border-gray-200 rounded-md shadow-lg py-1 max-h-[320px] overflow-y-auto custom-scrollbar" style={{ top: `${actionDropdown.top}px`, left: `${actionDropdown.left}px` }}>
            {(() => { const row = tableData.find(r => r.id === actionDropdown.rowId); const p = row ? isPersonalLevel(row.level) : false; return (<>
              {!p && row && <button onClick={() => { setActionDropdown(null); handleOpenBranchAdd(row); }} className="w-full text-left px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2"><Plus size={12} /> Add Template</button>}
              <div className="border-t border-gray-100 my-1"></div>
              <div className="px-3 py-1 text-[10px] text-gray-400 uppercase tracking-wider">Advanced</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Advanced select</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Find and replace title</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Bulk change</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Mass check-in</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Set planning</div>
              <div className="border-t border-gray-100 my-1"></div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Clone objective</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Copy objective</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Move objective</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Reset data</div>
              <div className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2">Delete objective</div>
              <div className="border-t border-gray-100 my-1"></div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Expand all</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Collapse all</div>
              <div className="border-t border-gray-100 my-1"></div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">View only selected objective</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">View all related objectives</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Configure view metrics</div>
              <div className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2">Copy link</div>
            </>)})()}
          </div>
        </>
      )}

      {/* Duplicate confirm dialog */}
      {isBranchAddMode && branchDuplicateConfirm && !branchDuplicateConfirm.force && (
        <div className="fixed inset-0 z-[100] bg-gray-500/75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 border-t-4 border-amber-500 animate-fade-in">
            <div className="flex items-center text-amber-500 mb-3"><AlertTriangle size={24} className="mr-2" /><h3 className="text-lg font-bold text-gray-900">Duplicate Template</h3></div>
            <p className="text-gray-600 text-sm mb-2">Template <strong>"{branchDuplicateConfirm.title}"</strong> has already been applied to this branch.</p>
            <p className="text-gray-600 text-sm mb-6">Do you want to apply it again anyway?</p>
            <div className="flex justify-end gap-3"><button onClick={() => setBranchDuplicateConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button><button onClick={handleBranchDuplicateForce} className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded hover:bg-amber-700">Apply Anyway</button></div>
          </div>
        </div>
      )}

      {/* Branch error dialog */}
      {isBranchAddMode && branchError && (
        <div className="fixed inset-0 z-[100] bg-gray-500/75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 border-t-4 border-red-500 animate-fade-in">
            <div className="flex items-center text-red-500 mb-3"><AlertTriangle size={24} className="mr-2" /><h3 className="text-lg font-bold text-gray-900">Error</h3></div>
            <p className="text-gray-600 text-sm mb-6">{branchError}</p>
            <div className="flex justify-end"><button onClick={() => window.close()} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700">Close Tab</button></div>
          </div>
        </div>
      )}

      {/* Branch select dialog */}
      {isBranchSelectOpen && tableData.length > 0 && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-xl w-[420px] max-h-[80vh] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between mb-3 shrink-0"><h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><FolderTree size={18} className="text-blue-500" /> Select Branch</h3><button onClick={() => setIsBranchSelectOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18}/></button></div>
            <p className="text-xs text-gray-500 mb-3 shrink-0">Choose a branch to add the template to:</p>
            <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-200 rounded">
              {tableData.map(row => { const per = isPersonalLevel(row.level); const sel = selectedBranchRowId === row.id; return (<div key={row.id} onClick={() => !per && setSelectedBranchRowId(row.id)} className={`flex items-center gap-2 px-3 py-2 text-xs border-b border-gray-50 transition-colors ${per ? 'opacity-30 cursor-not-allowed' : sel ? 'bg-blue-50' : 'hover:bg-gray-50 cursor-pointer'}`} style={{ paddingLeft: `${12 + row.level * 16}px` }}><input type="radio" name="branchSelect" checked={sel} disabled={per} onChange={() => !per && setSelectedBranchRowId(row.id)} className="w-3.5 h-3.5 text-blue-600 border-gray-300" /><div className="flex items-center gap-1 min-w-0">{row.level === 0 && <Box size={12} className="text-blue-500 shrink-0" />}{row.level === 1 && <span className="text-gray-400 shrink-0 leading-none">↳</span>}{row.level === 2 && <Box size={12} className="text-green-500 shrink-0" />}{row.level >= 3 && <User size={12} className="text-purple-500 shrink-0" />}<span className={`truncate ${sel ? 'font-medium text-blue-700' : 'text-gray-700'}`}>{row.name}</span></div></div>); })}
            </div>
            <div className="flex justify-end gap-2 mt-4 shrink-0"><button onClick={() => setIsBranchSelectOpen(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button><button onClick={handleConfirmBranchSelect} disabled={selectedBranchRowId === null} className={`px-4 py-1.5 text-xs font-medium text-white rounded ${selectedBranchRowId === null ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>Continue</button></div>
          </div>
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
               <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const targetKey = `${selectedSpaceForUse}|2025|${selectedTimelineForUse}`;
                      const hasData = selectedSpaceForUse && selectedTimelineForUse && (okrDataMap[targetKey]?.length > 0);
                      return hasData ? (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded shadow-sm">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                            <div>
                              <h4 className="text-sm font-bold text-amber-800">Timeline has existing data</h4>
                              <p className="text-xs text-amber-700 mt-1">This timeline already has OKR data. Template can only be applied to an empty timeline. Please select another timeline without data.</p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsTimelineModalOpen(false)} className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
                      {(() => {
                        const targetKey = `${selectedSpaceForUse}|2025|${selectedTimelineForUse}`;
                        const hasData = selectedSpaceForUse && selectedTimelineForUse && (okrDataMap[targetKey]?.length > 0);
                        return hasData ? (
                          <button disabled className="px-4 py-1.5 text-sm text-gray-400 bg-gray-200 border border-gray-200 rounded font-medium cursor-not-allowed">Timeline not empty</button>
                        ) : (
                          <button onClick={handleConfirmUseTemplate} disabled={!selectedSpaceForUse || !selectedTimelineForUse} className={`px-4 py-1.5 text-sm text-white rounded font-medium ${!selectedSpaceForUse || !selectedTimelineForUse ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>Apply Template</button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
          </div>
        </div>
      )}

      {/* --- C1: VIEW TEMPLATE MODAL --- */}
      {viewTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-gray-500/75 backdrop-blur-sm">
          {(() => { console.log('=== VIEW TEMPLATE ===', { title: viewTarget.title, treeLength: viewTarget.tree?.length, treeData: JSON.parse(JSON.stringify(viewTarget.tree)) }); return null; })()}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-3"><Eye size={18}/></div>
                <div>
                  <h2 className="text-lg font-bold text-[#1e3a8a]">{viewTarget.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Previewing template structure (Read-only)</p>
                  <p className="text-[11px] text-gray-400 italic mt-1">Giao diện chỉ mang tính chất minh họa, chức năng thực tế sẽ bám sát giao diện của hệ thống gốc XCORP</p>
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
                   {(() => {
                      const viewGridCols = getGridTemplate(viewTreeVisibleColumns);
                      const viewTreeHeader = (
                        <div className="bg-gray-50 border-b border-gray-200 py-2 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                             style={{ display: 'grid', gridTemplateColumns: viewGridCols + ' auto', alignItems: 'center' }}>
                          <div className="bg-gray-50 truncate" style={{ paddingLeft: '4px' }}>Node</div>
                          {TREE_COLUMNS.filter(c => viewTreeVisibleColumns.includes(c.id)).map(col => (
                            <div key={col.id} className={`px-1.5 ${isCenteredCol(col.id) ? 'text-center' : 'text-left'} bg-gray-50 truncate`}>{col.label}</div>
                          ))}
                          <div className="flex items-center gap-0.5" style={{ justifySelf: 'end' }}>
                            <ColumnToggle visibleColumns={viewTreeVisibleColumns} onToggle={toggleViewTreeColumn} />
                            <button onClick={() => setViewTreeMaximized(!viewTreeMaximized)} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title={viewTreeMaximized ? 'Minimize' : 'Maximize'}>
                              {viewTreeMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            </button>
                          </div>
                        </div>
                      );
                     const viewTreeRows = (
                       <div className="divide-y divide-gray-100">
                         {viewTarget.tree.map((obj) => {
                           const objCollapsed = viewCollapsedObjs[obj.id];
                           const toggleViewObj = () => setViewCollapsedObjs(prev => ({...prev, [obj.id]: !prev[obj.id]}));
                            const renderCell = (node, colId, isKr = false) => {
                              if (colId === 'description') return <span className="truncate text-[12px]">{node.description || 'Default'}</span>;
                              if (colId === 'user') return <span className="truncate text-[12px]">{node.user || <span className="text-gray-300">Default</span>}</span>;
                              if (colId === 'group') return <span className="truncate text-[12px]">{node.group || <span className="text-gray-300">Default</span>}</span>;
                              if (colId === 'team') return <span className="truncate text-[12px]">{node.team || <span className="text-gray-300">Default</span>}</span>;
                              if (colId === 'assign_to') return <span className="truncate text-[12px]">{node.assign || node.user || <span className="text-gray-300">Default</span>}</span>;
                              if (colId === 'metric') return <span className="truncate text-[12px]">{node.metric || <span className="text-gray-300">Default</span>}</span>;
                              if (colId === 'metric_name') return <span className="truncate text-[12px]">{node.mName || node.metricName || <span className="text-gray-300">Default</span>}</span>;
                              if (colId === 'metric_key') return <span className="truncate text-[12px]">{node.mKey || node.metricKey || <span className="text-gray-300">Default</span>}</span>;
                              if (colId === 'metric_unit') return <span className="truncate text-[12px]">{node.mUnit || node.metricUnit || <span className="text-gray-300">Default</span>}</span>;
                              if (colId === 'agg') return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600">{node.agg || 'SUM'}</span>;
                              if (colId === 'result') return <span className="truncate text-[12px]">{node.result ?? <span className="text-gray-300">Default</span>}</span>;
                              if (colId === 'progress') return <span className="text-[12px] font-medium text-green-600">{isKr ? (node.progress || 'Default') : <span className="text-gray-300">Default</span>}</span>;
                              if (colId === 'risk_level') return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${node.risk === 'high' ? 'bg-red-100 text-red-600' : node.risk === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{node.risk || 'Low'}</span>;
                              if (colId === 'timeline') return <span className="truncate text-[12px]">{isKr ? (node.timeline || <span className="text-gray-300">Default</span>) : <span className="text-gray-300">Default</span>}</span>;
                              if (colId === 'timeline_view_metric') return <span className="text-gray-400 italic text-[12px]">Default</span>;
                              if (colId === 'status') return <div className="flex justify-center"><CheckCircle2 size={14} className="inline text-green-600" /></div>;
                              return null;
                            };
                           return (
                             <div key={obj.id}>
                                <div className="py-2 px-3 hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => openNodeDetail(obj, 'view')}
                                     style={{ display: 'grid', gridTemplateColumns: viewGridCols, alignItems: 'center' }}>
                                  <div className="flex items-center gap-1.5 truncate">
                                      <button onClick={(e) => { e.stopPropagation(); toggleViewObj(); }} className="p-0.5 hover:bg-gray-200 rounded shrink-0">
                                        <ChevronRight size={12} className={`text-gray-400 transition-transform ${objCollapsed ? '' : 'rotate-90'}`} />
                                      </button>
                                       <Box size={13} className="text-blue-500 shrink-0" />
                                       <span className="text-xs font-semibold text-blue-600 hover:underline truncate">{obj.name}</span>
                                   </div>
                                   {TREE_COLUMNS.filter(c => viewTreeVisibleColumns.includes(c.id)).map(col => (
                                      <div key={col.id} className={`px-1.5 ${isCenteredCol(col.id) ? 'text-center' : 'text-left'} overflow-hidden truncate`}>{renderCell(obj, col.id, false)}</div>
                                    ))}
                                   </div>
                                  {!objCollapsed && obj.children && obj.children.map(kr => (
                                     <div key={kr.id} className="py-2 px-3 hover:bg-blue-50/30 transition-colors cursor-pointer border-t border-gray-50" onClick={() => openNodeDetail(kr, 'view')}
                                          style={{ display: 'grid', gridTemplateColumns: viewGridCols, alignItems: 'center' }}>
                                        <div className="flex items-center gap-1.5 truncate" style={{ paddingLeft: '28px' }}>
                                           <span className="text-gray-400 shrink-0 leading-none">↳</span>
                                          <span className="text-xs text-gray-700 hover:text-blue-600 hover:underline truncate">{kr.name}</span>
                                      </div>
                                      {TREE_COLUMNS.filter(c => viewTreeVisibleColumns.includes(c.id)).map(col => (
                                        <div key={col.id} className={`px-1.5 ${isCenteredCol(col.id) ? 'text-center' : 'text-left'} overflow-hidden truncate`}>{renderCell(kr, col.id, true)}</div>
                                     ))}
                                   </div>
                                ))}
                              </div>
                            );
                         })}
                       </div>
                     );
                     const treeContent = (
                       <div className="min-w-[500px]">
                         {viewTreeHeader}
                         {viewTreeRows}
                       </div>
                     );
                     if (viewTreeMaximized) {
                       return (
                         <FullScreenWindow onClose={() => setViewTreeMaximized(false)}>
                           <div className="p-4 bg-white" style={{ height: '100vh', overflow: 'auto' }}>
                             {treeContent}
                           </div>
                         </FullScreenWindow>
                       );
                     }
                     return (
                       <div className="overflow-x-auto">
                         {treeContent}
                       </div>
                     );
                   })()}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-gray-500/75 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden relative">
            
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
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

                    {(() => {
                        const editGridCols = ['minmax(432px, 2.5fr)'];
                        TREE_COLUMNS.filter(c => editTreeVisibleColumns.includes(c.id)).forEach(c => editGridCols.push(COL_WIDTH_MAP[c.id] || '112px'));
                        editGridCols.push('1fr', '96px');
                        const editGridTemplate = editGridCols.join(' ');
                        const editRenderCell = (node, colId) => {
                          if (colId === 'description') return <span className="truncate text-[12px]">{node.description || 'Default'}</span>;
                          if (colId === 'user') return <span className="truncate text-[12px]">{node.user || 'Default'}</span>;
                          if (colId === 'group') return <span className="truncate text-[12px]">{node.group || 'Default'}</span>;
                          if (colId === 'team') return <span className="truncate text-[12px]">{node.team || 'Default'}</span>;
                          if (colId === 'assign_to') return <span className="truncate text-[12px]">{node.assign || node.user || 'Default'}</span>;
                          if (colId === 'metric') return <span className="truncate text-[12px]">{node.metric || 'Default'}</span>;
                          if (colId === 'metric_name') return <span className="truncate text-[12px]">{node.mName || 'Default'}</span>;
                          if (colId === 'metric_key') return <span className="truncate text-[12px]">{node.mKey || 'Default'}</span>;
                          if (colId === 'metric_unit') return <span className="truncate text-[12px]">{node.mUnit || 'Default'}</span>;
                          if (colId === 'agg') return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600">{node.agg || 'SUM'}</span>;
                          if (colId === 'result') return <span className="truncate text-[12px]">{node.result ?? 'Default'}</span>;
                          if (colId === 'progress') return <span className="text-[12px] font-medium text-green-600">{node.progress ? <span>{node.progress}</span> : <span className="text-gray-400">-</span>}</span>;
                          if (colId === 'risk_level') return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${node.risk === 'high' ? 'bg-red-100 text-red-600' : node.risk === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{node.risk || 'Low'}</span>;
                          if (colId === 'timeline') return <span className="truncate text-[12px]">{node.timeline || 'Default'}</span>;
                          if (colId === 'timeline_view_metric') return <span className="text-gray-400 italic text-[12px]">Default</span>;
                          if (colId === 'status') return <div className="flex justify-center"><CheckCircle2 size={14} className="inline text-green-600" /></div>;
                          return null;
                        };
                        const editTreeHeader = (
                          <div className="bg-gray-50 border-b border-gray-200 py-1 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider shrink-0"
                               style={{ display: 'grid', gridTemplateColumns: editGridTemplate, alignItems: 'center' }}>
                           <div className="bg-gray-50 truncate" style={{ paddingLeft: '2px' }}>OKR</div>
                           {TREE_COLUMNS.filter(c => editTreeVisibleColumns.includes(c.id)).map(col => (
                             <div key={col.id} className={`px-1.5 ${isCenteredCol(col.id) ? 'text-center' : 'text-left'} bg-gray-50 truncate`}>{col.label}</div>
                           ))}
                           <div></div>
                           <div className="px-1.5 text-center bg-gray-50 truncate">Actions</div>
                         </div>
                       );
                       const editTreeRows = (
                         <div className="divide-y divide-gray-100">
                            {editTreeData.map((obj, oIdx) => {
                              const renderNode = (node, path, level = 1) => {
                                const isObjective = level === 1;
                                const canAddChild = level < 4;
                                return (
                                    <React.Fragment key={node.id}>
                                      <div onClick={() => openNodeDetail(node, 'edit', path)} className="group py-2.5 px-4 hover:bg-blue-50/30 transition-colors cursor-pointer"
                                           style={{ display: 'grid', gridTemplateColumns: editGridTemplate, alignItems: 'center' }}>
                                        <div className="flex items-center gap-2 truncate" style={{ paddingLeft: `${16 + (level - 1) * 24}px` }}>
                                          {(() => { const il = node.level ?? (isObjective ? 1 : 2); if (il === 1) return <Box size={14} className="text-blue-500 shrink-0" />; if (il === 2) return <span className="text-gray-400 shrink-0 leading-none">↳</span>; if (il === 3) return <Box size={14} className="text-green-500 shrink-0" />; return <User size={14} className="text-purple-500 shrink-0" />; })()}
                                          <span className={`${isObjective ? 'font-semibold text-blue-600' : 'text-gray-700'} text-[13px] line-clamp-1`}>{node.id} - {node.name}</span>
                                          {level > 1 && <span className="text-[10px] px-1 py-0.5 bg-gray-100 text-gray-500 rounded shrink-0">L{level}</span>}
                                        </div>
                                        {TREE_COLUMNS.filter(c => editTreeVisibleColumns.includes(c.id)).map(col => (
                                          <div key={col.id} className={`px-1.5 text-[12px] ${isCenteredCol(col.id) ? 'text-center' : 'text-left'} overflow-hidden truncate ${col.id === 'agg' ? '' : 'text-gray-600'}`}>{editRenderCell(node, col.id)}</div>
                                        ))}
                                      <div></div>
                                      <div className="px-1.5 text-center flex items-center justify-center gap-1">
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
                      );
                     return (
                     <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col min-h-0">
                        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200 bg-gray-50/50 shrink-0">
                          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">OKR Tree Editor</h4>
                          <button onClick={() => handleEditTreeAction('add-obj')} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors" title="Add Objective">
                            Create Object
                          </button>
                          <div className="ml-auto"></div>
                          <ColumnToggle visibleColumns={editTreeVisibleColumns} onToggle={toggleEditTreeColumn} />
                          <button onClick={() => setEditTreeMaximized(!editTreeMaximized)} className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title={editTreeMaximized ? 'Minimize' : 'Maximize'}>
                            {editTreeMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                          </button>
                        </div>
                      {editTreeMaximized ? (
                        <FullScreenWindow onClose={() => setEditTreeMaximized(false)}>
                          <div className="p-4 bg-white" style={{ height: '100vh', overflow: 'auto' }}>
                            {editTreeHeader}
                            <div className="min-w-[900px]">
                              {editTreeRows}
                            </div>
                            <div className="text-[10px] text-gray-400 italic px-2 py-0.5 bg-gray-50/50 border-t border-gray-100">Các dữ liệu mang tính chất minh họa, tham khảo tài liệu chức năng để nắm rõ hơn</div>
                          </div>
                        </FullScreenWindow>
                      ) : (
                        <div className="overflow-x-auto flex-1 min-h-0">
                          {editTreeHeader}
                          <div className="min-w-[900px]">
                            {editTreeRows}
                          </div>
                        </div>
                      )}
                      <div className="px-5 pb-4">
                        <DisclaimerNote />
                      </div>
                    </div>
                     );
                   })()}
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
              <button onClick={handleConfirmClose} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700">Confirm exit</button>
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
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
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
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
              
              {/* STEP 1: UPLOAD & REVIEW */}
              {importStep === 1 && (
                <div className="p-6 flex-1 min-h-0 overflow-auto flex flex-col">
                  {importFileStatus === 'idle' && (
                    <div className="max-w-xl w-full mx-auto my-auto animate-fade-in flex flex-col justify-center h-full pb-10">
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
                          <div>
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
                          <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm relative">
                            <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">Template Info</div>
                            <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-2">Imported Template Information</h4>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Title <span className="text-red-500">*</span></label>
                                <input type="text" maxLength={120} value={importFormData.title} onChange={(e) => { setImportFormData({...importFormData, title: e.target.value}); if(e.target.value) setImportFormErrors({...importFormErrors, title: null}); }} placeholder="Ex: Q4 Global Product Launch" className={`w-full p-1.5 border ${importFormErrors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded text-xs focus:outline-none focus:ring-1`} />
                                {importFormErrors.title && <p className="text-[10px] text-red-500 mt-0.5 flex items-center"><AlertCircle size={10} className="mr-1"/>{importFormErrors.title}</p>}
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Description (Optional)</label>
                                <textarea value={importFormData.desc} onChange={(e) => setImportFormData({...importFormData, desc: e.target.value})} placeholder="Leave empty to use default..." className="w-full p-1.5 border border-gray-300 rounded text-xs h-12 focus:outline-none focus:ring-1 focus:ring-blue-500 custom-scrollbar" />
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Domain/Tags (Optional)</label>
                                <input type="text" value={importFormData.tags} onChange={(e) => setImportFormData({...importFormData, tags: e.target.value})} placeholder="Separate by comma (,)" className="w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5">
                            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center shadow-sm">
                              <p className="text-sm font-bold text-gray-800">{mockImportParsedTree.stats.total}</p>
                              <p className="text-[9px] text-gray-500 mt-0.5">Total Nodes</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center shadow-sm">
                              <p className="text-sm font-bold text-gray-800">{mockImportParsedTree.stats.obj}</p>
                              <p className="text-[9px] text-gray-500 mt-0.5">Objectives</p>
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
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-0">
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
                <div className="flex flex-1 min-h-0 animate-fade-in">
                  {/* Left Column */}
                  <div className="w-[45%] bg-white border-r border-gray-200 p-4 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                    <h3 className="text-base font-bold text-gray-800 mb-0.5">Field Selection</h3>
                    
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 mb-2 shrink-0">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                          checked={importSelectedFields.length === availableFields.length}
                          onChange={(e) => { 
                            if(e.target.checked) setImportSelectedFields(availableFields.map(f => f.id));
                            else setImportSelectedFields(['name']);
                          }}
                        />
                        <span className="font-semibold text-xs text-gray-800">Select All Fields</span>
                      </label>
                      <span className="text-[10px] text-gray-500">{availableFields.length} fields · {importSelectedFields.length} selected</span>
                    </div>

                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-2 flex shrink-0">
                      <span className="w-[140px]">FIELD NAME</span>
                      <span>DESCRIPTION</span>
                    </div>

                    <div className="space-y-0 border-t border-gray-100 flex-1">
                      {availableFields.map(field => {
                        const isChecked = importSelectedFields.includes(field.id);
                        return (
                          <div key={field.id} className="py-2 px-2 border-b border-gray-100 flex gap-3 hover:bg-gray-50 transition">
                            <div className="w-[140px] flex items-start gap-2">
                              <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 cursor-pointer" 
                                checked={isChecked} disabled={field.locked} onChange={() => toggleImportField(field.id)} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${!isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{field.id}</span>
                                  <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-medium">{field.type === 'number' ? 'num' : field.type}</span>
                                </div>
                                {field.locked && <div className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> Required field</div>}
                                
                              </div>
                            </div>
                            <div className="flex-1 text-xs text-gray-500">
                              <p className={!isChecked ? 'line-through opacity-50' : ''}>{field.desc}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 space-y-1.5 shrink-0">
                      <div className="flex flex-wrap gap-1 text-xs">
                        <span className="font-semibold text-green-600"><Check size={11} className="inline mr-0.5"/> Selected ({importSelectedFields.length}):</span>
                        {importSelectedFields.map(fId => {
                          const f = availableFields.find(x => x.id === fId);
                          return f ? <span key={f.id} className="text-green-700 bg-green-50 px-1 py-0.5 rounded border border-green-200">{f.label}</span> : null;
                        })}
                      </div>
                      {importSelectedFields.length < availableFields.length && (
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="font-semibold text-orange-600"><AlertTriangle size={11} className="inline mr-0.5"/> Using defaults ({availableFields.length - importSelectedFields.length}):</span>
                          {availableFields.filter(f => !importSelectedFields.includes(f.id)).map(f => (
                            <span key={f.id} className="text-orange-700 bg-orange-50 px-1 py-0.5 rounded border border-orange-200">{f.label}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (OKR Tree Preview) */}
                  <div className="flex-1 p-6 bg-slate-50 flex flex-col min-h-0 overflow-hidden">
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
                        onNodeClick={(node) => openNodeDetail(node, 'edit')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW */}
              {importStep === 3 && (
                <div className="flex flex-1 min-h-0 animate-fade-in">
                  {/* Left Column */}
                  <div className="w-[35%] bg-white border-r border-gray-200 p-4 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3 text-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mx-auto mb-2 shadow-md">
                        <Check size={20} strokeWidth={3} />
                      </div>
                      <h3 className="text-base font-bold text-gray-800 mb-0.5">Ready to Import</h3>
                      <p className="text-xs text-gray-600">{mockImportParsedTree.stats.valid} of {mockImportParsedTree.stats.total} nodes will be imported</p>
                      {mockImportParsedTree.stats.error > 0 && (
                        <p className="text-[11px] text-red-500 font-medium mt-0.5">{mockImportParsedTree.stats.error} nodes skipped due to errors.</p>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-gray-800 mb-2">Import Summary</h4>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center p-2 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-600">Total Nodes in File</span>
                        <span className="text-base font-bold text-gray-800">{mockImportParsedTree.stats.total}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border border-green-100">
                        <span className="text-xs font-semibold text-green-700">Nodes Ready</span>
                        <span className="text-base font-bold text-green-700">{mockImportParsedTree.stats.valid}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg border border-red-100">
                        <span className="text-xs font-semibold text-red-700">Nodes Skipped</span>
                        <span className="text-base font-bold text-red-700">{mockImportParsedTree.stats.error}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h4 className="text-xs font-bold text-gray-800 mb-2">Field Selection Summary</h4>
                      <div className="space-y-1.5">
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
                  <div className="flex-1 p-6 bg-slate-50 flex flex-col min-h-0 overflow-hidden">
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
                        onNodeClick={(node) => openNodeDetail(node, 'edit')}
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
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
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
                              else setExportSelectedFields(['name']);
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
                                  checked={isChecked} disabled={field.id === 'name'} onChange={() => toggleExportField(field.id)} />
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
                    <div className="mt-4 pt-2 border-t border-gray-100 space-y-1.5 shrink-0">
                      <div className="flex flex-wrap gap-1 text-xs">
                        <span className="font-semibold text-green-600"><Check size={11} className="inline mr-0.5"/> Selected ({exportSelectedFields.length}):</span>
                        {availableFields.filter(f => exportSelectedFields.includes(f.id)).map(f => (
                          <span key={f.id} className="text-green-700 bg-green-50 px-1 py-0.5 rounded border border-green-200">{f.label}</span>
                        ))}
                      </div>
                      {exportSelectedFields.length < availableFields.length && (
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="font-semibold text-orange-600"><AlertTriangle size={11} className="inline mr-0.5"/> Excluded ({availableFields.length - exportSelectedFields.length}):</span>
                          {availableFields.filter(f => !exportSelectedFields.includes(f.id)).map(f => (
                            <span key={f.id} className="text-orange-700 bg-orange-50 px-1 py-0.5 rounded border border-orange-200">{f.label}</span>
                          ))}
                        </div>
                      )}
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
${exportSelectedFields.includes('progress') ? `\n    // - selected field -\n    "progress_percent": 75,` : ''}
    
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
                              <div key={tId} onClick={() => { const previewNode = { id: t.id.toString(), name: t.title, description: t.desc, type: 'objective', user: t.creator, timeline: t.date }; openNodeDetail(previewNode, 'edit'); }} className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
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
    ${exportSelectedFields.includes('progress') ? `"progress_percent": 0,` : ''}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-500/75 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col overflow-hidden">
            
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
              <div className="w-[35%] p-4 overflow-y-auto bg-white border-r border-gray-200 custom-scrollbar relative">
                
                {addStep === 1 && (
                  <div className="space-y-3 animate-fade-in flex flex-col h-full">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-1 shrink-0">Template Library</h3>
                    <div className="relative shrink-0">
                      <input 
                        type="text" 
                        value={addSearchQuery}
                        onChange={(e) => setAddSearchQuery(e.target.value)}
                        placeholder="Search templates..."
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-1 pr-1">
                      {filteredTemplates.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => setSelectedTemplateId(t.id)}
                          className={`p-3 border rounded-md cursor-pointer transition-all ${selectedTemplateId === t.id ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50 hover:border-blue-300'}`}
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className="font-semibold text-sm text-[#1e3a8a]">{t.title}</h4>
                            {selectedTemplateId === t.id && <CheckCircleIcon />}
                          </div>
                          <p className="text-xs text-gray-500 mb-1 line-clamp-1">{t.desc || <span className="italic text-gray-400">Default description</span>}</p>
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
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 space-y-1.5 shrink-0">
                      <div className="flex flex-wrap gap-1 text-xs">
                        <span className="font-semibold text-green-600"><Check size={11} className="inline mr-0.5"/> Selected ({addSelectedFields.length}):</span>
                        {addSelectedFields.map(fId => {
                          const f = availableFields.find(x => x.id === fId);
                          return f ? <span key={f.id} className="text-green-700 bg-green-50 px-1 py-0.5 rounded border border-green-200">{f.label}</span> : null;
                        })}
                      </div>
                      {addSelectedFields.length < availableFields.length && (
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="font-semibold text-orange-600"><AlertTriangle size={11} className="inline mr-0.5"/> Using defaults ({availableFields.length - addSelectedFields.length}):</span>
                          {availableFields.filter(f => !addSelectedFields.includes(f.id)).map(f => (
                            <span key={f.id} className="text-orange-700 bg-orange-50 px-1 py-0.5 rounded border border-orange-200">{f.label}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {addStep === 3 && (
                  <div className="space-y-3 animate-fade-in flex flex-col h-full">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-1 shrink-0">Review Summary</h3>
                    {tableData.length > 0 && (
                      <div className="bg-red-50 border border-red-200 p-2 rounded shrink-0 shadow-sm">
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

                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                      <div className="bg-blue-50/50 p-2 rounded-md border border-blue-100">
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
              
              <div className="w-[65%] flex flex-col h-full bg-gray-50/50 custom-scrollbar border-l border-gray-200 relative">
                {addStep === 1 && (
                  <div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6">
                    {selectedTemplateId ? (
                      <>
                        <div className="mb-4 flex items-center justify-between shrink-0">
                          <span className="text-sm font-medium text-gray-700">Template OKR Structure</span>
                          {selectedTemplateData?.tree && (
                            <span className="text-xs text-gray-500">
                              {(() => { const tree = selectedTemplateData.tree; const objCount = tree.length; const krCount = tree.reduce((s, o) => s + (o.children?.length || 0), 0); return `${objCount + krCount} nodes · ${objCount} Objectives · ${krCount} KRs`; })()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-h-0">
                           {renderPreviewTree(false, availableFields.map(f=>f.id), false, selectedTemplateData?.tree || sampleTreeData, addPreviewVisibleColumns, toggleAddPreviewColumn, previewMaximized, setPreviewMaximized)}
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
                  <div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6">
                    <div className="mb-4 shrink-0">
                       <span className="text-sm font-bold text-gray-700 block">Import Data Preview</span>
                       <span className="text-xs text-gray-500">Preview how nodes will be created on Timeline.</span>
                    </div>
                    <div className="flex-1 min-h-0">
                      {renderPreviewTree(true, addSelectedFields, false, selectedTemplateData?.tree || sampleTreeData, addPreviewVisibleColumns, toggleAddPreviewColumn, previewMaximized, setPreviewMaximized)}
                    </div>
                  </div>
                )}
                {addStep === 3 && (
                  <div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6">
                    <div className="mb-4 shrink-0">
                       <span className="text-sm font-bold text-gray-700 block">Final Validation Preview</span>
                       <span className="text-xs text-gray-500">Final OKR structure to be applied.</span>
                    </div>
                    <div className="flex-1 min-h-0">
                      {renderPreviewTree(true, addSelectedFields, true, selectedTemplateData?.tree || sampleTreeData, addPreviewVisibleColumns, toggleAddPreviewColumn, previewMaximized, setPreviewMaximized)}
                    </div>
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col overflow-hidden">
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
              <div className="w-[35%] p-4 overflow-y-auto bg-white border-r border-gray-200 custom-scrollbar relative">
                {saveStep === 1 && (
                  <div className="space-y-3 animate-fade-in">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2">Template Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                      <input type="text" maxLength={120} value={formData.title} onChange={(e) => { setFormData({...formData, title: e.target.value}); if(e.target.value) setFormErrors({...formErrors, title: null}); }} placeholder="e.g., Q3 Sales Team Template" className={`w-full p-2 border ${formErrors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-md text-sm focus:outline-none focus:ring-1`} />
                      {formErrors.title && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle size={12} className="mr-1"/>{formErrors.title}</p>}
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the purpose..." className="w-full p-2 border border-gray-300 rounded-md text-sm h-20 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Domain</label><input type="text" value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} placeholder="e.g., Engineering" className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label><input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="e.g., Sales, Quarterly, Focus" className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                  </div>
                )}
                {saveStep === 2 && (
                  <div className="animate-fade-in flex flex-col h-full">
                    <div className="mb-4 shrink-0">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Field Selection</h3>
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
                            <div className="w-2/3 flex flex-col justify-center"><span className={`text-sm ${isChecked ? 'text-gray-600' : 'text-gray-400 line-through'}`}>{field.desc}</span></div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 space-y-1.5 shrink-0">
                      <div className="flex flex-wrap gap-1 text-xs">
                        <span className="font-semibold text-green-600"><Check size={11} className="inline mr-0.5"/> Selected ({selectedFields.length}):</span>
                        {availableFields.filter(f => selectedFields.includes(f.id)).map(f => (
                          <span key={f.id} className="text-green-700 bg-green-50 px-1 py-0.5 rounded border border-green-200">{f.label}</span>
                        ))}
                      </div>
                      {selectedFields.length < availableFields.length && (
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="font-semibold text-orange-600"><AlertTriangle size={11} className="inline mr-0.5"/> Using defaults ({availableFields.length - selectedFields.length}):</span>
                          {availableFields.filter(f => !selectedFields.includes(f.id)).map(f => (
                            <span key={f.id} className="text-orange-700 bg-orange-50 px-1 py-0.5 rounded border border-orange-200">{f.label}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {saveStep === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-1">Review Summary</h3>
                    <div className="space-y-2">
                      <div><span className="text-xs text-gray-500 block mb-0.5">Template Title</span><div className="font-medium text-gray-900">{formData.title}</div></div>
                      <div><span className="text-xs text-gray-500 block mb-0.5">Description</span><div className="text-sm text-gray-700">{formData.description || <span className="text-gray-400 italic">No description provided</span>}</div></div>
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
              <div className="w-[65%] flex flex-col h-full bg-gray-50/50 custom-scrollbar border-l border-gray-200">
                {saveStep === 1 && (<div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6"><div className="mb-4 flex items-center justify-between shrink-0"><span className="text-sm font-medium text-gray-700">Previewing OKR from current View</span><span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">Total Nodes: {tableData.length}</span></div><div className="flex-1 min-h-0">{renderPreviewTree(false, selectedFields, false, tableToTreeArray(tableData), savePreviewVisibleColumns, toggleSavePreviewColumn, previewMaximized, setPreviewMaximized)}</div></div>)}
                {saveStep === 2 && (<div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6"><div className="mb-4 shrink-0"><span className="text-sm font-medium text-gray-700 block">Field Preview</span><span className="text-xs text-gray-500">Live preview of how unchecking fields affects the template.</span></div><div className="flex-1 min-h-0">{renderPreviewTree(true, selectedFields, false, tableToTreeArray(tableData), savePreviewVisibleColumns, toggleSavePreviewColumn, previewMaximized, setPreviewMaximized)}</div></div>)}
                {saveStep === 3 && (<div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6"><div className="mb-4 flex items-center shrink-0"><CheckSquare size={16} className="text-green-500 mr-2" /><span className="text-sm font-medium text-gray-700">Final Template Structure</span></div><div className="flex-1 min-h-0">{renderPreviewTree(true, selectedFields, false, tableToTreeArray(tableData), savePreviewVisibleColumns, toggleSavePreviewColumn, previewMaximized, setPreviewMaximized)}</div></div>)}
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
              <SubNavItem label="OKR" active={activeView === 'okr-dashboard'} icon={<BarChart2 size={14} />} onClick={() => navigateView('okr-dashboard')} />
              <SubNavItem label="OKR Template" isNew active={activeView === 'okr-template'} icon={<FileText size={14} />} onClick={() => navigateView('okr-template')} />
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

        <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col space-y-4 relative z-0 ${isSaveAsMode ? 'hidden' : ''}`}>
          
          {/* --- OKR BOARD MAIN VIEW --- */}
          {!isBranchAddMode && !isSaveAsMode && activeView === 'okr-dashboard' && (
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
                      <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                        {tableData.length === 0 ? (
                          <button onClick={() => { setIsTemplateDropdownOpen(false); handleOpenEmptyAddTemplate(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center font-medium"><Plus size={14} className="mr-2 text-green-500" /> Add template</button>
                        ) : (
                          <button onClick={() => { setIsTemplateDropdownOpen(false); setIsBranchSelectOpen(true); setSelectedBranchRowId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center font-medium"><Plus size={14} className="mr-2 text-green-500" /> Add template</button>
                        )}
                        {tableData.length > 0 && (
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
                    <div className="w-24">User</div><div className="w-24">Group</div><div className="w-24">Team</div><div className="w-24">Assign To</div><div className="w-32">Metric</div><div className="w-28">M.Name</div><div className="w-32">M.Key</div><div className="w-16">M.Unit</div><div className="w-16">Agg.Type</div><div className="w-24 text-center">Result</div><div className="w-32">Progress</div><div className="w-16 text-center">Risk</div><div className="w-12 text-center">TL</div><div className="w-12 text-center">IC+</div><div className="w-10 text-center">Actions</div>
                  </div>
                  <div className="flex flex-col text-[11px] bg-white">
                    {tableData.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                         <FolderTree size={40} className="mb-3 opacity-30" />
                         <p className="text-sm font-medium">No OKR data in this Timeline</p>
                         <p className="text-xs mt-1 mb-4">Get started by adding a template.</p>
                         <button onClick={handleOpenEmptyAddTemplate} className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5"><FileText size={14} /> Add template</button>
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
                              {row.level === 3 && <User size={14} className="mr-1.5 text-purple-500 shrink-0 mt-0.5" />}
                              {row.level === 4 && <User size={14} className="mr-1.5 text-purple-500 shrink-0 mt-0.5" />}
                              <div className="flex flex-col">
                                <span onClick={() => openNodeDetail({ ...row, id: row.id.toString(), description: row.subtitle, timeline: selectedPeriod, type: row.level === 0 ? 'objective' : 'kr', progress: row.progress, mName: row.mName, mKey: row.mKey, mUnit: row.mUnit }, 'edit')}
                                  className={`font-medium cursor-pointer hover:text-blue-600 hover:underline ${row.level === 0 ? 'text-blue-600' : 'text-gray-700'} line-clamp-1`}>{row.name}</span>
                                {row.subtitle && <span className="text-[10px] text-gray-400 mt-0.5">{row.subtitle}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="w-24 text-gray-600 flex items-center">{row.user ? <><div className="w-5 h-5 rounded-full bg-gray-200 mr-1.5 overflow-hidden"><img src={`https://i.pravatar.cc/100?img=${(row.id%50) + 10}`} alt="u"/></div>{row.user}</> : <span className="text-gray-300">Default</span>}</div>
                          <div className="w-24 text-gray-600">{row.group || <span className="text-gray-300">No Group</span>}</div><div className="w-24 text-gray-600">{row.team || <span className="text-gray-300">No Team</span>}</div><div className="w-24 text-gray-600">{row.assignTo || <span className="text-gray-300">No Group</span>}</div>
                          <div className="w-32 text-gray-600 whitespace-pre-line leading-tight">{row.metric || <span className="text-gray-300">Default</span>}</div><div className="w-28 text-gray-600">{row.mName || <span className="text-gray-300">Default</span>}</div><div className="w-32 text-gray-600 font-mono text-[10px] truncate">{row.mKey || `M-KEY-${row.id}`}</div><div className="w-16 text-gray-600">{row.mUnit || 'unit'}</div>
                          <div className="w-16"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${row.agg === 'AVG' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{row.agg}</span></div>
                          <div className="w-24 flex items-center justify-center space-x-1"><div className="flex flex-col items-center"><span className="text-[9px] text-gray-400 bg-gray-100 px-1 rounded mb-0.5">S</span><span className="font-medium text-gray-600">{row.resultS || 0}</span></div><div className="text-gray-300">/</div><div className="flex flex-col items-center"><span className="text-[9px] text-blue-400 bg-blue-50 border border-blue-100 px-1 rounded mb-0.5">C</span><span className="font-medium text-blue-600">{row.resultC || 0}</span></div></div>
                          <div className="w-32 pr-4"><div className="flex justify-between items-center mb-1"><span className="text-green-600 font-medium">{row.progress}%</span><span className="text-[9px] text-gray-400">Default</span></div><div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{ width: `${row.progress}%` }}></div></div></div>
                          <div className="w-16 flex flex-col items-center justify-center"><AlertTriangle size={14} className="text-red-500 mb-0.5" /><span className="text-[9px] text-gray-400">{row.risk}</span></div>
                          <div className="w-12 flex justify-center"><div className="flex items-center text-gray-500"><ArrowUp size={12} className="text-green-500 mr-0.5" />{row.tl}</div></div><div className="w-12 flex justify-center text-gray-400">-</div>
                          <div className="w-10 flex flex-col items-center justify-center gap-0.5">
                            <button onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setActionDropdown({ rowId: row.id, top: r.bottom + 4, left: r.right - 208 }); }} className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Actions"><MoreVertical size={13} /></button>
                            <button onClick={(e) => e.stopPropagation()} className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-green-600 transition-colors" title="Add"><Plus size={13} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* --- BRANCH ADD TEMPLATE INLINE WIZARD --- */}
          {isBranchAddMode && (
            <div className="flex flex-col flex-1 min-h-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4"><div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center"><FolderTree size={16} /></div>
                  <div><h2 className="text-lg font-bold text-[#1e3a8a]">{branchInfo?.isFullBoard ? 'Add template to' : 'Add Template to Branch'}</h2>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-0.5">
                      {branchInfo?.isFullBoard ? (<><span>Space: <strong className="text-blue-700">{branchInfo?.space || '...'}</strong></span><span>Timeline: <strong className="text-blue-700">{branchInfo?.period || '...'}</strong></span></>)
                      : (<><span>Space: <strong className="text-blue-700">{branchInfo?.space || '...'}</strong></span><span>Timeline: <strong className="text-blue-700">{branchInfo?.period || '...'}</strong></span><span>Branch: <strong className="text-blue-700">{branchInfo?.nodeName || '...'}</strong></span><span>Level: <strong className="text-blue-700">{branchInfo ? getLevelCategory(branchInfo.nodeLevel) : '...'}</strong></span></>)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex border-b border-gray-100 bg-white shrink-0">
                {[1, 2, 3].map(step => (<div key={step} className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${branchAddStep === step ? 'border-blue-600 text-blue-600' : branchAddStep > step ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400'}`}><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-2 ${branchAddStep === step ? 'bg-blue-600 text-white' : branchAddStep > step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{branchAddStep > step ? <Check size={12} /> : step}</div>{step === 1 ? '1. Select Template' : step === 2 ? '2. Field Import' : '3. Review & Apply'}</div>))}
              </div>
              <div className="flex-1 overflow-hidden flex bg-gray-50/50">
                <div className="w-[35%] p-4 overflow-y-auto bg-white border-r border-gray-200 custom-scrollbar relative">
                  {branchAddStep === 1 && (<div className="space-y-3 animate-fade-in flex flex-col h-full"><h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-1 shrink-0">Template Library</h3><div className="relative shrink-0"><input type="text" value={branchAddSearchQuery} onChange={(e) => setBranchAddSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm" /><Search size={14} className="absolute left-2.5 top-2 text-gray-400" /></div><div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-1 pr-1">{filteredBranchTemplates.map(t => (<div key={t.id} onClick={() => setBranchSelectedTemplateId(t.id)} className={`p-3 border rounded-md cursor-pointer ${branchSelectedTemplateId === t.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}><h4 className="font-semibold text-sm text-[#1e3a8a]">{t.title}</h4><p className="text-xs text-gray-500 mb-1">{t.desc}</p></div>))}{filteredBranchTemplates.length === 0 && (<div className="flex flex-col items-center justify-center py-8 text-gray-400"><Search size={28} className="mb-2 opacity-30" /><p className="text-sm">No matching templates</p></div>)}</div></div>)}
                  {branchAddStep === 2 && (<div className="animate-fade-in flex flex-col h-full"><h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Field Selection</h3><div className="bg-gray-50 p-4 rounded border border-gray-200 flex justify-between items-center mb-4"><label className="flex items-center font-bold text-sm cursor-pointer"><input type="checkbox" checked={addSelectedFields.length === availableFields.length} onChange={() => { if (addSelectedFields.length === availableFields.length) setAddSelectedFields(['name']); else setAddSelectedFields(availableFields.map(f => f.id)); }} className="mr-3 w-4 h-4 rounded" /> Select All</label><span className="text-xs text-gray-500">{addSelectedFields.length} selected</span></div><div className="flex-1 overflow-y-auto border border-gray-200 rounded">{[...availableFields].map(f => { const c = addSelectedFields.includes(f.id); return (<div key={f.id} className="flex px-3 py-3 border-b border-gray-50"><input type="checkbox" checked={c} disabled={f.locked} onChange={() => { const s = new Set(addSelectedFields); s.has(f.id) ? s.delete(f.id) : s.add(f.id); setAddSelectedFields([...s]); }} className="mr-3 w-4 h-4 rounded" /><span className={c ? 'font-medium text-sm' : 'text-gray-400 line-through text-sm'}>{f.label}</span></div>); })}</div></div>)}
                  {branchAddStep === 3 && (<div className="space-y-3 animate-fade-in flex flex-col h-full"><h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-1 shrink-0">Review</h3><div className="bg-amber-50 border border-amber-200 p-2 rounded"><AlertTriangle className="text-amber-500 mr-2 inline" size={18} />{branchInfo?.isFullBoard ? 'Template will be applied to this timeline.' : 'Template will be added as sibling of the selected branch.'}</div></div>)}
                </div>
                <div className="w-[65%] flex flex-col h-full bg-gray-50/50 border-l border-gray-200 relative">
                   {branchAddStep === 1 && (<div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6">{branchSelectedTemplateId ? (<div className="flex-1 min-h-0">{renderPreviewTree(false, availableFields.map(f=>f.id), false, branchSelectedTemplateData?.tree || sampleTreeData, addPreviewVisibleColumns, toggleAddPreviewColumn, previewMaximized, setPreviewMaximized)}</div>) : (<div className="h-full flex flex-col items-center justify-center text-gray-400"><FolderTree size={48} className="mb-3 opacity-20" /><p className="text-sm">Select a template</p></div>)}</div>)}
                  {branchAddStep === 2 && (<div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6"><div className="mb-4 shrink-0"><span className="text-sm font-bold text-gray-700 block">Import Data Preview</span></div><div className="flex-1 min-h-0">{renderPreviewTree(true, addSelectedFields, false, branchSelectedTemplateData?.tree || sampleTreeData, addPreviewVisibleColumns, toggleAddPreviewColumn, previewMaximized, setPreviewMaximized)}</div></div>)}
                  {branchAddStep === 3 && (<div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6"><div className="mb-4 shrink-0"><span className="text-sm font-bold text-gray-700 block">Final Preview</span></div><div className="flex-1 min-h-0">{renderPreviewTree(true, addSelectedFields, true, branchSelectedTemplateData?.tree || sampleTreeData, addPreviewVisibleColumns, toggleAddPreviewColumn, previewMaximized, setPreviewMaximized)}</div></div>)}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
                <div className="text-xs text-gray-500">{branchAddStep === 2 && `${addSelectedFields.length} fields selected`}</div>
                <div className="flex space-x-3 ml-auto">
                  <button onClick={() => window.close()} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium">Cancel</button>
                  {branchAddStep > 1 && (<button onClick={() => setBranchAddStep(prev => prev - 1)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium">Back</button>)}
                  {branchAddStep < 3 ? (<button onClick={() => { if (branchAddStep === 1 && !branchSelectedTemplateId) return; setBranchAddStep(prev => Math.min(prev + 1, 3)); }} disabled={branchAddStep === 1 && !branchSelectedTemplateId} className={`px-4 py-2 rounded-md text-sm font-medium ${branchAddStep === 1 && !branchSelectedTemplateId ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-[#2563eb] text-white'}`}>Continue</button>)
                  : (<button onClick={branchInfo?.isFullBoard ? handleEmptyApplyTemplate : handleBranchApplyTemplate} className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-bold"><Download size={16} className="mr-2" />{branchInfo?.isFullBoard ? 'Apply to Timeline' : 'Apply to Branch'}</button>)}
                </div>
              </div>
            </div>
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

        {isSaveAsMode && (
        <div className="flex flex-col flex-1 min-h-0 bg-white overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <button onClick={() => window.close()} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-200 rounded-md" title="Close">
              <X size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-[#1e3a8a]">Save as Template</h2>
              <p className="text-xs text-gray-500">Select OKR nodes to create a reusable template</p>
            </div>
          </div>
          <div className="flex border-b border-gray-100 bg-white shrink-0">
            {[1, 2, 3].map(step => (
              <div key={step} className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${saveAsStep === step ? 'border-blue-600 text-blue-600' : saveAsStep > step ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-2 ${saveAsStep === step ? 'bg-blue-600 text-white' : saveAsStep > step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{saveAsStep > step ? <Check size={12} /> : step}</div>
                {step === 1 ? '1. Select Nodes' : step === 2 ? '2. Field Selection' : '3. Review & Confirm'}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-hidden flex bg-gray-50/50">
            <div className="w-[35%] p-4 overflow-y-auto bg-white border-r border-gray-200 custom-scrollbar relative">
              {saveAsStep === 1 && (
                <div className="animate-fade-in flex flex-col h-full space-y-3">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide shrink-0">Template Info</h3>
                  <div className="shrink-0"><label className="block text-xs font-bold text-gray-700 mb-0.5">Title <span className="text-red-500">*</span></label>
                    <input type="text" maxLength={120} value={saveAsFormData.title} onChange={(e) => { setSaveAsFormData({...saveAsFormData, title: e.target.value}); if(e.target.value) setSaveAsFormErrors({...saveAsFormErrors, title: null}); }} placeholder="e.g., Q3 Sales Team Template" className={`w-full p-2 border ${saveAsFormErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`} />
                    {saveAsFormErrors.title && <p className="text-xs text-red-500 mt-1 flex items-center"><AlertCircle size={12} className="mr-1"/>{saveAsFormErrors.title}</p>}
                  </div>
                  <div className="shrink-0"><label className="block text-xs font-bold text-gray-700 mb-0.5">Description</label><textarea value={saveAsFormData.description} onChange={(e) => setSaveAsFormData({...saveAsFormData, description: e.target.value})} placeholder="Describe the purpose..." className="w-full p-2 border border-gray-300 rounded-md text-sm h-16 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                  <div className="shrink-0"><label className="block text-xs font-bold text-gray-700 mb-0.5">Domain</label><input type="text" value={saveAsFormData.domain} onChange={(e) => setSaveAsFormData({...saveAsFormData, domain: e.target.value})} placeholder="e.g., Engineering" className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                  <div className="shrink-0"><label className="block text-xs font-bold text-gray-700 mb-0.5">Tags (Comma separated)</label><input type="text" value={saveAsFormData.tags} onChange={(e) => setSaveAsFormData({...saveAsFormData, tags: e.target.value})} placeholder="e.g., Sales, Quarterly" className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                  <div className="shrink-0 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">Nodes to save</span>
                      <span className="text-xs text-gray-500">{saveAsSelectedNodeIds.size} selected</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveAsSelectAll} className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100">Select All</button>
                      <button onClick={handleSaveAsDeselectAll} className="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded hover:bg-gray-100">Deselect All</button>
                    </div>
                  </div>
                </div>
              )}
              {saveAsStep === 2 && (
                <div className="animate-fade-in flex flex-col h-full">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 shrink-0">Field Selection</h3>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center mb-4 shrink-0">
                    <label className="flex items-center font-medium text-sm text-gray-800 cursor-pointer">
                      <input type="checkbox" checked={saveAsSelectedFields.length === availableFields.length} onChange={() => { if (saveAsSelectedFields.length === availableFields.length) setSaveAsSelectedFields(['name']); else setSaveAsSelectedFields(availableFields.map(f => f.id)); }} className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300" />
                      Select All Fields
                    </label>
                    <span className="text-xs text-gray-500">{saveAsSelectedFields.length} selected</span>
                  </div>
                  <div className="flex-1 overflow-y-auto border border-gray-200 rounded custom-scrollbar min-h-[200px]">
                    <div className="flex px-2 py-2 bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200"><div className="w-1/3">Field Name</div><div className="w-2/3">Description</div></div>
                    {availableFields.map(field => {
                      const isChecked = saveAsSelectedFields.includes(field.id);
                      return (
                        <div key={field.id} className="flex px-2 py-3 border-b border-gray-50 hover:bg-gray-50 transition">
                          <div className="w-1/3 flex items-start">
                            <input type="checkbox" checked={isChecked} disabled={field.locked} onChange={() => toggleSaveAsField(field.id)} className={`mt-1 mr-3 w-4 h-4 rounded border-gray-300 ${field.locked ? 'text-gray-400' : 'text-blue-600 cursor-pointer'}`} />
                            <div><span className="font-medium text-sm text-gray-800">{field.label}</span></div>
                          </div>
                          <div className="w-2/3 flex flex-col justify-center"><span className={`text-sm ${isChecked ? 'text-gray-600' : 'text-gray-400 line-through'}`}>{field.desc}</span></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 space-y-1.5 shrink-0">
                    <div className="flex flex-wrap gap-1 text-xs">
                      <span className="font-semibold text-green-600"><Check size={11} className="inline mr-0.5"/> Selected ({saveAsSelectedFields.length}):</span>
                      {availableFields.filter(f => saveAsSelectedFields.includes(f.id)).map(f => <span key={f.id} className="text-green-700 bg-green-50 px-1 py-0.5 rounded border border-green-200">{f.label}</span>)}
                    </div>
                    {saveAsSelectedFields.length < availableFields.length && (
                      <div className="flex flex-wrap gap-1 text-xs">
                        <span className="font-semibold text-orange-600"><AlertTriangle size={11} className="inline mr-0.5"/> Using defaults ({availableFields.length - saveAsSelectedFields.length}):</span>
                        {availableFields.filter(f => !saveAsSelectedFields.includes(f.id)).map(f => <span key={f.id} className="text-orange-700 bg-orange-50 px-1 py-0.5 rounded border border-orange-200">{f.label}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {saveAsStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-1">Review Summary</h3>
                  <div className="space-y-2">
                    <div><span className="text-xs text-gray-500 block mb-0.5">Template Title</span><div className="font-medium text-gray-900">{saveAsFormData.title}</div></div>
                    <div><span className="text-xs text-gray-500 block mb-0.5">Description</span><div className="text-sm text-gray-700">{saveAsFormData.description || <span className="text-gray-400 italic">No description</span>}</div></div>
                    <div><span className="text-xs text-gray-500 block mb-1">Nodes Selected</span><div className="text-sm font-medium text-blue-600">{saveAsSelectedNodeIds.size} node(s)</div></div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Fields Mapped</span>
                      <div className="text-sm"><span className="font-medium text-blue-600">{saveAsSelectedFields.length}</span> out of {availableFields.length} fields.</div>
                      <div className="mt-2 space-y-2">
                        {saveAsSelectedFields.length > 0 && (
                          <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                            <span className="font-semibold flex items-center mb-1"><Check size={12} className="mr-1"/> Selected ({saveAsSelectedFields.length}):</span>
                            <div className="flex flex-wrap gap-1">{availableFields.filter(f => saveAsSelectedFields.includes(f.id)).map(f => <span key={f.id} className="bg-white px-1 py-0.5 rounded border border-green-200 text-green-700">{f.label}</span>)}</div>
                          </div>
                        )}
                        {saveAsSelectedFields.length < availableFields.length && (
                          <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                            <span className="font-semibold flex items-center mb-1"><AlertTriangle size={12} className="mr-1"/> Not selected ({availableFields.length - saveAsSelectedFields.length}):</span>
                            <div className="flex flex-wrap gap-1">{availableFields.filter(f => !saveAsSelectedFields.includes(f.id)).map(f => <span key={f.id} className="bg-white px-1 py-0.5 rounded border border-orange-200 text-orange-700">{f.label}</span>)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-[65%] flex flex-col h-full bg-gray-50/50 border-l border-gray-200 relative">
              {saveAsStep === 1 && (
                <div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6">
                  <div className="flex items-center justify-between shrink-0 mb-3">
                    <span className="text-xs font-medium text-gray-600">Select nodes to save by checking the boxes below</span>
                    <span className="text-xs text-gray-500">{saveAsSelectedNodeIds.size} of {getAllDescendantIds(saveAsTreeData).length} selected</span>
                  </div>
                  <div className="flex-1 min-h-0">
                    {renderPreviewTree(false, saveAsSelectedFields, false, saveAsTreeData, saveAsPreviewVisibleColumns, (c) => setSaveAsPreviewVisibleColumns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]), false, null, true, saveAsSelectedNodeIds, (id) => handleSaveAsToggleNode(id))}
                  </div>
                </div>
              )}
              {saveAsStep === 2 && (
                <div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6">
                  <div className="mb-4 shrink-0">
                    <span className="text-sm font-medium text-gray-700 block">Field Preview</span>
                    <span className="text-xs text-gray-500">Live preview of how fields affect the template.</span>
                  </div>
                  <div className="flex-1 min-h-0">
                    {(() => {
                      const filterSelected = (nodes) => nodes.filter(n => saveAsSelectedNodeIds.has(n.id)).map(n => ({ ...n, children: n.children ? filterSelected(n.children) : [] }));
                      return renderPreviewTree(true, saveAsSelectedFields, false, filterSelected(saveAsTreeData), saveAsPreviewVisibleColumns, (c) => setSaveAsPreviewVisibleColumns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]), false, null);
                    })()}
                  </div>
                </div>
              )}
              {saveAsStep === 3 && (
                <div className="animate-fade-in flex flex-col flex-1 min-h-0 p-6">
                  <div className="mb-4 flex items-center shrink-0">
                    <CheckSquare size={16} className="text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Final Template Structure</span>
                  </div>
                  <div className="flex-1 min-h-0">
                    {(() => {
                      const filterSelected = (nodes) => nodes.filter(n => saveAsSelectedNodeIds.has(n.id)).map(n => ({ ...n, children: n.children ? filterSelected(n.children) : [] }));
                      return renderPreviewTree(true, saveAsSelectedFields, false, filterSelected(saveAsTreeData), saveAsPreviewVisibleColumns, (c) => setSaveAsPreviewVisibleColumns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]), false, null);
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
            <div className="text-xs text-gray-500">
              {saveAsStep === 1 && `${saveAsSelectedNodeIds.size} nodes selected`}
              {saveAsStep === 2 && `${saveAsSelectedFields.length} of ${availableFields.length} fields selected`}
            </div>
            <div className="flex space-x-3 ml-auto">
              <button onClick={() => window.close()} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
              {saveAsStep > 1 && (<button onClick={() => setSaveAsStep(prev => prev - 1)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition">Back</button>)}
              {saveAsStep < 3 ? (
                <button onClick={handleNextSaveAsStep} disabled={saveAsStep === 1 && (saveAsSelectedNodeIds.size === 0 || !saveAsFormData.title.trim())} className={`px-4 py-2 rounded-md text-sm font-medium transition shadow-sm ${saveAsStep === 1 && (saveAsSelectedNodeIds.size === 0 || !saveAsFormData.title.trim()) ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-[#2563eb] text-white hover:bg-blue-700'}`}>Continue</button>
              ) : (
                <button onClick={handleSaveAsSubmit} className="px-6 py-2 bg-[#16a34a] text-white rounded-md text-sm font-bold hover:bg-green-700 transition shadow-sm flex items-center"><Download size={16} className="mr-2" /> Save Template</button>
              )}
            </div>
          </div>
        </div>
        )}

      </div>
      
      {renderNodeDetailSidePanel()}
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

