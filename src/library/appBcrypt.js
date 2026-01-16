import bcrypt from 'bcryptjs';

const saltRounds = 10;

export const encryptPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error encrypt:', error);
        throw error;
    }
};

export const comparePassword = async (password, hashedPassword) => {
    try {
        if (typeof password !== 'string' || typeof hashedPassword !== 'string') {
            console.error('Error: password or hash is not a string');
            throw new Error('data and hash must be strings');
        }

        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error) {
        console.error('Error comparing the hash:', error);
        throw error;
    }
};  