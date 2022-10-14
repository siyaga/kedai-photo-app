module.exports = (sequelize, Sequelize) => {
	const Transaksi = sequelize.define("transaksi", {
		idpenjual: {
			type: Sequelize.INTEGER
		},	
		idpembeli: {
			type: Sequelize.INTEGER
		},	
		idpesanan: {
			type: Sequelize.STRING
		}	,	
        gambar: {
			type: Sequelize.STRING
		},
		judul: {
			type: Sequelize.STRING
		},
		harga: {
			type: Sequelize.STRING
		},
        status: {
			type: Sequelize.STRING
		}
	},{
		paranoid:true,
		deleteAt: 'destroyTime'
	});
	return Transaksi;
};