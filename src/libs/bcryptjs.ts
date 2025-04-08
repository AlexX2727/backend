
import * as bcryptjs from 'bcryptjs';


export const encrypt = async (password: string, salt = 10) => {    
    return await bcryptjs.hash(password, salt);
}

export const compare = async (pasword: string, hash: string) => {
    return await bcryptjs.compare(pasword, hash);
}