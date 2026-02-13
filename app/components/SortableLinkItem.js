'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'

export function SortableLinkItem({ link, onToggleActive, onToggleHidden, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: link.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.5 : (link.is_active === false ? 0.5 : 1),
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-card border border-border p-4 rounded-xl flex items-center gap-3 group transition-all mb-3 ${isDragging ? 'shadow-2xl border-primary' : ''}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="text-muted-foreground cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors"
            >
                <GripVertical size={18} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">{link.title}</p>
                <p className="text-muted-foreground text-xs truncate">{link.original_url}</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => onToggleActive(link.id, link.is_active)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${link.is_active !== false ? 'bg-green-500' : 'bg-slate-600'
                            }`}
                        title={link.is_active !== false ? 'Active' : 'Deactivated'}
                    >
                        <span
                            className={`${link.is_active !== false ? 'translate-x-5' : 'translate-x-1'
                                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                    <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">Status</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => onToggleHidden(link.id, link.is_hidden)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${link.is_hidden ? 'bg-orange-500' : 'bg-slate-700'
                            }`}
                        title={link.is_hidden ? 'Hidden from Bio' : 'Visible in Bio'}
                    >
                        <span
                            className={`${link.is_hidden ? 'translate-x-5' : 'translate-x-1'
                                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                    <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">Bio</span>
                </div>

                <button
                    onClick={() => onDelete(link.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    )
}
