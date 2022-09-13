import { Body, Controller, Post, Res } from "@pyrjs/core";
import { GetItemInput } from "../model/GetItem";
import { ScanInput } from "../model/Scan";
import { DeleteItemInput } from "../model/DeleteItem";
import { QueryInput } from "../model/Query";
import { DatabaseService } from "../services/database.service";
import { PutItemInput } from "../model/PutItem";
import {Response} from 'express';





@Controller('/')
export class MainController{


    constructor(private database: DatabaseService){

    }

    @Post('query')
    public query(@Body() body: QueryInput, @Res() response: Response){

        try{    
            return response.status(200).json(this.database.query(body))
        }catch(err){
            return response.status(500);
        }

    }

    @Post('delete')
    public delete(@Body() body: DeleteItemInput, @Res() response: Response){
        try{    
            return response.status(200).json(this.database.delete_item(body))
        }catch(err){
            return response.status(500);
        }

    }

    @Post('scan')
    public scan(@Body() body: ScanInput, @Res() response: Response){
        try{    
            return response.status(200).json(this.database.scan(body))
        }catch(err){
            return response.status(500);
        }

    }

    @Post('get')
    public get(@Body() body: GetItemInput, @Res() response: Response){
        try{    
            return response.status(200).json(this.database.get_item(body))
        }catch(err){
            return response.status(500);
        }
        
    }

    @Post('put')
    public put(@Body() body: PutItemInput, @Res() response: Response){
        try{    
            return response.status(200).json(this.database.put(body))
        }catch(err){
            return response.status(500);
        }
        
    }

}