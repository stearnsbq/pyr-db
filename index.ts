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

PyrFactory.create(8080, AppModule, [helmet({ crossOriginEmbedderPolicy: false,}), morgan('tiny'), cors({origin: '*'})]).then((app: Application) => {
    console.log("Your pyrjs app is now running on port: 8080")

    const db = new DatabaseService()

    db.query({
        KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
        ExpressionValues:{
            ':pk': 'dome',
            ':sk': 'quad'
        }


    })


})