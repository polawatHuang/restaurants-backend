const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const branchRoutes = require('./routes/branchRoutes');
const userRoutes = require('./routes/userRoutes');
const tableRoutes = require('./routes/tableRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/', apiRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tables', tableRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Restaurant API running on port ${PORT}`));