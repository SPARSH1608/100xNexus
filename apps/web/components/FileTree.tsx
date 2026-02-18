import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import {
    Folder,
    FileCode,
    ChevronRight,
    ChevronDown,

    Edit2,
    FilePlus,
    FolderPlus,
    Trash2,
} from 'lucide-react';

export type FileSystemItem = {
    id: string;
    name: string;
    type: 'file' | 'folder';
    children?: FileSystemItem[];
    content?: string;
    isOpen?: boolean;
    path?: string;
};

interface FileTreeProps {
    items: FileSystemItem[];
    onSelect: (item: FileSystemItem) => void;
    onUpdate: (items: FileSystemItem[]) => void;
    socket: Socket | null;
    interviewId: string;
}

export default function FileTree({ items, onSelect, onUpdate, socket, interviewId }: FileTreeProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [draggedItem, setDraggedItem] = useState<FileSystemItem | null>(null);

    const toggleFolder = (id: string, currentItems: FileSystemItem[]): FileSystemItem[] => {
        return currentItems.map(item => {
            if (item.id === id) {
                return { ...item, isOpen: !item.isOpen };
            }
            if (item.children) {
                return { ...item, children: toggleFolder(id, item.children) };
            }
            return item;
        });
    };

    const handleToggle = (e: React.MouseEvent, item: FileSystemItem) => {
        e.stopPropagation();
        if (item.type === 'folder') {
            onUpdate(toggleFolder(item.id, items));
            if (socket) {
                socket.emit(item.isOpen ? "folder:collapsed" : "folder:expanded", { interviewId, id: item.id });
            }
        }
        onSelect(item);
        setSelectedId(item.id);
    };

    const findPathById = (id: string, currentItems: FileSystemItem[]): string | null => {
        for (const item of currentItems) {
            if (item.id === id) return item.path || null;
            if (item.children) {
                const found = findPathById(id, item.children);
                if (found) return found;
            }
        }
        return null;
    };

    const addItem = (parentId: string | null, type: 'file' | 'folder') => {
        const name = prompt(`Enter ${type} name:`);
        if (!name) return;

        const parentPath = parentId ? findPathById(parentId, items) : '/';
        const newPath = `${parentPath}${parentPath?.endsWith('/') ? '' : '/'}${name}`;

        const newItem: FileSystemItem = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            type,
            path: newPath,
            content: type === 'file' ? '// New file' : undefined,
            children: type === 'folder' ? [] : undefined,
            isOpen: true
        };

        const addToItems = (currentItems: FileSystemItem[]): FileSystemItem[] => {
            if (parentId === null) {
                return [...currentItems, newItem];
            }
            return currentItems.map(item => {
                if (item.id === parentId) {
                    return { ...item, children: [...(item.children || []), newItem], isOpen: true };
                }
                if (item.children) {
                    return { ...item, children: addToItems(item.children) };
                }
                return item;
            });
        };

        onUpdate(addToItems(items));

        if (socket) {
            socket.emit(type === 'folder' ? "folder:created" : "file:created", {
                interviewId,
                parentId,
                name,
                id: newItem.id,
                path: newPath, // Crucial: send the path
                type
            });
        }
    };

    const deleteItem = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this?')) return;

        const path = findPathById(id, items);

        const deleteFromItems = (currentItems: FileSystemItem[]): FileSystemItem[] => {
            return currentItems.filter(item => item.id !== id).map(item => {
                if (item.children) {
                    return { ...item, children: deleteFromItems(item.children) };
                }
                return item;
            });
        };

        onUpdate(deleteFromItems(items));

        if (socket) {
            socket.emit("file:deleted", { interviewId, id, path });
        }
    };

    const renameItem = (e: React.MouseEvent, id: string, type: 'file' | 'folder') => {
        e.stopPropagation();
        const currentPath = findPathById(id, items);
        const name = items.find(i => i.id === id)?.name;
        const newName = prompt(`Enter new ${type} name:`, name);
        if (!newName) return;

        const renameInItems = (currentItems: FileSystemItem[]): FileSystemItem[] => {
            return currentItems.map(item => {
                if (item.id === id) {
                    return { ...item, name: newName };
                }
                if (item.children) {
                    return { ...item, children: renameInItems(item.children) };
                }
                return item;
            });
        };

        onUpdate(renameInItems(items));

        if (socket) {
            socket.emit("file:renamed", { interviewId, id, path: currentPath, newName });
        }
    };


    const handleDragStart = (e: React.DragEvent, item: FileSystemItem) => {
        e.stopPropagation();
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, item: FileSystemItem) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedItem || draggedItem.id === item.id) return;

        if (item.type === 'folder') {
            e.dataTransfer.dropEffect = 'move';
            e.currentTarget.classList.add('bg-gray-700');
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('bg-gray-700');
    };

    const handleDrop = (e: React.DragEvent, targetItem: FileSystemItem | null) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('bg-gray-700');

        if (!draggedItem) return;

        if (targetItem && (draggedItem.id === targetItem.id)) return;

        if (targetItem && targetItem.type !== 'folder') return;

        const newParentId = targetItem ? targetItem.id : null;

        const removeItem = (items: FileSystemItem[], id: string): FileSystemItem[] => {
            return items.filter(i => i.id !== id).map(i => ({
                ...i,
                children: i.children ? removeItem(i.children, id) : undefined
            }));
        };

        const newItemsWithoutDragged = removeItem(items, draggedItem.id);

        const addToFolder = (items: FileSystemItem[], folderId: string | null, itemToAdd: FileSystemItem): FileSystemItem[] => {
            if (folderId === null) {
                return [...items, itemToAdd];
            }
            return items.map(item => {
                if (item.id === folderId) {
                    return { ...item, children: [...(item.children || []), itemToAdd], isOpen: true };
                }
                if (item.children) {
                    return { ...item, children: addToFolder(item.children, folderId, itemToAdd) };
                }
                return item;
            });
        };

        const finalItems = addToFolder(newItemsWithoutDragged, newParentId, draggedItem);
        onUpdate(finalItems);

        if (socket) {
            socket.emit("file:moved", {
                interviewId,
                id: draggedItem.id,
                newParentId
            });
        }

        setDraggedItem(null);
    };

    const renderTree = (currentItems: FileSystemItem[], depth = 0) => {
        return currentItems.map(item => (
            <div key={item.id} style={{ paddingLeft: `${depth * 8 + 12}px` }}>
                <div
                    className={`flex items-center py-[2px] cursor-pointer hover:bg-[#2a2d2e] ${selectedId === item.id ? 'bg-[#37373d] text-white' : ''} text-[13px] transition-colors duration-100 group`}
                    onClick={(e) => handleToggle(e, item)}
                    draggable // Enable drag
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={(e) => handleDragOver(e, item)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, item)}
                >
                    <span className="mr-1.5 text-gray-400 shrink-0">
                        {item.type === 'folder' && (
                            item.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                        )}
                    </span>
                    <span className="mr-2 text-[#519aba] shrink-0">
                        {item.type === 'folder' ? <Folder size={14} fill="currentColor" className="text-[#dcb67a]" /> : <FileCode size={14} />}
                    </span>
                    <span className="flex-1 truncate">{item.name}</span>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 pr-2">
                        {item.type === 'folder' && (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); addItem(item.id, 'file'); }} className="p-0.5 hover:text-white text-gray-400"><FilePlus size={12} /></button>
                                <button onClick={(e) => { e.stopPropagation(); addItem(item.id, 'folder'); }} className="p-0.5 hover:text-white text-gray-400"><FolderPlus size={12} /></button>
                            </>
                        )}
                        <button onClick={(e) => deleteItem(e, item.id)} className="p-0.5 hover:text-red-400 text-gray-400"><Trash2 size={12} /></button>
                        <button onClick={(e) => renameItem(e, item.id, item.type)} className="p-0.5 hover:text-blue-400 text-gray-400"><Edit2 size={12} /></button>
                    </div>
                </div>
                {item.isOpen && item.children && (
                    <div>{renderTree(item.children, depth + 1)}</div>
                )}
            </div>
        ));
    };

    return (
        <div
            className="select-none h-full text-[#cccccc]"
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
                if (e.isDefaultPrevented()) return;
                handleDrop(e, null);
            }}
        >
            <div className="hidden flex justify-between items-center mb-1 px-4 py-2 hover:bg-[#2a2d2e]">
            </div>
            <div className="py-1">
                {renderTree(items)}
            </div>
        </div>
    );
}
