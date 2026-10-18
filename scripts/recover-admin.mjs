import 'dotenv/config';
import {createInterface} from 'node:readline/promises';
import {Writable} from 'node:stream';
import path from 'node:path';
import fs from 'node:fs';
import {createLocalAuthStore} from '../server/localAuthStore.ts';
const filename=path.resolve(process.env.DENTISPRO_DATA_DIR || '.dentispro-data','accounts.sqlite');
if(!fs.existsSync(filename)) throw Error('Banco de contas não encontrado. Confira a pasta do servidor.');
let muted=false;
const output=new Writable({write(chunk,_encoding,callback){if(!muted)process.stdout.write(chunk);callback();}});
const rl=createInterface({input:process.stdin,output,terminal:!!process.stdin.isTTY});
const secret=async(label)=>{process.stdout.write(label);muted=true;try{return await rl.question('');}finally{muted=false;process.stdout.write('\n');}};
const store=createLocalAuthStore(filename);
try{
 const email=await rl.question('E-mail do administrador: ');
 const password=await secret('Nova senha (mínimo 12 caracteres): ');
 const confirmation=await secret('Confirme a nova senha: ');
 if(password!==confirmation)throw Error('As senhas não coincidem. Nada foi alterado.');
 await store.recoverAdmin(email,password);
 console.log('Senha alterada. As sessões anteriores foram encerradas.');
}finally{rl.close();store.close();}
