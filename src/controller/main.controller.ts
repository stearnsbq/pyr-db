import { Body, Controller, Post } from "@pyrjs/core";
import { GetItemInput } from "src/model/GetItem";
import { ScanInput } from "src/model/Scan";
import { DeleteItemInput } from "../model/DeleteItem";
import { QueryInput } from "../model/Query";
import { DatabaseService } from "../services/database.service";





@Controller('/')
export class MainController{


    constructor(private database: DatabaseService){

    }

    @Post('query')
    public query(@Body() body: QueryInput){

    }

    @Post('delete')
    public delete(@Body() body: DeleteItemInput){

    }

    @Post('scan')
    public scan(@Body() body: ScanInput){

    }

    @Post('get')
    public get(@Body() body: GetItemInput){
        
    }

}