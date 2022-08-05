export interface QueryInput{
    KeyConditionExpression: string
    ExpressionValues: ExpressionValues
}

export interface Key{
    [key: string]: any,
}

export interface ExpressionValues{
    [expression: string]: any,
}