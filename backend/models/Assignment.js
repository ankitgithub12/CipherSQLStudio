const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  columnName: { type: String, required: true },
  dataType: { type: String, required: true }
}, { _id: false });

const tableSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  columns: [columnSchema],
  rows: [{ type: mongoose.Schema.Types.Mixed }] // Array of dynamic objects for sample data
}, { _id: false });

const expectedOutputSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['table'] }, // Currently only table is supported in data
  value: [{ type: mongoose.Schema.Types.Mixed }] // Array of dynamic objects for expected output rows
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  question: { type: String, required: true },
  sampleTables: [tableSchema],
  expectedOutput: expectedOutputSchema
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Assignment', assignmentSchema);
