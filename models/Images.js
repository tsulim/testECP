const Sequelize = require("sequelize");
const db = require("../configs/DBconnection");

const Images = db.define("images", {
	title: {
		type: Sequelize.STRING(45),
	},
	filename: {
		type: Sequelize.STRING(100),
	},
	genre: {
		type: Sequelize.STRING(30),
	},
});

module.exports = Images;