export interface QueryInput{
    PartitionKey: string,
    SortKeyConditionExpression: string
    ExpressionValues: ExpressionValues
}



export interface ExpressionValues{
    [expression: string]: any,
}

