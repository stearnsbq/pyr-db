export interface QueryInput{
    PartitionKey: string
    SortKeyConditionExpression: string
    ExpressionValues: ExpressionValues
    ProjectionExpression?: string
}



export interface ExpressionValues{
    [expression: string]: any,
}

