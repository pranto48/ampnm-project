"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const node_cron_1 = __importDefault(require("node-cron"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./database");
const monitoring_1 = require("./monitoring");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
(0, database_1.initializeDatabase)();
app.use('/api', routes_1.default);
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../dist/index.html'));
    });
}
node_cron_1.default.schedule('*/30 * * * * *', () => {
    (0, monitoring_1.performMonitoringChecks)();
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Monitoring checks will run every 30 seconds`);
    (0, monitoring_1.performMonitoringChecks)();
});
