/**
 * Gera as iniciais de uma empresa baseado no nome
 * @param name Nome da empresa
 * @returns Iniciais (máximo 2 caracteres)
 */
export function getCompanyInitials(name: string): string {
    if (!name) return '';
    
    const words = name.trim().split(/\s+/);
    if (words.length === 0) return '';
    
    if (words.length === 1) {
        // Se só tem uma palavra, pega as primeiras 2 letras
        return name.substring(0, 2).toUpperCase();
    }
    
    // Pega a primeira letra de cada uma das duas primeiras palavras
    return (words[0][0] + words[1][0]).toUpperCase();
}

