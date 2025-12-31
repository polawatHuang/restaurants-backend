const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const branchRoutes = require('./routes/branchRoutes');
const userRoutes = require('./routes/userRoutes');
const tableRoutes = require('./routes/tableRoutes');
const promoRoutes = require('./routes/promoCodeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const salaryRoutes = require('./routes/salaryPaymentRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/', apiRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/promo-codes', promoRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/salary-payments', salaryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Restaurant API running on port ${PORT}`));