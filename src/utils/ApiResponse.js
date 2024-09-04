class ApiResponse {
    constructor(statusCode, data, message = "success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        thia.success = statusCode < 400
    }
}