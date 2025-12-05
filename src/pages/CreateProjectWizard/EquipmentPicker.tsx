// import { useMemo, useState } from 'react'
// import type { Equipment } from '../types'
// import { EquipmentTabs } from './EquipmentTabs'
// import { EquipmentSearch } from './EquipmentSearch'
// import { EquipmentChips } from './EquipmentChips'
// import { EquipmentInlineAdd } from './EquipmentInlineAdd'

// export function EquipmentPicker({ verified, custom, selectedIds, onToggle }: { verified: Equipment[]; custom: Equipment[]; selectedIds: string[]; onToggle: (id: string) => void }) {
//   const [tab, setTab] = useState<'verified' | 'new'>('verified')
//   const [q, setQ] = useState('')
//   const [adding, setAdding] = useState(false)
//   const [customItems, setCustomItems] = useState<Equipment[]>(custom)

//   const filteredVerified = useMemo(() => verified.filter(e => e.name.toLowerCase().includes(q.toLowerCase())), [verified, q])
//   const filteredCustom = useMemo(() => customItems.filter(e => e.name.toLowerCase().includes(q.toLowerCase())), [customItems, q])

//   return (
//     <div>
//       <div className="flex items-center justify-between">
//         <EquipmentTabs active={tab} counts={{ verified: verified.length, new: customItems.length }} onChange={setTab} />
//         <button type="button" className="text-sm text-[#1f3a9d] hover:underline" onClick={() => setAdding(a => !a)}>Add Equipment</button>
//       </div>
//       <div className="mt-2">
//         <EquipmentSearch value={q} onChange={setQ} onClear={() => setQ('')} placeholder="Search equipment" />
//       </div>
//       {adding && (
//         <EquipmentInlineAdd
//           onConfirm={(name) => { 
//             const id = `c_${Date.now()}`
//             setCustomItems(list => [...list, { id, name, verified: false }])
//             onToggle(id)
//             setAdding(false)
//           }}
//           onCancel={() => setAdding(false)}
//           existingNames={[...verified, ...customItems].map(e => e.name)}
//         />
//       )}
//       <div className="mt-2">
//         {tab === 'verified' ? (
//           <EquipmentChips items={filteredVerified} selectedIds={selectedIds} onToggle={onToggle} verifiedBadge />
//         ) : (
//           <EquipmentChips items={filteredCustom} selectedIds={selectedIds} onToggle={onToggle} />
//         )}
//       </div>
//     </div>
//   )
// }


// EquipmentPicker.tsx

import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import React from 'react';
import { useMemo, useState, useEffect, useTransition, useCallback } from 'react'
import { Api_url } from '../../networkCalls/Apiurls';
import { showError, showSuccess } from '../../services/toasterService';
import { canAddEquipment } from '../../services/permissionsService';
import { getRequestStatus, postRequestStatus } from '../../networkCalls/NetworkCalls'
// import type { Equipment } from '../types'

// EquipmentChips Component
type Equipment = { id: string; name: string; verified: boolean; asset_type_id: number }

interface EquipmentChipsProps {
  items: Equipment[]
  selectedIds: string[]
  onToggle: (id: string) => void
  verifiedBadge?: boolean // Added to match usage in EquipmentPicker
  disabled?: boolean
}

const EquipmentChips = React.memo(function EquipmentChips({
  items,
  selectedIds,
  onToggle,
  verifiedBadge = false,
  disabled = false,
}: EquipmentChipsProps) {
  return (
    <motion.div
      className={`mt-3 flex flex-wrap gap-2 ${disabled ? 'opacity-50' : ''}`}
      role="listbox"
      aria-label="Equipment results"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {items.map(item => {
        const selected = selectedIds.includes(item.id)
        return (
          <motion.button
            key={item.id}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => !disabled && onToggle(item.id)}
            onKeyDown={(e) => { 
              if ((e.key === 'Enter' || e.key === ' ') && !disabled) { 
                e.preventDefault(); 
                onToggle(item.id) 
              } 
            }}
            disabled={disabled}
            className={[
              'group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A942]',
              selected
                ? 'border-2 border-[#58A942] bg-white text-[#58A942]'
                : 'border border-gray-300 bg-white text-gray-700 hover:border-[#58A942]/50 hover:shadow-sm',
              disabled ? 'cursor-not-allowed opacity-50' : ''
            ].join(' ')}
            whileHover={disabled ? {} : { scale: 1.03 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
          >
            <span className="relative z-10">{item.name}</span>
            {/* {verifiedBadge && <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">V</span>} */}
            <AnimatePresence>
              {selected && (
                <motion.span
                  className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#58A942]/10"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Check size={12} strokeWidth={3} className="text-[#58A942]" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}
    </motion.div>
  )
})

// Memoize the chip rendering logic if needed, but React.memo on the component should suffice

// EquipmentInlineAdd Component (unchanged, as it's not in hot path)
interface EquipmentInlineAddProps {
  onConfirm: (name: string) => Promise<void> // <-- changed to support async
  onCancel: () => void
  existingNames: string[]
  disabled?: boolean
}

function EquipmentInlineAdd({ onConfirm, onCancel, existingNames, disabled = false }: EquipmentInlineAddProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false) // <-- loading state

  async function confirm() {
    if (disabled) return;
    const name = value.trim()
    if (!name) {
      // setError('This equipment name cannot be empty')
      showError('Please enter equipment name.')
      return
    }
    if (existingNames.some(n => n.toLowerCase() === name.toLowerCase())) {
      setError('This equipment already exists')
      showError('This equipment already exists')
      return
    }

    try {
      setLoading(true)
      await onConfirm(name) // <-- await the API
      setValue('')
      setError(null)
    } catch (err) {
      // setError('Failed to add equipment')
      showError('Failed to add equipment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`mt-3 flex items-center gap-2 ${disabled ? 'opacity-50' : ''}`}>
      <input
        className="flex-1 rounded-lg border px-3 py-2 outline-none"
        placeholder="Enter new equipment"
        value={value}
        onChange={(e) => { if (!disabled) { setValue(e.target.value); if (error) setError(null); } }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !disabled) confirm()
          if (e.key === 'Escape' && !disabled) onCancel()
        }}
        aria-label="Enter new equipment"
        disabled={loading || disabled} // <-- optionally disable input too
      />

      <button
        type="button"
        onClick={confirm}
        disabled={loading || disabled}
        className={`inline-flex items-center justify-center rounded-lg p-2 text-green-600 transition ${loading || disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:text-green-700 active:text-green-800'
          } focus:outline-none focus:ring-2 focus:ring-green-400`}
        aria-label="Confirm add"
        title="Confirm"
      >
        {loading ? '…' : '✔'}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={loading || disabled}
        className={`inline-flex items-center justify-center rounded-lg p-2 text-rose-600 transition ${loading || disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:text-rose-700 active:text-rose-800'
          } focus:outline-none focus:ring-2 focus:ring-rose-400`}
        aria-label="Cancel add"
        title="Cancel"
      >
        ✖
      </button>
      <div className="sr-only" aria-live="polite">{error ? error : ''}</div>
    </div>
  )
}

// EquipmentSearch Component (enhance debounce if needed, but 250ms is fine)
interface EquipmentSearchProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onClear: () => void
  disabled?: boolean
}

function EquipmentSearch({ value, onChange, placeholder, onClear, disabled = false }: EquipmentSearchProps) {
  const [inner, setInner] = useState(value)

  useEffect(() => setInner(value), [value])
  useEffect(() => {
    const id = setTimeout(() => {
      if (inner !== value) onChange(inner)
    }, 250)
    return () => clearTimeout(id)
  }, [inner, value, onChange])

  return (
    <div className={`flex items-center gap-2 rounded-lg border border-[#D8DDE4] px-3 py-2 ${disabled ? 'opacity-50' : ''}`}>
      <span aria-hidden>🔎</span>
      <input
        className="w-full bg-transparent outline-none"
        value={inner}
        onChange={(e) => !disabled && setInner(e.target.value)}
        placeholder={placeholder || 'Search equipment'}
        aria-label="Search equipment"
        disabled={disabled}
      />
      {inner && !disabled && (
        <button 
          type="button"
          aria-label="Clear search" 
          onClick={() => { setInner(''); onChange(''); onClear(); }} 
          className="rounded p-1 hover:bg-black/5"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// EquipmentTabs Component (memoize if tab changes frequently)
interface EquipmentTabsProps {
  active: 'verified' | 'new'
  counts: { verified: number; new: number }
  onChange: (v: 'verified' | 'new') => void
  disabled?: boolean
}

const EquipmentTabs = React.memo(function EquipmentTabs({ active, counts, onChange, disabled = false }: EquipmentTabsProps) {
  return (
    <div className={`flex items-center gap-6 ${disabled ? 'opacity-50' : ''}`}>
      {(['verified','new'] as const).map(key => (
        <button
          key={key}
          type="button"
          onClick={() => !disabled && onChange(key)}
          disabled={disabled}
          className={[
            'relative pb-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]',
            active === key ? 'text-[#1f3a9d]' : 'text-gray-600 hover:text-gray-900',
            disabled ? 'cursor-not-allowed' : ''
          ].join(' ')}
          aria-selected={active === key}
          role="tab"
        >
          {key === 'verified' ? 'AI Verified Equipment' : 'New Equipment'}
          <span className="ml-2 inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-gray-200 px-1 text-xs text-gray-700">{counts[key]}</span>
          {active === key && <span className="absolute inset-x-0 -bottom-[2px] h-[3px] rounded-full bg-[#1f3a9d]" aria-hidden />}
        </button>
      ))}
    </div>
  )
})

// Main EquipmentPicker Component
interface EquipmentPickerProps {
  selectedIds: string[]
  onToggle: (id: string) => void
  createdBy?: number
  assetTypeId?: number
  disabled?: boolean
}

export function EquipmentPicker({ selectedIds, onToggle, createdBy = 1, assetTypeId, disabled = false }: EquipmentPickerProps) {
  const [tab, setTab] = useState<'verified' | 'new'>('verified')
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const [allEquipments, setAllEquipments] = useState<Equipment[]>([])
  const [customItems, setCustomItems] = useState<Equipment[]>([])
  const [verified, setVerified] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)

  const [isPending, startTransition] = useTransition()
  // Memoize the permission check to prevent repeated calls on every render
  const canAddEquipmentMemo = useMemo(() => canAddEquipment(), [])

  // Fetch all equipments once (skip if disabled)
  const fetchEquipments = useCallback(() => {
    setLoading(true);
    getRequestStatus<any>(Api_url.getAllEquipments)
      .then(response => {
        const data = response.data;
        const equipments: Equipment[] = data.data.map((e: any) => ({
          id: e.equipment_id.toString(),
          name: e.equipment_name,
          verified: e.ai_verified_doc === true,
          asset_type_id: e.asset_type_id
        }));
        setAllEquipments(equipments);
      })
      .catch(err => {
        console.error('Failed to fetch equipments:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  // Clear invalid selections when assetTypeId changes
  useEffect(() => {
    if (assetTypeId !== undefined && allEquipments.length > 0) {
      const invalidIds = selectedIds.filter(id => {
        const equip = allEquipments.find(e => e.id === id);
        return equip && equip.asset_type_id !== assetTypeId;
      });

      if (invalidIds.length > 0) {
        invalidIds.forEach(id => onToggle(id));
      }
    }
  }, [assetTypeId, selectedIds, allEquipments, onToggle]);

  // Filter based on assetTypeId
  useEffect(() => {
    if (allEquipments.length === 0) return;
    const isSelected = (id: string) => selectedIds.includes(id);
    const verifiedList = allEquipments.filter(e => 
      (e.verified && (!assetTypeId || e.asset_type_id === assetTypeId)) || 
      (isSelected(e.id) && e.verified)
    );
    const customList = allEquipments.filter(e => 
      (!e.verified && (!assetTypeId || e.asset_type_id === assetTypeId)) || 
      (isSelected(e.id) && !e.verified)
    );
    startTransition(() => {
      setVerified(verifiedList);
      setCustomItems(customList);
    });
  }, [allEquipments, assetTypeId, selectedIds]);

  // Auto-set tab based on selected equipment's category
  useEffect(() => {
    if (selectedIds.length > 0 && allEquipments.length > 0) {
      const selectedEquip = allEquipments.find(e => selectedIds.includes(e.id));
      if (selectedEquip) {
        setTab(selectedEquip.verified ? 'verified' : 'new');
      }
    }
  }, [selectedIds, allEquipments]);

  const filteredVerified = useMemo(() =>
    verified.filter(e => e.name.toLowerCase().includes(q.toLowerCase())),
    [verified, q]
  );

  const filteredCustom = useMemo(() =>
    customItems.filter(e => e.name.toLowerCase().includes(q.toLowerCase())),
    [customItems, q]
  );

  const existingNames = useMemo(() =>
    [...verified, ...customItems].map(e => e.name),
    [verified, customItems]
  );

  const handleAddEquipment = useCallback(async (name: string) => {
    if (disabled || !canAddEquipmentMemo) return;
    try {
      // const staticUserId = localStorage.getItem("USER_ID");
      const body = {
        equipment_name: name,
        // created_by: staticUserId
      };
      if (assetTypeId !== undefined) {
        (body as any).asset_type_id = assetTypeId;
      }
      // Replace the fetch call with postRequestStatus
      const result = await postRequestStatus<{ data: { equipment_id: number; equipment_name: string; ai_verified_doc: boolean; asset_type_id?: number }; message: string }>(
        Api_url.createEquipment,
        body,
        {
          accept: 'application/json' // Optional: Add any extra headers if needed
        }
      );
      if (result.status !== 201) {  // Note: API returns 201, not 200
        throw new Error(`Failed to create equipment: ${result.status}`);
      }
      const data = result.data;
      if (!data || !data.data) {
        throw new Error('No data received from API');
      }
      const newEquip = {
        id: data.data.equipment_id.toString(),
        name: data.data.equipment_name,
        verified: data.data.ai_verified_doc === true,
        asset_type_id: data.data.asset_type_id || assetTypeId || 0
      };

      startTransition(() => {
        // Update allEquipments
        setAllEquipments(prev => [...prev, newEquip]);
        // Directly update the relevant list for immediate visibility
        if (newEquip.verified) {
          setVerified(prev => [...prev, newEquip]);
        } else {
          setCustomItems(prev => [...prev, newEquip]);
        }
        // Clear previous selections
        selectedIds.forEach(oldId => onToggle(oldId));
        onToggle(newEquip.id);
        // Switch tab to show the new equipment
        setTab(newEquip.verified ? 'verified' : 'new');
      });
      // Use API message for toaster
      showSuccess(data.message || 'Equipment added successfully');
    } catch (err) {
      console.error('Failed to add equipment:', err);
      showError('Failed to add equipment. Please try again.');
    } finally {
      setAdding(false);
    }
  }, [assetTypeId, onToggle, selectedIds, disabled, canAddEquipmentMemo]);

  const handleSingleSelect = useCallback((id: string) => {
    if (disabled) return;
    // Replace all selections with the one clicked
    if (selectedIds.includes(id)) {
      onToggle(id) // deselect same one (if desired)
    } else {
      // Clear old selections first
      selectedIds.forEach(oldId => onToggle(oldId))
      onToggle(id)
    }
  }, [onToggle, selectedIds, disabled])
  
  // Memoize the chips props to prevent unnecessary re-renders
  const chipsProps = useMemo(() => ({
    items: tab === 'verified' ? filteredVerified : filteredCustom,
    selectedIds,
    onToggle: handleSingleSelect,
    verifiedBadge: tab === 'verified',
    disabled
  }), [tab, filteredVerified, filteredCustom, selectedIds, handleSingleSelect, disabled]);

  // Memoize tabs props
  const tabsProps = useMemo(() => ({
    active: tab,
    counts: { verified: verified.length, new: customItems.length },
    onChange: setTab,
    disabled
  }), [tab, verified.length, customItems.length, disabled]);

  if (loading && !disabled) {
    return <div>Loading equipments...</div>
  }

  if (disabled && selectedIds.length === 0) {
    return <p className="text-sm text-gray-500">No equipment selected.</p>
  }

  return (
    <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      <div className="flex items-center justify-between">
        <EquipmentTabs {...tabsProps} />
        <button
          type="button"
          className={`text-sm ${(!disabled && canAddEquipmentMemo)
              ? 'text-[#1f3a9d] hover:underline'
              : 'text-gray-400 cursor-not-allowed'
            }`}
          onClick={() => {
            if (disabled || !canAddEquipmentMemo || isPending) return;
            setAdding(a => !a);
          }}
          disabled={disabled || !canAddEquipmentMemo || isPending}
        >
          Add Equipment
        </button>
      </div>
      <div className="mt-2">
        <EquipmentSearch
          value={q}
          onChange={setQ}
          onClear={() => setQ('')}
          placeholder="Search equipment"
          disabled={disabled}
        />
      </div>

      {/* Corrected here: call the function */}
      {adding && !disabled && canAddEquipmentMemo && (
        <EquipmentInlineAdd
          onConfirm={handleAddEquipment}
          onCancel={() => setAdding(false)}
          existingNames={existingNames}
          disabled={disabled}
        />
      )}
      <div className="mt-2">
        <EquipmentChips {...chipsProps} />
      </div>
    </div>
  )
}