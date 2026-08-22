const Document = require('../models/Document');
const Case = require('../models/Case');
const Office = require('../models/Office');
const DocumentVersion = require('../models/DocumentVersion');
const { deleteFile, getStorageUsageBytes } = require('../services/storageService');
const { logAction } = require('../services/auditService');

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const office = await Office.findById(req.user.officeId);
    const quotaBytes = (office.storageQuotaMB || 0) * 1024 * 1024;
    const currentUsageBytes = await getStorageUsageBytes(req.user.officeId);

    if (currentUsageBytes + req.file.size > quotaBytes) {
      deleteFile(req.file.filename);
      const usedMB = (currentUsageBytes / (1024 * 1024)).toFixed(1);
      return res.status(400).json({
        message: `Storage quota exceeded. Using ${usedMB} MB of ${office.storageQuotaMB} MB allowed.`,
      });
    }

    const { caseId, clientId, category, tags, description } = req.body;

    if (caseId) {
      const foundCase = await Case.findOne({ _id: caseId, officeId: req.user.officeId });
      if (!foundCase) {
        return res.status(404).json({ message: 'Case not found in your office' });
      }
    }

    const document = await Document.create({
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      storageKey: req.file.filename,
      category,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      description,
      officeId: req.user.officeId,
      clientId: clientId || undefined,
      caseId: caseId || undefined,
      uploadedBy: req.user.id,
    });

    await logAction({
      userId: req.user.id,
      officeId: req.user.officeId,
      action: 'UPLOAD_DOCUMENT',
      resourceType: 'Document',
      resourceId: document._id,
      metadata: { fileName: document.fileName },
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      officeId: req.user.officeId,
      isArchived: false,
    })
      .populate('clientId', 'fullName')
      .populate('caseId', 'title')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const searchDocuments = async (req, res) => {
  try {
    const { fileName, category, tag, caseId, clientId, sortBy, order, page, limit } = req.query;

    const query = { officeId: req.user.officeId, isArchived: false };

    if (fileName) query.fileName = { $regex: fileName, $options: 'i' };
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (caseId) query.caseId = caseId;
    if (clientId) query.clientId = clientId;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const documents = await Document.find(query)
      .populate('clientId', 'fullName')
      .populate('caseId', 'title')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, officeId: req.user.officeId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const path = require('path');
    const filePath = path.join(__dirname, '..', 'uploads', document.storageKey);
    res.download(filePath, document.fileName);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const archiveDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, officeId: req.user.officeId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    document.isArchived = true;
    await document.save();

    await logAction({
      userId: req.user.id,
      officeId: req.user.officeId,
      action: 'ARCHIVE_DOCUMENT',
      resourceType: 'Document',
      resourceId: document._id,
    });

    res.json({ message: 'Document archived' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const uploadNewVersion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const document = await Document.findOne({ _id: req.params.id, officeId: req.user.officeId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const office = await Office.findById(req.user.officeId);
    const quotaBytes = (office.storageQuotaMB || 0) * 1024 * 1024;
    const currentUsageBytes = await getStorageUsageBytes(req.user.officeId);

    if (currentUsageBytes + req.file.size > quotaBytes) {
      deleteFile(req.file.filename);
      const usedMB = (currentUsageBytes / (1024 * 1024)).toFixed(1);
      return res.status(400).json({
        message: `Storage quota exceeded. Using ${usedMB} MB of ${office.storageQuotaMB} MB allowed.`,
      });
    }

    const { changeDescription } = req.body;

    await DocumentVersion.create({
      documentId: document._id,
      officeId: req.user.officeId,
      versionNumber: document.currentVersion || 1,
      fileName: document.fileName,
      storageKey: document.storageKey,
      fileSize: document.fileSize,
      uploadedBy: document.uploadedBy,
      changeDescription: changeDescription || 'Previous version',
    });

    document.fileName = req.file.originalname;
    document.storageKey = req.file.filename;
    document.fileSize = req.file.size;
    document.fileType = req.file.mimetype;
    document.uploadedBy = req.user.id;
    document.currentVersion = (document.currentVersion || 1) + 1;

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getVersionHistory = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, officeId: req.user.officeId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const versions = await DocumentVersion.find({ documentId: req.params.id }).sort({ versionNumber: -1 });

    res.json({
      currentVersion: {
        versionNumber: document.currentVersion,
        fileName: document.fileName,
        storageKey: document.storageKey,
        fileSize: document.fileSize,
        updatedAt: document.updatedAt,
      },
      previousVersions: versions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const downloadVersion = async (req, res) => {
  try {
    const version = await DocumentVersion.findById(req.params.versionId);
    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    const document = await Document.findOne({ _id: version.documentId, officeId: req.user.officeId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const path = require('path');
    const filePath = path.join(__dirname, '..', 'uploads', version.storageKey);
    res.download(filePath, version.fileName);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const handleView = async (id) => {
  try {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });

    const fileURL = window.URL.createObjectURL(response.data);

    window.open(fileURL, '_blank');

    // Give the browser time to open the file before revoking the URL
    setTimeout(() => {
      window.URL.revokeObjectURL(fileURL);
    }, 10000);
  } catch (err) {
    showToast('Failed to open document', 'error');
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  searchDocuments,
  downloadDocument,
  archiveDocument,
  uploadNewVersion,
  getVersionHistory,
  downloadVersion,
  handleView,
};