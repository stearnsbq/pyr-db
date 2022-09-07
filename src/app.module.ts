import { Module } from "@pyrjs/core";
import { MainController } from "./controller/main.controller";
import { DatabaseService } from "./services/database.service";

@Module({
    imports: [],
    controllers: [MainController],
    providers: [DatabaseService],
    exports: []
})
export class AppModule {


}
