const Resource = require('../models/resource.models');

exports.createResource = async (req, res) => {
  try {
    const userId = req.student.id;
    const { heading, description, pdfData } = req.body;

    const resource = new Resource({
      userId,
      heading,
      description,
      pdfData
    });

    await resource.save();

    res.status(201).json({
      success: true,
      message: 'Resource saved successfully',
      resource
    });
  } catch (error) {
    console.error('Error saving resource:', error);
    res.status(500).json({ success: false, message: 'Failed to save resource' });
  }
};

exports.getAllResources = async (req, res) => {
  try {
    const userId = req.student.id;
    const resources = await Resource.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resources' });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const userId = req.student.id;
    const { id } = req.params;

    const resource = await Resource.findOneAndDelete({ _id: id, userId });

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ success: false, message: 'Failed to delete resource' });
  }
};
