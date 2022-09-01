require('dotenv').config()

import { PyrFactory } from "@pyrjs/core";
import { AppModule } from "./src/app.module";
import { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { QueryExpressionParser } from "./src/model/QueryExpressionParser";
import { QueryExpressionTokenizer } from "./src/model/QueryExpressionTokenizer";
import { QueryExpressionSemanticAnalyzer } from "./src/model/QueryExpressionSemanticAnalyzer";
import { DatabaseService } from "./src/services/database.service";

PyrFactory.create(8080, AppModule, [helmet({ crossOriginEmbedderPolicy: false,}), morgan('tiny'), cors({origin: '*'})]).then(async (app: Application) => {
    console.log("Your pyrjs app is now running on port: 8080")

    const db = new DatabaseService()

   await db.put({
        Value:{
            "pk": "EntryPoint",
            "sk": "id#123",
            "test": 123
        }
   })

    // db.query({
    //     PartitionKey: 'Dome',
    //     SortKeyConditionExpression: 'begins_with(sk, :sk)',
    //     ExpressionValues:{
    //         ':sk': 'quad'
    //     }

    // }).then(console.log)


    db.scan({FilterExpression: "sk = :sk and test = :test", FilterExpressionValues: {":sk": "id#123", ":test": 1234}}).then(console.log)


})