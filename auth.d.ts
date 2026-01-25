declare module '#auth-utils' {
    interface User {
        id: number
        email: string | null
        nickname: string
        avatarUrl: string | null
        role: 'user' | 'admin'
    }
}

export { }
