class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        error = [],
        statck = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        thia.success = false;
        this.errors = errors
        
        if (sstack) {
            this.stack = statck
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}