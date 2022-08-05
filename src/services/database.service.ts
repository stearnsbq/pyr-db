import {Injectable} from '@pyrjs/core'
import { ClassicLevel } from 'classic-level';
import { QueryInput } from '../model/Query';

@Injectable()
export class DatabaseService{
    
    private _db: ClassicLevel 

    constructor(){
        this._db = new ClassicLevel("./db.pyr", {valueEncoding: 'json'})
    }


    public query(query: QueryInput){
        
    }

    public get_item(){

    }

    public delete_item(){

    }

    public update(){

    }

}