const fresherRepository = require('../repositories/FresherRepository');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

const userRepository = require('../repositories/UserRepository');

class FresherService {
  async getProfile(userId) {
    let profile = await fresherRepository.findByUserId(userId);
    if (!profile) {
      const user = await userRepository.findById(userId);
      // Auto-create if not yet created
      profile = await fresherRepository.create({
        user: userId,
        fullName: user?.name || 'Fresher User',
        email: user?.email || 'user@example.com'
      });
      profile = await fresherRepository.findByUserId(userId);
    }
    return profile;
  }

  async updateProfile(userId, updateData) {
    let profile = await fresherRepository.findByUserId(userId, false);
    if (!profile) {
      throw new NotFoundError('Fresher profile not found', 'PROFILE_NOT_FOUND');
    }

    Object.assign(profile, updateData);
    await profile.save();

    return await fresherRepository.findByUserId(userId);
  }

  async uploadResume(userId, file) {
    if (!file) {
      throw new BadRequestError('Please provide a resume file', 'FILE_REQUIRED');
    }

    const profile = await fresherRepository.findByUserId(userId, false);
    if (!profile) {
      throw new NotFoundError('Fresher profile not found', 'PROFILE_NOT_FOUND');
    }

    // Upload to Cloudinary (or mock fallback)
    const uploadResult = await uploadToCloudinary(file.buffer, file.originalname, 'careerpilot/resumes');

    // Create Resume entity record
    const resumeRecord = await fresherRepository.createResumeRecord({
      user: userId,
      fresherProfile: profile._id,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id || '',
      fileName: file.originalname,
      fileType: uploadResult.format || 'pdf',
      fileSize: uploadResult.bytes || file.size || 0,
      isPrimary: true
    });

    // Update profile with resume URL and recalculate completion
    profile.resumeUrl = uploadResult.secure_url;
    profile.resumePublicId = uploadResult.public_id || '';
    await profile.save();

    return {
      resume: resumeRecord,
      profile: await fresherRepository.findByUserId(userId)
    };
  }

  async deleteResume(userId) {
    const profile = await fresherRepository.findByUserId(userId, false);
    if (!profile) {
      throw new NotFoundError('Fresher profile not found', 'PROFILE_NOT_FOUND');
    }

    if (profile.resumePublicId) {
      try {
        await deleteFromCloudinary(profile.resumePublicId);
      } catch (err) {
        console.warn(`Could not delete file from Cloudinary: ${err.message}`);
      }
    }

    profile.resumeUrl = '';
    profile.resumePublicId = '';
    await profile.save();
    await fresherRepository.deleteResumeRecord(userId);

    return {
      message: 'Resume deleted successfully',
      profile: await fresherRepository.findByUserId(userId)
    };
  }
}

module.exports = new FresherService();
