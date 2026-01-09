import { useState, useCallback } from "react"

export function useUser() {
    const [userName, setUserName] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("mindful_journal_user") || null
        }
        return null
    })

    const [lockerPassword, setLockerPassword] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("mindful_journal_locker_pw") || null
        }
        return null
    })

    const saveUserName = useCallback((name: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("mindful_journal_user", name)
            setUserName(name)
        }
    }, [])

    const saveLockerPassword = useCallback((password: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("mindful_journal_locker_pw", password)
            setLockerPassword(password)
        }
    }, [])

    const verifyLockerPassword = useCallback((input: string) => {
        return lockerPassword !== null && input === lockerPassword
    }, [lockerPassword])

    const hasLockerPassword = useCallback(() => lockerPassword !== null, [lockerPassword])

    return {
        userName,
        saveUserName,
        lockerPassword,
        saveLockerPassword,
        verifyLockerPassword,
        hasLockerPassword
    }
}
