class ApiResponse {
  static success(res, data = {}, message = 'Operation successful', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static created(res, data = {}, message = 'Resource created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  static paginated(res, data = [], pagination = {}, message = 'Data retrieved successfully') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total: pagination.total || data.length,
        page: pagination.page || 1,
        limit: pagination.limit || data.length,
        totalPages: pagination.totalPages || 1,
        hasNextPage: pagination.hasNextPage || false,
        hasPrevPage: pagination.hasPrevPage || false
      }
    });
  }

  static error(res, message = 'Internal Server Error', error = 'INTERNAL_ERROR', statusCode = 500, details = null) {
    const response = {
      success: false,
      message,
      error
    };
    if (details) {
      response.details = details;
    }
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
