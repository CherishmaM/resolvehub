export class ApiResponse {
  constructor(statusCode, data, message = 'Success', pagination = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
    if (pagination) {
      this.pagination = pagination;
    }
  }

  static success(data, message = 'Operation successful', statusCode = 200) {
    return new ApiResponse(statusCode, data, message);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static paginated(data, pagination, message = 'Data fetched successfully') {
    return new ApiResponse(200, data, message, pagination);
  }
}
