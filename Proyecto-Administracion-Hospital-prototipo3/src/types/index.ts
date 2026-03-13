export interface AppProps {
    title: string;
    description?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    author: User;
}
// Creador Cristian García CI:32.170.910