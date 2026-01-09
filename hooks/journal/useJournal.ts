import { useState, useEffect, useCallback, useMemo } from "react"

export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    pinned: boolean;
    locked: boolean;
    mood?: string | null;
    customColor?: string | null;
    titleFont?: string;
}

export function useJournal() {
    const [entries, setEntries] = useState<JournalEntry[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("mindful_journal_entries")
            return saved ? JSON.parse(saved) : []
        }
        return []
    })

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("mindful_journal_entries", JSON.stringify(entries))
        }
    }, [entries])

    const addEntry = useCallback((entry: Partial<JournalEntry>) => {
        const newEntry: JournalEntry = {
            title: "",
            content: "",
            ...entry,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            pinned: false,
            locked: false
        }
        setEntries(prev => [newEntry, ...prev])
        return newEntry
    }, [])

    const updateEntry = useCallback((id: string, updatedEntry: Partial<JournalEntry>) => {
        setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updatedEntry } : entry))
    }, [])

    const togglePin = useCallback((id: string) => {
        setEntries(prev => prev.map(entry =>
            entry.id === id ? { ...entry, pinned: !entry.pinned } : entry
        ))
    }, [])

    const toggleLock = useCallback((id: string) => {
        setEntries(prev => prev.map(entry =>
            entry.id === id ? { ...entry, locked: !entry.locked } : entry
        ))
    }, [])

    const deleteEntry = useCallback((id: string) => {
        setEntries(prev => prev.filter(entry => entry.id !== id))
    }, [])

    const sortedEntries = useMemo(() => {
        return [...entries].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1
            if (!a.pinned && b.pinned) return 1
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }, [entries])

    return { entries: sortedEntries, addEntry, updateEntry, deleteEntry, togglePin, toggleLock }
}
