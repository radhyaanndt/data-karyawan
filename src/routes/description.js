const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const DescriptionController = require('../controllers/description.controller');

router.get('/', DescriptionController.getAllDescriptions);
router.get('/:id', DescriptionController.getDescriptionById);
router.post('/', [check('title').notEmpty(), check('content').notEmpty()], DescriptionController.createDescription);
router.put('/:id', [check('title').notEmpty(), check('content').notEmpty()], DescriptionController.updateDescription);
router.delete('/:id', DescriptionController.deleteDescription);

module.exports = router;
