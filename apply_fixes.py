import re

with open('src/App.jsx','r',encoding='utf8') as f:
    c = f.read()

# Fix 1: ColumnToggle - scroll max-h, no setIsOpen(false)
c = c.replace(
    '<div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1 w-40">\n          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">Show Columns</div>',
    '<div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1 w-40 max-h-[260px] overflow-y-auto custom-scrollbar">\n          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 sticky top-0 bg-white">Show Columns</div>'
)
c = c.replace(
    'onChange={() => {\n                  onToggle(col.id);\n                  setIsOpen(false);\n                }}',
    'onChange={() => {\n                  onToggle(col.id);\n                }}'
)

# Fix 2: FullScreenWindow - scrollPosRef
c = c.replace(
    'const FullScreenWindow = ({ children, onClose }) => {\n  const [container, setContainer] = useState(null);\n  const stateRef = useRef({});',
    'const FullScreenWindow = ({ children, onClose }) => {\n  const [container, setContainer] = useState(null);\n  const stateRef = useRef({});\n  const scrollPosRef = useRef(0);'
)
c = c.replace(
    'win.document.body.appendChild(div);\n\n    const done = new Promise(resolve => setTimeout(resolve, 0));',
    'win.document.body.appendChild(div);\n\n    div.addEventListener(\'scroll\', () => { scrollPosRef.current = div.scrollTop; });\n\n    const done = new Promise(resolve => setTimeout(resolve, 0));'
)
c = c.replace(
    '  }, []);\n\n  if (!container) return null;',
    '  }, []);\n\n  useEffect(() => {\n    if (container) {\n      container.scrollTop = scrollPosRef.current;\n    }\n  });\n\n  if (!container) return null;'
)

# Fix 3: All header cells get bg-gray-50
c = c.replace(
    'className={`${col.width} text-center shrink-0`}>{col.label}',
    'className={`${col.width} bg-gray-50 text-center shrink-0`}>{col.label}'
)

# Fix 4: viewTreeMaximized state
c = c.replace(
    'const [viewTreeVisibleColumns, setViewTreeVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);\n  const [viewCollapsedObjs, setViewCollapsedObjs] = useState({});',
    'const [viewTreeVisibleColumns, setViewTreeVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);\n  const [viewTreeMaximized, setViewTreeMaximized] = useState(false);\n  const [viewCollapsedObjs, setViewCollapsedObjs] = useState({});'
)

# Fix 5: editTreeMaximized + editTreeVisibleColumns state
c = c.replace(
    'const [editTreeData, setEditTreeData] = useState([]);',
    'const [editTreeData, setEditTreeData] = useState([]);\n  const [editTreeMaximized, setEditTreeMaximized] = useState(false);\n  const [editTreeVisibleColumns, setEditTreeVisibleColumns] = useState([...DEFAULT_VISIBLE_COLUMNS]);'
)

# Fix 6: toggleImportTreeColumn + toggleEditTreeColumn
c = c.replace(
    "  const toggleImportValidationColumn = (colId) => {\n    setImportValidationVisibleColumns(prev =>\n      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]\n    );\n  };\n\n  const handleFileSelect",
    "  const toggleImportValidationColumn = (colId) => {\n    setImportValidationVisibleColumns(prev =>\n      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]\n    );\n  };\n\n  const toggleImportTreeColumn = (colId) => {\n    setImportTreeVisibleColumns(prev =>\n      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]\n    );\n  };\n\n  const toggleEditTreeColumn = (colId) => {\n    setEditTreeVisibleColumns(prev =>\n      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]\n    );\n  };\n\n  const handleFileSelect"
)

# Fix 7: Import modal layout  
c = c.replace(
    '<div className="flex-1 overflow-y-auto bg-slate-50">',
    '<div className="flex-1 flex flex-col min-h-0 bg-slate-50">'
)
c = c.replace(
    '{importStep === 1 && (\n                <div className="p-6 h-full flex flex-col">\n                  {importFileStatus',
    '{importStep === 1 && (\n                <div className="flex-1 min-h-0 p-6 flex flex-col overflow-auto">\n                  {importFileStatus'
)
c = c.replace(
    'mx-auto my-auto animate-fade-in flex flex-col justify-center h-full pb-10">',
    'mx-auto my-auto animate-fade-in flex flex-col justify-center pb-10">'
)
c = c.replace(
    '<div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 animate-fade-in">',
    '<div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 p-6 animate-fade-in overflow-auto">'
)
c = c.replace(
    '<div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-[600px]">',
    '<div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-0">'
)
c = c.replace(
    '{importStep === 2 && (\n                <div className="flex h-full animate-fade-in">\n                  {/* Left Column */}\n                  <div className="w-[45%] bg-white border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">',
    '{importStep === 2 && (\n                <div className="flex flex-1 min-h-0 animate-fade-in">\n                  {/* Left Column */}\n                  <div className="w-[45%] bg-white border-r border-gray-200 p-6 flex flex-col overflow-y-auto custom-scrollbar">'
)
c = c.replace(
    'flex-1 p-6 bg-slate-50 flex flex-col h-full overflow-hidden">\n                    <div className="flex justify-between items-center mb-4 shrink-0">\n                      <div>\n                        <h3 className="text-base font-bold text-gray-800">OKR Tree Preview</h3>',
    'flex-1 p-6 bg-slate-50 flex flex-col overflow-hidden">\n                    <div className="flex justify-between items-center mb-4 shrink-0">\n                      <div>\n                        <h3 className="text-base font-bold text-gray-800">OKR Tree Preview</h3>'
)
c = c.replace(
    '{importStep === 3 && (\n                <div className="flex h-full animate-fade-in">\n                  {/* Left Column */}\n                  <div className="w-[35%] bg-white border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">',
    '{importStep === 3 && (\n                <div className="flex flex-1 min-h-0 animate-fade-in">\n                  {/* Left Column */}\n                  <div className="w-[35%] bg-white border-r border-gray-200 p-6 flex flex-col overflow-y-auto custom-scrollbar">'
)
c = c.replace(
    'flex-1 p-6 bg-slate-50 flex flex-col h-full overflow-hidden">\n                    <div className="flex justify-between items-center mb-4 shrink-0">\n                      <div>\n                        <h3 className="text-base font-bold text-gray-800">Final OKR Preview</h3>',
    'flex-1 p-6 bg-slate-50 flex flex-col overflow-hidden">\n                    <div className="flex justify-between items-center mb-4 shrink-0">\n                      <div>\n                        <h3 className="text-base font-bold text-gray-800">Final OKR Preview</h3>'
)

# Fix 8: renderImportValidationTree - alignment + FullScreenWindow
c = c.replace(
    'style={{ paddingLeft: \'16px\' }}>\n                  <div className="flex items-center gap-1 shrink-0" style={{ width: \'115px\' }}>',
    '>\n                  <div className="flex items-center gap-1 shrink-0" style={{ width: \'140px\', paddingLeft: \'14px\' }}>'
)
c = c.replace(
    'gap-1 ml-1',
    'gap-1.5 ml-1'
)
c = c.replace(
    'if (maximized) {\n      return (\n        <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-6">\n          <div className="bg-white rounded-xl shadow-2xl w-[80vw] h-[80vh] flex flex-col overflow-hidden relative">\n            <div className="absolute top-3 right-3 z-20">\n              <button onClick={() => onMaximize(false)} className="p-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-100 text-gray-600 transition-colors" title="Close">\n                <X size={18} />\n              </button>\n            </div>\n            <div className="flex-1 p-4 pt-12 overflow-hidden">',
    'if (maximized && onMaximize) {\n      return (\n        <FullScreenWindow onClose={() => onMaximize(false)}>'
)
c = c.replace(
    '</div>\n          </div>\n        </div>\n      );\n    }',
    '</FullScreenWindow>\n      );\n    }'
)

# Fix 9: openNodeDetail 'view' -> 'edit' (more lenient regex)
for _ in range(5):
    c = re.sub(r'openNodeDetail\(((?:[^)(]|\([^)]*\))*),\\s*\'view\'\\s*\)', r'openNodeDetail(\1, \'edit\')', c)

# Fix 10: previewUpdateCounter (todo1)
c = c.replace(
    'const [previewUpdateCounter, setPreviewUpdateCounter] = useState(0);\n\n  const previewTreeData',
    'const previewTreeData'
)
if 'previewUpdateCounter' not in c:
    c = c.replace(
        'const previewTreeData = {',
        'const [previewUpdateCounter, setPreviewUpdateCounter] = useState(0);\n\n  const previewTreeData = {'
    )

# Fix 11: makePreviewSave to increment counter
c = c.replace(
    '      setPreviewUpdateCounter(c => c + 1);\n      triggerToast(\'Node updated.\');',
    '      triggerToast(\'Node updated.\');'
)
if 'setPreviewUpdateCounter' not in c.split('makePreviewSave')[1].split('\n')[0:3]:
    c = c.replace(
        'Object.assign(td.krs[idx], updatedNode); }\n      triggerToast(\'Node updated.\');',
        'Object.assign(td.krs[idx], updatedNode); }\n      setPreviewUpdateCounter(c => c + 1);\n      triggerToast(\'Node updated.\');'
    )

# Fix 12: onSave in openNodeDetail and handleSaveNodeDetails
c = c.replace(
    'setNodeDetailConfig({ isOpen: true, mode, data: nodeData, path });',
    'setNodeDetailConfig({ isOpen: true, mode, data: nodeData, path, onSave });'
)
c = c.replace(
    'setNodeDetailConfig({ isOpen: false, mode: \'view\', data: null, path: [] });',
    'setNodeDetailConfig({ isOpen: false, mode: \'view\', data: null, path: [], onSave: null });'
)
c = c.replace(
    'const { path } = nodeDetailConfig;',
    'const { path, onSave } = nodeDetailConfig;'
)
c = c.replace(
    'if (path.length === 1) newTree[path[0]]',
    'if (onSave) {\n      onSave(editingNodeData, path);\n      closeNodeDetail();\n      triggerToast(\'Node changes saved.\');\n      return;\n    }\n    if (path.length === 1) newTree[path[0]]'
)

# Fix 13: makePreviewSave handler in renderPreviewTree
c = c.replace(
    'const makePreviewSave = (td) => (updatedNode) => {\n      if (td.objective && td.objective.id === updatedNode.id) Object.assign(td.objective, updatedNode);\n      else { const idx = td.krs.findIndex(k => k.id === updatedNode.id); if (idx >= 0) Object.assign(td.krs[idx], updatedNode); }\n      triggerToast(\'Node updated.\');\n    };',
    'const makePreviewSave = (td) => (updatedNode) => {\n      if (td.objective && td.objective.id === updatedNode.id) Object.assign(td.objective, updatedNode);\n      else { const idx = td.krs.findIndex(k => k.id === updatedNode.id); if (idx >= 0) Object.assign(td.krs[idx], updatedNode); }\n      setPreviewUpdateCounter(c => c + 1);\n      triggerToast(\'Node updated.\');\n    };'
)
c = c.replace(
    'onClick={() => openNodeDetail(treeData.objective, \'edit\')}',
    'onClick={() => openNodeDetail(treeData.objective, \'edit\', [], makePreviewSave(treeData))}'
)
c = c.replace(
    'onClick={() => openNodeDetail(kr, \'edit\')}',
    'onClick={() => openNodeDetail(kr, \'edit\', [], makePreviewSave(treeData))}'
)

# Fix 14: remove mt-6 in Import step 1 (todo5)
c = c.replace(
    '<div className="flex flex-col space-y-6">\n                          <div className="mt-6">',
    '<div className="flex flex-col space-y-6">\n                          <div>'
)

with open('src/App.jsx','w',encoding='utf8') as f:
    f.write(c)

print('All fixes applied')
