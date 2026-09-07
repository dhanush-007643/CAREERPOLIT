const invitationService = require('../services/InvitationService');
const ApiResponse = require('../utils/apiResponse');

class InvitationController {
  async createInvitation(req, res, next) {
    try {
      const invitation = await invitationService.createInvitation(req.user._id, req.body);
      return ApiResponse.created(res, invitation, 'Candidate invited successfully');
    } catch (error) {
      next(error);
    }
  }

  async getInvitations(req, res, next) {
    try {
      const result = await invitationService.getInvitations(req.user, req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Invitations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req, res, next) {
    try {
      const invitation = await invitationService.acceptInvitation(req.params.id, req.user._id);
      return ApiResponse.success(res, invitation, 'Invitation accepted successfully');
    } catch (error) {
      next(error);
    }
  }

  async rejectInvitation(req, res, next) {
    try {
      const invitation = await invitationService.rejectInvitation(req.params.id, req.user._id);
      return ApiResponse.success(res, invitation, 'Invitation rejected');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvitationController();
