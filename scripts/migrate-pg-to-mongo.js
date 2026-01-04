require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Import Mongoose models
const { Currency, CryptoCurrency, NewsArticle, User, Transaction } = require('../models');

// Import Sequelize models (from renamed folder)
const dbPg = require('../models_pg');

const connectMongo = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/money_finance_platform';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
};

const migrate = async () => {
    try {
        await connectMongo();

        // Sync Sequelize (to ensure connection)
        console.log('Connecting to PostgreSQL...');
        await dbPg.sequelize.authenticate();
        console.log('PostgreSQL connected');

        // Helper function to migrate a model
        const migrateModel = async (pgModel, mongoModel, name, mapFn = (x) => x) => {
            console.log(`Migrating ${name}...`);
            // Check if collection already has data to prevent duplicates if re-run (optional, but good)
            // But here we assume clean migration. Ideally we truncate or check.
            // Let's just catch duplicate key errors and log them.

            const records = await pgModel.findAll();
            console.log(`Found ${records.length} records for ${name}`);

            let count = 0;
            for (const item of records) {
                try {
                    const data = item.toJSON();
                    // Just copy everything relevant. Mongoose models are strict so extra fields like _previousDataValues won't hurt? 
                    // Better to be explicit or pass the plain object. `item.toJSON()` gives plain object.

                    // Explicit mapping for safety + preserving timestamps
                    const docData = {
                        ...data,
                        // Ensure ID is passed explicitly if Sequelize doesn't include it in toJSON (it usually does)
                        id: item.id,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt
                    };

                    await mongoModel.create(docData);
                    count++;
                } catch (err) {
                    if (err.code === 11000) {
                        console.log(`Record ${item.id} already exists, skipping.`);
                    } else {
                        console.error(`Error migrating ${name} ID ${item.id}:`, err.message);
                    }
                }
            }
            console.log(`Migrated ${count} records for ${name}`);
        };

        await migrateModel(dbPg.Currency, Currency, 'Currency');
        await migrateModel(dbPg.CryptoCurrency, CryptoCurrency, 'CryptoCurrency');
        await migrateModel(dbPg.NewsArticle, NewsArticle, 'NewsArticle');
        await migrateModel(dbPg.User, User, 'User');
        await migrateModel(dbPg.Transaction, Transaction, 'Transaction');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
