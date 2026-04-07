import { db } from "../config/db";
import { exit } from 'node:process'

const clearData = async() => {
    try {
        await db.sync({force : true});
        console.log('Datos eliminados correctamente');
        exit(0)
    } catch (error) {
        console.log(error);
        exit(1)
    }
}

console.log(process.argv[2])
if (process.argv[2] === '--clear') {
    clearData();
    
}