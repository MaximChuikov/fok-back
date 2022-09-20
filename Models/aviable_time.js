import { Sequelize, Model, DataTypes } from 'sequelize'

class Variant extends Model {}
Variant.init({
    variant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    modelName: 'dog',
    timestamps: false
})