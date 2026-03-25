import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(
        () => JSON.parse(localStorage.getItem('itq_user') || 'null')
    )

    const login = (u) => {
        setUsuario(u)
        localStorage.setItem('itq_user', JSON.stringify(u))
    }

    const logout = () => {
        setUsuario(null)
        localStorage.removeItem('itq_user')
    }

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)