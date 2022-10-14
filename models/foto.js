module.exports = (sequelize, Sequelize) => {
  const Foto = sequelize.define("foto", {
    iduser: {
      type: Sequelize.INTEGER
    },
    gambar: {
      type: Sequelize.STRING,
    },
    judul: {
      type: Sequelize.STRING,
    },
    deskripsi: {
      type: Sequelize.TEXT,
    },
    harga: {
      type: Sequelize.FLOAT,
    }
  }, {
        
    paranoid:true,
    deleteAt: 'destroyTime'
});
  return Foto;
};
