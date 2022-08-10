export interface QueryInput{
    KeyConditionExpression: string
    ExpressionValues: ExpressionValues
    ProjectionExpression?: string
}



export interface ExpressionValues{
    [expression: string]: any,
}

